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

type AppointmentHandler struct {
	appointmentService *service.AppointmentService
}

func NewAppointmentHandler(appointmentService *service.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{
		appointmentService: appointmentService,
	}
}

func (h *AppointmentHandler) GetByID(c *echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	ctx := c.Request().Context()

	appointment, err := h.appointmentService.GetByID(ctx, id)
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentResponseFromDomain(appointment))
}

func (h *AppointmentHandler) GetAll(c *echo.Context) error {
	ctx := c.Request().Context()

	number := c.QueryParam("number")
	if number != "" {
		appointmentNumber, err := strconv.Atoi(number)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid number")
		}

		appointment, err := h.appointmentService.GetByNumber(ctx, appointmentNumber)
		if err != nil {
			return mapAppointmentServiceError(err)
		}

		return c.JSON(http.StatusOK, dto.AppointmentResponseFromDomain(appointment))
	}

	appointments, err := h.appointmentService.GetAll(ctx)
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentsResponseFromDomain(appointments))
}

func (h *AppointmentHandler) Create(c *echo.Context) error {
	ctx := c.Request().Context()

	// получаем данные для создания записи
	acr := new(dto.CreateAppointmentRequest)
	if err := c.Bind(acr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment data")
	}

	// Создание записи
	createdAppointment, err := h.appointmentService.Create(ctx, acr.ToDomain())
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.AppointmentResponseFromDomain(createdAppointment))
}

func (h *AppointmentHandler) Update(c *echo.Context) error {
	ctx := c.Request().Context()

	// Получаем данные для обновления записи
	uar := new(dto.UpdateAppointmentRequest)
	if err := c.Bind(uar); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment data")
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	appointment := uar.ToDomain()
	appointment.ID = id

	// Обновляем запись
	updatedAppointment, err := h.appointmentService.Update(ctx, appointment)
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentResponseFromDomain(updatedAppointment))
}

func (h *AppointmentHandler) Cancel(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	appointment, err := h.appointmentService.Cancel(ctx, id)
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentResponseFromDomain(appointment))
}

func (h *AppointmentHandler) Reschedule(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	rr := new(dto.RescheduleAppointmentRequest)
	if err := c.Bind(rr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment data")
	}

	appointment, err := h.appointmentService.Reschedule(ctx, id, rr.Date)
	if err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentResponseFromDomain(appointment))
}

func (h *AppointmentHandler) Delete(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	if err := h.appointmentService.Delete(ctx, id); err != nil {
		return mapAppointmentServiceError(err)
	}

	return c.NoContent(http.StatusNoContent)
}

func mapAppointmentServiceError(err error) error {
	switch {
	case errors.Is(err, service.ErrAppointmentNotFound):
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	case errors.Is(err, service.ErrAppointmentAlreadyExists):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrInvalidAppointmentData):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidAppointmentID):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidAppointmentNumber):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidAppointmentStatus):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	default:
		return fmt.Errorf("appointment service error: %w", err)
	}
}
