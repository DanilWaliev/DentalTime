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

type ServiceHandler struct {
	serviceService service.ServiceService
}

func NewServiceHandler(serviceService service.ServiceService) *ServiceHandler {
	return &ServiceHandler{
		serviceService: serviceService,
	}
}

func (h *ServiceHandler) GetByID(c *echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	ctx := c.Request().Context()

	service, err := h.serviceService.GetByID(ctx, id)
	if err != nil {
		return mapServiceServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ServiceResponseFromDomain(service))
}

func (h *ServiceHandler) GetAll(c *echo.Context) error {
	ctx := c.Request().Context()

	// получаем query параметры
	title := c.QueryParam("title")
	if title != "" {
		service, err := h.serviceService.GetByTitle(ctx, title)
		if err != nil {
			return mapServiceServiceError(err)
		}

		return c.JSON(http.StatusOK, dto.ServiceResponseFromDomain(service))
	}

	// вернуть все услуги
	services, err := h.serviceService.GetAll(ctx)
	if err != nil {
		return mapServiceServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ServicesResponseFromDomain(services))
}

func (h *ServiceHandler) Create(c *echo.Context) error {
	ctx := c.Request().Context()

	// получение данных для создания услуги
	csr := new(dto.CreateServiceRequest)
	if err := c.Bind(csr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid service data")
	}

	// создание услуги
	createdService, err := h.serviceService.Create(ctx, csr.ToDomain())
	if err != nil {
		return mapServiceServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.ServiceResponseFromDomain(createdService))
}

func (h *ServiceHandler) Update(c *echo.Context) error {
	ctx := c.Request().Context()

	// получение данных для обновления услуги
	usr := new(dto.UpdateServiceRequest)
	if err := c.Bind(usr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid service data")
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid service id")
	}

	usr.ID = id

	// обновление данных услуги
	updatedService, err := h.serviceService.Update(ctx, usr.ToDomain())
	if err != nil {
		return mapServiceServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ServiceResponseFromDomain(updatedService))
}

func (h *ServiceHandler) Delete(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid service id")
	}

	if err := h.serviceService.Delete(ctx, id); err != nil {
		return mapServiceServiceError(err)
	}

	return c.NoContent(http.StatusNoContent)
}

func mapServiceServiceError(err error) error {
	switch {
	case errors.Is(err, service.ErrServiceAlreadyExists):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrServiceNotFound):
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	case errors.Is(err, service.ErrInvalidServiceData):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidServiceID):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrInvalidServiceTitle):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	default:
		return fmt.Errorf("service service error: %w", err)
	}
}
