package valorant

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Credentials struct {
	AccessToken  string   `json:"accessToken"`
	Entitlements []string `json:"entitlements"`
	Issuer       string   `json:"issuer"`
	Subject      string   `json:"subject"`
	Token        string   `json:"token"`
}

type Client struct {
	ready bool

	integrationInfo *IntegrationInfo
	credentials     *Credentials
	clientInfo      *ClientInfo

	local *Remote
	glz   *Remote
	pd    *Remote
}

func NewClient() *Client {
	return &Client{
		integrationInfo: NewIntegrationInfo(),
		credentials:     &Credentials{},
		clientInfo:      NewClientInfo(),
	}
}

func (c *Client) Init() bool {
	if err := c.integrationInfo.Read(); err != nil {
		fmt.Println("Reading IntegrationInfo failed")
		return false
	}

	localHost := fmt.Sprintf("%v://127.0.0.1:%v", c.integrationInfo.Protocol, c.integrationInfo.Port)
	localAuth := "Basic " + base64.StdEncoding.EncodeToString([]byte("riot:"+c.integrationInfo.Password))
	c.local = NewRemote(localHost, func(req *http.Request) {
		req.Header.Set("Authorization", localAuth)
	})

	if err := c.clientInfo.Read(); err != nil {
		fmt.Println("Reading ClientInfo failed")
		return false
	}

	if err := c.fetchCredentials(); err != nil {
		fmt.Println("Fetching Credentials failed")
		return false
	}

	c.buildRemotes()

	c.ready = true
	return true
}

func (c *Client) buildRemotes() {
	platformDetails := map[string]string{
		"platformType":      "PC",
		"platformOS":        "Windows",
		"platformOSVersion": "10.0.19042.1.256.64bit",
		"platformChipset":   "Unknown",
	}
	platformJSON, _ := json.Marshal(platformDetails)
	platform := base64.StdEncoding.EncodeToString(platformJSON)
	interceptor := func(req *http.Request) {
		req.Header.Set("Authorization", "Bearer "+c.credentials.AccessToken)
		req.Header.Set("X-Riot-Entitlements-JWT", c.credentials.Token)
		req.Header.Set("X-Riot-ClientPlatform", platform)
		req.Header.Set("X-Riot-ClientVersion", c.clientInfo.Version)
		req.Header.Set("User-Agent", "ShooterGame/13 Windows/10.0.19043.1.256.64bit")
	}

	c.glz = NewRemote(c.clientInfo.GlzHost, interceptor)
	c.pd = NewRemote(c.clientInfo.PdHost, interceptor)
}

func (c *Client) fetchCredentials() error {
	resp, err := c.local.get("/entitlements/v1/token")

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&c.credentials); err != nil {
		return err
	}

	return nil
}

func (c *Client) getRemotely(r *Remote, url string) *string {
	resp, err := r.get(url)

	if err != nil {
		fmt.Printf("Request Error: %v\n", err.Error())
		return nil
	}

	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)

	if err != nil {
		fmt.Printf("Request Reading Stream: %v\n", err.Error())
		return nil
	}

	response := string(bodyBytes)

	return &response
}

func (c *Client) GetLocal(url string) *string {
	return c.getRemotely(c.local, url)
}

func (c *Client) GetGlz(url string) *string {
	return c.getRemotely(c.glz, url)
}

func (c *Client) GetPd(url string) *string {
	return c.getRemotely(c.pd, url)
}

func (c *Client) Test() *string {
	if !c.ready {
		return nil
	}

	txt := "It works!"

	return &txt
}
