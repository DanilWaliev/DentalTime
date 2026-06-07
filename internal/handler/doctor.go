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

type DoctorHandler struct {
	doctorService *service.DoctorService
}

func NewDoctorHandler(doctorService *service.DoctorService) *DoctorHandler {
	return &DoctorHandler{
		doctorService: doctorService,
	}
}

func (h *DoctorHandler) GetByID(c *echo.Context) error {
	// получение и парсинг id
	id, err := strconv.Atoi(c.Param("id"))
	// проверка id
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}
	if id <= 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	ctx := c.Request().Context()

	doctor, err := h.doctorService.GetByID(ctx, id)
	if err != nil {
		return mapServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorResponseFromDomain(doctor))
}

func (h *DoctorHandler) GetAll(c *echo.Context) error {
	ctx := c.Request().Context()

	doctors, err := h.doctorService.GetAll(ctx)
	if err != nil {
		return mapServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorsResponseFromDomain(doctors))
}

func (h *DoctorHandler) Create(c *echo.Context) error {
	ctx := c.Request().Context()

	// получение данных для создания врача
	cdr := new(dto.CreateDoctorRequest)
	if err := c.Bind(cdr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor data")
	}

	// создание врача
	createdDoctor, err := h.doctorService.Create(ctx, cdr.ToDomain())
	if err != nil {
		return mapServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.DoctorResponseFromDomain(createdDoctor))
}

func mapServiceError(err error) error {
	switch {
	case errors.Is(err, service.ErrDoctorNotFound):
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	case errors.Is(err, service.ErrDoctorAlreadyExists):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrInvalidDoctorData):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	default:
		return fmt.Errorf("doctor service error: %w", err)
	}
}
