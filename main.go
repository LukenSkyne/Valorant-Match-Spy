package main

import (
	"embed"
	"match-spy/valorant"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	client := valorant.NewClient()

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "Valorant Match Spy",
		Width:     1024,
		Height:    768,
		Assets:    assets,
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
			client,
		},
	})

	if err != nil {
		println("Error:", err)
	}
}
