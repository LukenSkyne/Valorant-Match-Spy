package valorant

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.uber.org/zap"
	"net/http"
	"strings"
)

type ConnectionInfo struct {
	Protocol          string
	Host              string
	Port              string
	Auth              *string
	SubscribeToEvents []string
}

type WebSocket struct {
	log *zap.SugaredLogger
	ctx context.Context
}

func NewWebSocket(log *zap.SugaredLogger, ctx context.Context) *WebSocket {
	return &WebSocket{
		log: log,
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
		w.log.Fatalf("WebSocket dial error: %v", err.Error())

		return
	}

	go func() {
		for _, eventName := range ci.SubscribeToEvents {
			msg := fmt.Sprintf("[5, %q]", eventName)
			w.log.Debugw("WebSocket subscription", "Event", eventName, "Message", msg)

			if err := conn.WriteMessage(1, []byte(msg)); err != nil {
				w.log.Errorf("WriteMessage: %v", err.Error())

				return
			}
		}

		w.log.Info("WebSocket listening")

		for true {
			var messageBuffer []byte
			msgType, messageBuffer, err := conn.ReadMessage()

			if msgType == -1 {
				w.log.Info("WebSocket closed")
				break
			} else if msgType != websocket.TextMessage {
				w.log.Debugf("Invalid msgType: %v", msgType)
				continue
			}

			if err != nil {
				w.log.Errorf("ReadMessage: %v", err.Error())
				break
			}

			message := string(messageBuffer)

			if message == "" {
				w.log.Debug("WebSocket subscription successful")
				continue
			}

			if split := strings.SplitN(message, "\"", 3); len(split) > 1 {
				w.log.Debugf("WebSocket message: %v", split[1])
			} else {
				w.log.Errorf("Invalid WebSocket message: %v", message)
			}

			runtime.EventsEmit(w.ctx, "wsMsg", message)
		}

		conn.Close()
		runtime.EventsEmit(w.ctx, "wsClose")
	}()
}
