package handler

import (
	"dental-time/internal/dto"
	"dental-time/internal/service"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

	specialization := c.QueryParam("specialization")
	if specialization != "" {
		doctors, err := h.doctorService.GetBySpecialization(ctx, specialization)
		if err != nil {
			return mapDoctorServiceError(err)
		}

		return c.JSON(http.StatusOK, dto.DoctorsResponseFromDomain(doctors))
	}

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
		return mapServiceServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.ServicesResponseFromDomain(services))
}

func (h *DoctorHandler) GetCalendar(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	days, err := h.doctorService.GetCalendar(ctx, id, c.QueryParam("month"))
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentCalendarResponseFromDomain(days))
}

func (h *DoctorHandler) GetSlots(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	slots, err := h.doctorService.GetSlots(ctx, id, c.QueryParam("date"))
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.AppointmentSlotsResponseFromDomain(slots))
}

func (h *DoctorHandler) Update(c *echo.Context) error {
	ctx := c.Request().Context()

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

	cdr := new(dto.CreateDoctorRequest)
	if err := c.Bind(cdr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor data")
	}

	createdDoctor, err := h.doctorService.Create(ctx, cdr.ToDomain())
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusCreated, dto.DoctorResponseFromDomain(createdDoctor))
}

func (h *DoctorHandler) AddService(c *echo.Context) error {
	ctx := c.Request().Context()

	doctorID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	asr := new(dto.AddServiceRequest)
	if err := c.Bind(asr); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid add service id")
	}

	if err := h.doctorService.AddService(ctx, doctorID, asr.ServiceID); err != nil {
		return mapDoctorServiceError(err)
	}

	return c.NoContent(http.StatusCreated)
}

func (h *DoctorHandler) DeleteService(c *echo.Context) error {
	ctx := c.Request().Context()

	doctorID, err := strconv.Atoi(c.Param("doctorId"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	serviceID, err := strconv.Atoi(c.Param("serviceId"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid service id")
	}

	if err := h.doctorService.DeleteService(ctx, doctorID, serviceID); err != nil {
		return mapDoctorServiceError(err)
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *DoctorHandler) UploadPhoto(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	doctor, err := h.doctorService.GetByID(ctx, id)
	if err != nil {
		return mapDoctorServiceError(err)
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid photo")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid photo extension")
	}

	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid photo")
	}
	defer src.Close()

	dir := filepath.Join("web", "uploads", "doctors")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create doctors upload dir: %w", err)
	}

	filename := fmt.Sprintf("doctor_%d_%d%s", id, time.Now().Unix(), ext)
	path := filepath.Join(dir, filename)

	dst, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create doctor photo: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("save doctor photo: %w", err)
	}

	doctor.PhotoURL = "/static/uploads/doctors/" + filename

	updatedDoctor, err := h.doctorService.Update(ctx, *doctor)
	if err != nil {
		return mapDoctorServiceError(err)
	}

	return c.JSON(http.StatusOK, dto.DoctorResponseFromDomain(updatedDoctor))
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
	case errors.Is(err, service.ErrServiceAlreadyAssigned):
		return echo.NewHTTPError(http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrInvalidAppointmentDate):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	default:
		return fmt.Errorf("doctor service error: %w", err)
	}
}
