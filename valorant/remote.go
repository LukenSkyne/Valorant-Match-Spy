package valorant

import (
	"bytes"
	"crypto/tls"
	"errors"
	"go.uber.org/zap"
	"io"
	"net/http"
)

type Remote struct {
	log          *zap.SugaredLogger
	host         string
	client       *http.Client
	reqIntercept func(req *http.Request)
}

func NewRemote(log *zap.SugaredLogger, host string, reqIntercept func(req *http.Request)) *Remote {
	return &Remote{
		log:  log,
		host: host,
		client: &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
			}},
		reqIntercept: reqIntercept,
	}
}

func (r *Remote) get(url string) (*http.Response, error) {
	return r.request(http.MethodGet, url, nil)
}

func (r *Remote) request(method string, url string, payload *string) (*http.Response, error) {
	var body io.Reader = nil

	if payload != nil {
		body = bytes.NewBuffer([]byte(*payload))
	}

	req, err := http.NewRequest(method, r.host+url, body)

	if err != nil {
		return nil, err
	}

	r.reqIntercept(req)
	resp, err := r.client.Do(req)

	if err != nil {
		return nil, err
	}

	r.log.Debugw("Request",
		"Code", resp.StatusCode,
		"Host", r.host,
		"Path", url)

	if resp.StatusCode > 299 {
		resp.Body.Close()

		return nil, errors.New("request failed")
	}

	return resp, nil
}
