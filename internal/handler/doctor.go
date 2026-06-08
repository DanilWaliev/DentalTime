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
	doctorService  *service.DoctorService
	serviceService *service.ServiceService
}

func NewDoctorHandler(doctorService *service.DoctorService, serviceService *service.ServiceService) *DoctorHandler {
	return &DoctorHandler{
		doctorService:  doctorService,
		serviceService: serviceService,
	}
}

func (h *DoctorHandler) GetByID(c *echo.Context) error {
	// получение и парсинг id
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	ctx := c.Request().Context()

	doctor, err := h.doctorService.GetByID(ctx, id)
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorResponseFromDomain(doctor))
}

func (h *DoctorHandler) GetAll(c *echo.Context) error {
	ctx := c.Request().Context()

	// получаем query параметры
	specialization := c.QueryParam("specialization")
	if specialization != "" {
		doctors, err := h.doctorService.GetBySpecialization(ctx, specialization)
		if err != nil {
			return mapDoctorServiceError(err)
		}

		return c.JSON(http.StatusOK, dto.DoctorsResponseFromDomain(doctors))
	}

	// вернуть всех врачей
	doctors, err := h.doctorService.GetAll(ctx)
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorsResponseFromDomain(doctors))
}

func (h *DoctorHandler) GetServices(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	services, err := h.serviceService.GetByDoctorID(ctx, id)
	if err != nil {
		mapServiceServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ServicesResponseFromDomain(services))
}

func (h *DoctorHandler) Update(c *echo.Context) error {
	ctx := c.Request().Context()

	// получение данных для обновления врача
	udr := new(dto.UpdateDoctorRequest)
	if err := c.Bind(udr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor data")
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	doctor := udr.ToDomain()
	doctor.ID = id

	// обновление данные врача
	updatedDoctor, err := h.doctorService.Update(ctx, doctor)
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorResponseFromDomain(updatedDoctor))
}

func (h *DoctorHandler) Delete(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	if err := h.doctorService.Delete(ctx, id); err != nil {
		return mapDoctorServiceError(err)
	}

	return c.NoContent(http.StatusNoContent)
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
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.DoctorResponseFromDomain(createdDoctor))
}

func mapDoctorServiceError(err error) error {
	switch {
	case errors.Is(err, service.ErrDoctorNotFound):
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	case errors.Is(err, service.ErrDoctorAlreadyExists):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrInvalidDoctorData):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidDoctorID):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidDoctorSpecialization):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	default:
		return fmt.Errorf("doctor service error: %w", err)
	}
}
