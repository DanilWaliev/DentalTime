package middleware

import (
	"dental-time/internal/service"
	"net/http"

	"github.com/labstack/echo/v5"
)

const managerCookieName = "manager_token"

func RequireManager(managerService *service.ManagerService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			cookie, err := c.Cookie(managerCookieName)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
			}

			claims, err := managerService.ValidateToken(cookie.Value)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
			}

			c.Set("manager_login", claims.Sub)
			return next(c)
		}
	}
}
