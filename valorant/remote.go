package valorant

import (
	"crypto/tls"
	"net/http"
)

type Remote struct {
	host         string
	client       *http.Client
	reqIntercept func(req *http.Request)
}

func NewRemote(host string, reqIntercept func(req *http.Request)) *Remote {
	return &Remote{
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
	req, err := http.NewRequest("GET", r.host+url, nil)

	if err != nil {
		return nil, err
	}

	r.reqIntercept(req)
	resp, err := r.client.Do(req)

	if err != nil {
		return nil, err
	}

	return resp, nil
}
