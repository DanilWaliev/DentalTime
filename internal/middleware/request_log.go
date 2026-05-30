package middleware

import (
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func RequestLogger() echo.MiddlewareFunc {
	return middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus:   true,
		LogURI:      true,
		LogMethod:   true,
		HandleError: true,
		LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
			if v.Error != nil {
				slog.Error("Request error",
					slog.String("Method", v.Method),
					slog.String("URI", v.URI),
					slog.String("Status", http.StatusText(v.Status)),
					slog.Any("Error", v.Error),
				)
			} else {
				slog.Info("Incoming request",
					slog.String("Method", v.Method),
					slog.String("URI", v.URI),
					slog.String("Status", http.StatusText(v.Status)),
				)
			}

			return nil
		},
	})
}
