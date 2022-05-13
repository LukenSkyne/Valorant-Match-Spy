package valorant

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.uber.org/zap"
	"io"
	"match-spy/internal/utils"
	"net/http"
	"time"
)

type Credentials struct {
	AccessToken  string   `json:"accessToken"`
	Entitlements []string `json:"entitlements"`
	Issuer       string   `json:"issuer"`
	Subject      string   `json:"subject"`
	Token        string   `json:"token"`
	IssuedAt     time.Time
	ExpiresAt    time.Time
}

type Client struct {
	ctx      *context.Context
	log      *zap.SugaredLogger
	ready    bool
	initChan chan bool

	selfUpdater     *utils.SelfUpdater
	integrationInfo *IntegrationInfo
	integration     *utils.WebSocket
	credentials     *Credentials
	clientInfo      *ClientInfo

	local  *utils.Remote
	shared *utils.Remote
	glz    *utils.Remote
	pd     *utils.Remote
}

func NewClient(log *zap.SugaredLogger) *Client {
	return &Client{
		log:             log,
		initChan:        make(chan bool),
		selfUpdater:     utils.NewSelfUpdater(log),
		integrationInfo: NewIntegrationInfo(),
		credentials:     &Credentials{},
		clientInfo:      NewClientInfo(),
	}
}

func (c *Client) OnStartup(ctx context.Context) {
	c.ctx = &ctx

	if c.integration != nil {
		c.integration.Ctx = &ctx
	}

	c.selfUpdater.CheckForUpdate()
	runtime.WindowSetTitle(ctx, "Valorant Match Spy v"+c.selfUpdater.GetCurrentVersion())
}

func (c *Client) GetLatestVersion() *string {
	if c.selfUpdater.CheckForUpdate() {
		versionString := c.selfUpdater.GetLatestVersion()

		return &versionString
	}

	return nil
}

func (c *Client) PerformSelfUpdate() {
	if c.ctx != nil && c.selfUpdater.DoSelfUpdate() {
		runtime.Quit(*c.ctx)
	}
}

func (c *Client) Run() {
	go func() {
		c.initChan <- true
	}()

	for {
		select {
		case v, ok := <-c.initChan:
			if !ok {
				c.log.Info("Init Channel closed")
				return
			}

			if v {
				c.log.Debug("Init requested")
			}

			if c.ready && c.ctx != nil {
				runtime.EventsEmit(*c.ctx, "state", false)
			}

			if c.init() == false {
				go func() {
					time.Sleep(time.Second * 3)
					c.initChan <- false
				}()
			}
		}
	}
}

func (c *Client) Stop() {
	close(c.initChan)
}

func (c *Client) init() bool {
	c.ready = false

	if err := c.integrationInfo.Read(); err != nil {
		//c.log.Info("Reading IntegrationInfo failed")
		return false
	}

	c.log.Infow("Integration Info",
		"Port", c.integrationInfo.Port,
		"Password", c.integrationInfo.Password)

	if err := c.clientInfo.Read(); err != nil {
		c.log.Errorf("Reading ClientInfo failed: %v", err.Error())
		return false
	}

	c.log.Infow("Client Info",
		"Version", c.clientInfo.Version,
		"GlzHost", c.clientInfo.GlzHost,
		"PdHost", c.clientInfo.PdHost)

	localHost := fmt.Sprintf("%v://127.0.0.1:%v", c.integrationInfo.Protocol, c.integrationInfo.Port)
	localAuth := "Basic " + base64.StdEncoding.EncodeToString([]byte("riot:"+c.integrationInfo.Password))

	c.integration = utils.NewWebSocket(c.log, c.initChan)
	c.integration.Connect(utils.ConnectionInfo{
		Protocol: "wss",
		Host:     "localhost",
		Port:     c.integrationInfo.Port,
		Auth:     &localAuth,
		SubscribeToEvents: []string{
			"OnJsonApiEvent_entitlements_v1_token",
			"OnJsonApiEvent_chat_v4_presences",
			"OnJsonApiEvent_chat_v6_conversations",
		},
	})
	c.integration.Ctx = c.ctx

	c.local = utils.NewRemote(c.log, localHost, func(req *http.Request) {
		req.Header.Set("Authorization", localAuth)
	})

	if err := c.fetchCredentials(); err != nil {
		c.log.Errorf("Fetching Credentials failed: %v", err.Error())
		return false
	}

	c.log.Infow("Credentials",
		"Subject", c.credentials.Subject,
		"IssuedAt", c.credentials.IssuedAt,
		"ExpiresAt", c.credentials.ExpiresAt)

	c.ready = true

	if c.ctx != nil {
		runtime.EventsEmit(*c.ctx, "state", true)
	}

	return true
}

func (c *Client) fetchCredentials() error {
	resp, err := c.local.Get("/entitlements/v1/token")

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&c.credentials); err != nil {
		return err
	}

	if err := c.parseCredentials(); err != nil {
		return err
	}

	c.buildRemotes()

	return nil
}

func (c *Client) buildRemotes() {
	platformDetails := map[string]string{
		"platformType":      "PC",
		"platformOS":        "Windows",
		"platformOSVersion": "10.0.22000.1.256.64bit",
		"platformChipset":   "Unknown",
	}
	platformJSON, _ := json.Marshal(platformDetails)
	platform := base64.StdEncoding.EncodeToString(platformJSON)
	interceptor := func(req *http.Request) {
		req.Header.Set("Authorization", "Bearer "+c.credentials.AccessToken)
		req.Header.Set("X-Riot-Entitlements-JWT", c.credentials.Token)
		req.Header.Set("X-Riot-ClientPlatform", platform)
		req.Header.Set("X-Riot-ClientVersion", c.clientInfo.Version)
		req.Header.Set("User-Agent", "ShooterGame/13 Windows/10.0.22000.1.256.64bit")
	}

	c.shared = utils.NewRemote(c.log, c.clientInfo.SharedHost, interceptor)
	c.glz = utils.NewRemote(c.log, c.clientInfo.GlzHost, interceptor)
	c.pd = utils.NewRemote(c.log, c.clientInfo.PdHost, interceptor)
}

func (c *Client) parseCredentials() error {
	claims, err := extractClaims(c.credentials.AccessToken)

	if err != nil {
		return err
	}

	iatRaw := (*claims)["iat"]

	switch iatRaw.(type) {
	case float64:
		c.credentials.IssuedAt = time.Unix(int64(iatRaw.(float64)), 0)
		break
	default:
		return errors.New("unexpected type for iat")
	}

	expRaw := (*claims)["exp"]

	switch expRaw.(type) {
	case float64:
		c.credentials.ExpiresAt = time.Unix(int64(expRaw.(float64)), 0)
		break
	default:
		return errors.New("unexpected type for exp")
	}

	return nil
}

func extractClaims(tokenString string) (*jwt.MapClaims, error) {
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return nil, err
	}

	return &claims, nil
}

func (c *Client) requestRemotely(r *utils.Remote, method string, url string, payload *string) *string {
	if !c.ready {
		return nil
	}

	if c.credentials.ExpiresAt.Sub(time.Now()) < time.Second*30 {
		c.log.Info("Refreshing credentials (token expires shortly)")

		if err := c.fetchCredentials(); err != nil {
			c.log.Fatalf("Refreshing credentials failed: %v", err.Error())
		}
	}

	resp, err := r.Request(method, url, payload)

	if err != nil {
		c.log.Errorf("Request Error: %v", err.Error())
		return nil
	}

	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)

	if err != nil {
		c.log.Fatalf("Reading Response Stream: %v", err.Error())
		return nil
	}

	response := string(bodyBytes)

	return &response
}

func (c *Client) SelfID() *string {
	if !c.ready {
		return nil
	}

	uuid := c.credentials.Subject

	return &uuid
}

func (c *Client) GetLocal(url string) *string {
	return c.requestRemotely(c.local, http.MethodGet, url, nil)
}

func (c *Client) GetGlz(url string) *string {
	return c.requestRemotely(c.glz, http.MethodGet, url, nil)
}

func (c *Client) GetPd(url string) *string {
	return c.requestRemotely(c.pd, http.MethodGet, url, nil)
}

func (c *Client) PutPd(url string, payload string) *string {
	return c.requestRemotely(c.pd, http.MethodPut, url, &payload)
}

func (c *Client) GetShared(url string) *string {
	return c.requestRemotely(c.shared, http.MethodGet, url, nil)
}
