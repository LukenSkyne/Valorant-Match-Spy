package valorant

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"net/http"
)

type ConnectionInfo struct {
	Protocol          string
	Host              string
	Port              string
	Auth              *string
	SubscribeToEvents []string
}

type WebSocket struct {
	ctx context.Context
}

func NewWebSocket(ctx context.Context) *WebSocket {
	return &WebSocket{
		ctx: ctx,
	}
}

func (w *WebSocket) Connect(ci ConnectionInfo) {
	dialer := *websocket.DefaultDialer
	dialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	var header http.Header = nil

	if ci.Auth != nil {
		header = http.Header{
			"Authorization": {
				*ci.Auth,
			},
		}
	}

	addr := fmt.Sprintf("%v://%v:%v", ci.Protocol, ci.Host, ci.Port)
	conn, _, err := dialer.Dial(addr, header) // ignore response since it is guaranteed to be an upgrade if it succeeds

	if err != nil {
		fmt.Println("dial:", err)

		return
	}

	go func() {
		for _, eventName := range ci.SubscribeToEvents {
			msg := fmt.Sprintf("[5, \"%v\"]", eventName)

			fmt.Println("Subscribing to:", eventName, msg)

			if err := conn.WriteMessage(1, []byte(msg)); err != nil {
				fmt.Println("WriteMessage error:", err.Error())
				return
			}
		}

		fmt.Println("WebSocket Client listening")

		for true {
			var messageBuffer []byte
			msgType, messageBuffer, err := conn.ReadMessage()

			if msgType == -1 {
				fmt.Println("Closing Connection")
				break
			} else if msgType != websocket.TextMessage {
				fmt.Println("Invalid msgType:", msgType)
				continue
			}

			if err != nil {
				fmt.Println("conn.ReadMessage error:", err.Error())
				break
			}

			message := string(messageBuffer)

			if message == "" {
				continue
			}

			fmt.Println("WebSocket message:", message)
			runtime.EventsEmit(w.ctx, "WS", message)
		}

		defer conn.Close()
	}()
}
