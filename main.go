package main

import (
	"embed"
	"go.uber.org/zap/zapcore"
	"match-spy/utils"
	"match-spy/valorant"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"go.uber.org/zap"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	config := zap.NewDevelopmentConfig()
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, _ := config.Build()
	defer logger.Sync()
	log := logger.Sugar()

	client := valorant.NewClient(log)
	utility := utils.NewUtility(log)

	go client.Run()

	log.Info("Starting app")

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "Valorant Match Spy",
		Width:     1024,
		Height:    768,
		MinWidth:  1024,
		MinHeight: 768,
		Assets:    assets,
		OnStartup: client.OnStartup,
		Bind: []interface{}{
			client,
			utility,
		},
	})

	client.Stop()

	if err != nil {
		log.Fatalf("Error running app: %v", err.Error())
	}
}
