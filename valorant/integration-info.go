package valorant

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

type IntegrationInfo struct {
	name      string
	processId string
	Port      string
	Password  string
	Protocol  string
}

func NewIntegrationInfo() *IntegrationInfo {
	return &IntegrationInfo{}
}

func (i *IntegrationInfo) Read() error {
	localAppData := os.Getenv("LOCALAPPDATA")
	lockfilePath := fmt.Sprintf("%v\\Riot Games\\Riot Client\\Config\\lockfile", localAppData)

	lockfileContent, err := ioutil.ReadFile(lockfilePath)

	if err != nil {
		return err
	}

	s := strings.Split(string(lockfileContent), ":")

	i.name = s[0]
	i.processId = s[1]
	i.Port = s[2]
	i.Password = s[3]
	i.Protocol = s[4]

	return nil
}
