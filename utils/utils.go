package utils

import (
	"fmt"
	"os"
	"time"
)

type Utility struct {
}

func NewUtility() *Utility {
	return &Utility{}
}

func (u *Utility) SaveLog(name string, content string) {
	t := time.Now()
	fileName := fmt.Sprintf("%v_%v.json", t.Format("2006.01.02_15-04-05"), name)
	filePath := fmt.Sprintf("C:/Users/Luken/Downloads/requests/%v", fileName)

	fmt.Printf("Saving Log: %v\n", fileName)

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		fmt.Printf("Error Writing to file: %v\n", err.Error())
	}
}
