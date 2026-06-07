package handler

import (
	"dental-time/internal/service"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"
)

type DoctorHandler struct {
	doctorService *service.DoctorService
}

func (h *DoctorHandler) Get(c *echo.Context) error {
	// получение и парсинг id
	id, err := strconv.Atoi(c.Param("id"))
	// проверка id
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}
	if id <= 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	// получение контекста
	ctx := c.Request().Context()

	doctor, err := h.doctorService.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, service.ErrDoctorNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, "doctor not found")
		}
		return fmt.Errorf("get doctor by id: %w", err)
	}

	return c.JSON(http.StatusOK, doctor)
}
