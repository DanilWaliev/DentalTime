package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
	"strings"
)

var (
	ErrAppointmentNotFound      = errors.New("appointment not found")
	ErrAppointmentAlreadyExists = errors.New("appointment already exists")
	ErrInvalidAppointmentID     = errors.New("invalid appointment id")
	ErrInvalidAppointmentNumber = errors.New("invalid appointment number")
	ErrInvalidAppointmentData   = errors.New("invalid appointment data")
	ErrInvalidAppointmentStatus = errors.New("invalid appointment status")
)

type AppointmentRepository interface {
	GetAll(ctx context.Context) ([]*domain.Appointment, error)
	GetByID(ctx context.Context, id int) (*domain.Appointment, error)
	GetByNumber(ctx context.Context, number int) (*domain.Appointment, error)
	Create(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error)
	Update(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error)
	Delete(ctx context.Context, id int) error
}

type AppointmentService struct {
	appointmentRepo AppointmentRepository
}

func NewAppointmentService(appointmentRepo AppointmentRepository) *AppointmentService {
	return &AppointmentService{
		appointmentRepo: appointmentRepo,
	}
}

func (s *AppointmentService) GetAll(ctx context.Context) ([]*domain.Appointment, error) {
	return s.appointmentRepo.GetAll(ctx)
}

func (s *AppointmentService) GetByID(ctx context.Context, id int) (*domain.Appointment, error) {
	if id <= 0 {
		return nil, ErrInvalidAppointmentID
	}

	return s.appointmentRepo.GetByID(ctx, id)
}

func (s *AppointmentService) GetByNumber(ctx context.Context, number int) (*domain.Appointment, error) {
	if number <= 0 {
		return nil, ErrInvalidAppointmentNumber
	}

	return s.appointmentRepo.GetByNumber(ctx, number)
}

func (s *AppointmentService) Create(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error) {
	appointment.Status = strings.TrimSpace(appointment.Status)
	appointment.PatientFirstName = strings.TrimSpace(appointment.PatientFirstName)
	appointment.PatientPhoneNumber = normalizePhoneNumber(appointment.PatientPhoneNumber)
	appointment.Date = strings.TrimSpace(appointment.Date)
	if appointment.PatientFirstName == "" || appointment.PatientPhoneNumber == "" || appointment.Date == "" || appointment.ServiceID <= 0 || appointment.DoctorID <= 0 {
		return nil, ErrInvalidAppointmentData
	}

	if appointment.Status == "" {
		appointment.Status = "Ожидает"
	}

	if len(appointment.PatientPhoneNumber) != 11 {
		return nil, ErrInvalidAppointmentData
	}

	return s.appointmentRepo.Create(ctx, appointment)
}

func (s *AppointmentService) Update(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error) {
	appointment.Status = strings.TrimSpace(appointment.Status)
	appointment.PatientFirstName = strings.TrimSpace(appointment.PatientFirstName)
	appointment.PatientPhoneNumber = normalizePhoneNumber(appointment.PatientPhoneNumber)
	appointment.Date = strings.TrimSpace(appointment.Date)
	if appointment.ID <= 0 || appointment.PatientFirstName == "" || appointment.PatientPhoneNumber == "" || appointment.Date == "" || appointment.ServiceID <= 0 || appointment.DoctorID <= 0 || appointment.Status == "" {
		return nil, ErrInvalidAppointmentData
	}

	if appointment.Status != "Ожидает" && appointment.Status != "Подтверждена" && appointment.Status != "Отменена" {
		return nil, ErrInvalidAppointmentStatus
	}

	if len(appointment.PatientPhoneNumber) != 11 {
		return nil, ErrInvalidAppointmentData
	}

	return s.appointmentRepo.Update(ctx, appointment)
}

func (s *AppointmentService) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return ErrInvalidAppointmentID
	}

	return s.appointmentRepo.Delete(ctx, id)
}

func normalizePhoneNumber(phone string) string {
	var builder strings.Builder

	for _, char := range phone {
		if char >= '0' && char <= '9' {
			builder.WriteRune(char)
		}
	}

	return builder.String()
}
