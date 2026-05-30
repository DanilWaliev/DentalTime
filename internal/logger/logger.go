package logger

import (
	"context"
	"fmt"
	"log/slog"
)

type LogHandler struct{}

func (h *LogHandler) Enabled(context.Context, slog.Level) bool { return true }
func (h *LogHandler) WithAttrs(attrs []slog.Attr) slog.Handler { return h }
func (h *LogHandler) WithGroup(name string) slog.Handler       { return h }

func (h *LogHandler) Handle(ctx context.Context, r slog.Record) error {
	timeStr := r.Time.Format("15:04:05")
	out := fmt.Sprintf("[%s] %-5s - %-18s", timeStr, r.Level.String(), r.Message)

	r.Attrs(func(a slog.Attr) bool {
		out += fmt.Sprintf(" %s=%v", a.Key, a.Value.Any())
		return true
	})

	fmt.Println(out)
	return nil
}

func NewLogger() *slog.Logger {
	myLogger := slog.New(&LogHandler{})
	return myLogger
}
