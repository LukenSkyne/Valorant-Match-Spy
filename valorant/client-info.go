package valorant

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strings"
)

type ClientInfo struct {
	Version string
	GlzHost string
	PdHost  string
}

func NewClientInfo() *ClientInfo {
	return &ClientInfo{}
}

func (c *ClientInfo) Read() error {
	localAppData := os.Getenv("LOCALAPPDATA")
	logPath := fmt.Sprintf("%v\\VALORANT\\Saved\\Logs\\ShooterGame.log", localAppData)

	f, err := os.Open(logPath)

	if err != nil {
		return err
	}

	defer f.Close()

	scanner := bufio.NewScanner(f)

	versionLookup := "CI server version:"
	glzRegex := regexp.MustCompile("https://glz-([\\w\\d-.]+)\\.a\\.pvp\\.net")
	pdRegex := regexp.MustCompile("https://pd\\.(\\w+)\\.a\\.pvp\\.net")

	for scanner.Scan() {
		line := scanner.Text()

		if i := strings.Index(line, versionLookup); i != -1 {
			// line with Version
			c.Version = strings.TrimSpace(line[i+len(versionLookup):])
			c.Version = strings.Join(insert(strings.Split(c.Version, "-"), 2, "shipping"), "-")

			fmt.Printf("Version '%v'\n", c.Version)
		} else if strings.Index(line, "Session_ReConnect") != -1 {
			// line with glz host
			c.GlzHost = glzRegex.FindString(line)

			fmt.Printf("GlzHost '%v'\n", c.GlzHost)
		} else if strings.Index(line, "AccountXP_GetPlayer") != -1 {
			// line with pd host
			c.PdHost = pdRegex.FindString(line)

			fmt.Printf("PdHost '%v'\n", c.PdHost)
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Printf("Scanner Error: %v", err.Error())
	}

	return nil
}

// utility function to insert an element into a slice @ index
func insert(s []string, index int, value string) []string {
	s = append(s, "")
	copy(s[index+1:], s[index:])
	s[index] = value

	return s
}
