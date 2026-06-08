package handler

import (
	"dental-time/internal/dto"
	"dental-time/internal/service"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"
)

const managerCookieName = "manager_token"

type AuthHandler struct {
	managerService *service.ManagerService
}

func NewAuthHandler(managerService *service.ManagerService) *AuthHandler {
	return &AuthHandler{
		managerService: managerService,
	}
}

func (h *AuthHandler) Login(c *echo.Context) error {
	ctx := c.Request().Context()

	lr := new(dto.LoginRequest)
	if err := c.Bind(lr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid login data")
	}

	login := lr.Login
	if login == "" {
		login = lr.Username
	}

	token, err := h.managerService.Login(ctx, login, lr.Password)
	if err != nil {
		return mapManagerServiceError(err)
	}

	c.SetCookie(&http.Cookie{
		Name:     managerCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(h.managerService.TokenTTL().Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h *AuthHandler) Logout(c *echo.Context) error {
	c.SetCookie(&http.Cookie{
		Name:     managerCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	return c.NoContent(http.StatusNoContent)
}

func (h *AuthHandler) GetManagers(c *echo.Context) error {
	ctx := c.Request().Context()

	managers, err := h.managerService.GetAll(ctx)
	if err != nil {
		return mapManagerServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ManagersResponseFromDomain(managers))
}

func (h *AuthHandler) CreateManager(c *echo.Context) error {
	ctx := c.Request().Context()

	cmr := new(dto.CreateManagerRequest)
	if err := c.Bind(cmr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid manager data")
	}

	manager, err := h.managerService.Create(ctx, cmr.Login, cmr.Password)
	if err != nil {
		return mapManagerServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.ManagerResponseFromDomain(manager))
}

func (h *AuthHandler) DeleteManager(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid manager id")
	}

	if err := h.managerService.Delete(ctx, id); err != nil {
		return mapManagerServiceError(err)
	}

	return c.NoContent(http.StatusNoContent)
}

func mapManagerServiceError(err error) error {
	switch {
	case errors.Is(err, service.ErrManagerNotFound):
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	case errors.Is(err, service.ErrManagerAlreadyExists):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrInvalidManagerData):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidManagerCredentials):
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	case errors.Is(err, service.ErrInvalidJWTToken):
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	default:
		return fmt.Errorf("manager service error: %w", err)
	}
}
