package utils

import (
	"fmt"
	"go.uber.org/zap"
	"os"
	"time"
)

type Utility struct {
	log *zap.SugaredLogger
}

func NewUtility(log *zap.SugaredLogger) *Utility {
	return &Utility{
		log: log,
	}
}

// currently not exported, mostly required to explore responses from the Client API
func (u *Utility) saveLog(name string, content string) {
	t := time.Now()
	fileName := fmt.Sprintf("%v_%v.json", t.Format("2006.01.02_15-04-05"), name)
	filePath := fmt.Sprintf("C:/Users/Luken/Downloads/requests/%v", fileName)

	u.log.Infof("Saving Log: %v", fileName)

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		u.log.Errorf("Error Writing to file: %v", err.Error())
	}
}
