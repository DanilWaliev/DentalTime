package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
	"fmt"
	"strings"
	"time"
)

var (
	ErrDoctorNotFound              = errors.New("doctor not found")
	ErrDoctorAlreadyExists         = errors.New("doctor already exists")
	ErrInvalidDoctorData           = errors.New("invalid doctor data")
	ErrInvalidDoctorID             = errors.New("invalid doctor id")
	ErrInvalidDoctorSpecialization = errors.New("invalid doctor specialization")
	ErrServiceAlreadyAssigned      = errors.New("service is already assigned")
	ErrInvalidAppointmentDate      = errors.New("invalid appointment date")
)

// Запись к врачу доступна с 10:00 до 18:00 с 30-минутными слотами
const (
	workStartHour   = 10
	workEndHour     = 18
	slotStepMinutes = 30
)

type DoctorRepository interface {
	GetAll(ctx context.Context) ([]*domain.Doctor, error)
	GetByID(ctx context.Context, id int) (*domain.Doctor, error)
	GetBySpecialization(ctx context.Context, spec string) ([]*domain.Doctor, error)
	GetByServiceID(ctx context.Context, serviceID int) ([]*domain.Doctor, error)
	Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error)
	Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error)
	Delete(ctx context.Context, id int) error
	AddService(ctx context.Context, doctorID, serviceID int) error
	DeleteService(ctx context.Context, doctorID, serviceID int) error
	ExistsByID(ctx context.Context, id int) (bool, error)
	ServiceExists(ctx context.Context, doctorID, serviceID int) (bool, error)
}

type DoctorService struct {
	doctorRepo      DoctorRepository
	appointmentRepo AppointmentRepository
}

func NewDoctorService(doctorRepo DoctorRepository, appointmentRepo AppointmentRepository) *DoctorService {
	return &DoctorService{
		doctorRepo:      doctorRepo,
		appointmentRepo: appointmentRepo,
	}
}

func (s *DoctorService) GetAll(ctx context.Context) ([]*domain.Doctor, error) {
	return s.doctorRepo.GetAll(ctx)
}

func (s *DoctorService) GetByID(ctx context.Context, id int) (*domain.Doctor, error) {
	if id <= 0 {
		return nil, ErrInvalidDoctorID
	}

	return s.doctorRepo.GetByID(ctx, id)
}

func (s *DoctorService) GetBySpecialization(ctx context.Context, spec string) ([]*domain.Doctor, error) {
	spec = strings.TrimSpace(spec)
	if spec == "" {
		return nil, ErrInvalidDoctorSpecialization
	}

	return s.doctorRepo.GetBySpecialization(ctx, spec)
}

func (s *DoctorService) GetByServiceID(ctx context.Context, serviceID int) ([]*domain.Doctor, error) {
	if serviceID <= 0 {
		return nil, ErrInvalidServiceID
	}

	return s.doctorRepo.GetByServiceID(ctx, serviceID)
}

func (s *DoctorService) GetCalendar(ctx context.Context, doctorID int, month string) ([]domain.AppointmentCalendarDay, error) {
	if doctorID <= 0 {
		return nil, ErrInvalidDoctorID
	}

	if month == "" {
		month = time.Now().Format("2006-01")
	}

	monthDate, err := time.ParseInLocation("2006-01", month, time.Local)
	if err != nil {
		return nil, ErrInvalidAppointmentDate
	}

	appointments, err := s.appointmentRepo.GetByDoctorID(ctx, doctorID)
	if err != nil {
		return nil, fmt.Errorf("get appointments by doctor id: %w", err)
	}

	daysInMonth := time.Date(monthDate.Year(), monthDate.Month()+1, 0, 0, 0, 0, 0, monthDate.Location()).Day()
	result := make([]domain.AppointmentCalendarDay, 0, daysInMonth)

	for day := 1; day <= daysInMonth; day++ {
		date := time.Date(monthDate.Year(), monthDate.Month(), day, 0, 0, 0, 0, monthDate.Location())
		slots := buildSlots(date, appointments)
		status := "disabled"

		for _, slot := range slots {
			if slot.Status == "available" {
				status = "available"
				break
			}
		}

		result = append(result, domain.AppointmentCalendarDay{
			Date:   date.Format("2006-01-02"),
			Status: status,
		})
	}

	return result, nil
}

func (s *DoctorService) GetSlots(ctx context.Context, doctorID int, date string) ([]domain.AppointmentSlot, error) {
	if doctorID <= 0 {
		return nil, ErrInvalidDoctorID
	}

	day, err := time.ParseInLocation("2006-01-02", date, time.Local)
	if err != nil {
		return nil, ErrInvalidAppointmentDate
	}

	appointments, err := s.appointmentRepo.GetByDoctorID(ctx, doctorID)
	if err != nil {
		return nil, fmt.Errorf("get appointments by doctor id: %w", err)
	}

	return buildSlots(day, appointments), nil
}

func (s *DoctorService) Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	doctor.FullName = strings.TrimSpace(doctor.FullName)
	doctor.Specialization = strings.TrimSpace(doctor.Specialization)
	if doctor.FullName == "" || doctor.Experience < 0 || doctor.Specialization == "" {
		return nil, ErrInvalidDoctorData
	}

	return s.doctorRepo.Create(ctx, doctor)
}

func (s *DoctorService) Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	doctor.FullName = strings.TrimSpace(doctor.FullName)
	doctor.Specialization = strings.TrimSpace(doctor.Specialization)
	if doctor.ID <= 0 || doctor.FullName == "" || doctor.Experience < 0 || doctor.Specialization == "" {
		return nil, ErrInvalidDoctorData
	}

	return s.doctorRepo.Update(ctx, doctor)
}

func (s *DoctorService) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return ErrInvalidDoctorID
	}
	return s.doctorRepo.Delete(ctx, id)
}

func (s *DoctorService) AddService(ctx context.Context, doctorID, serviceID int) error {
	if doctorID <= 0 {
		return ErrInvalidDoctorID
	} else if serviceID <= 0 {
		return ErrInvalidServiceID
	}

	// проверка на существование врача
	doctorExists, err := s.doctorRepo.ExistsByID(ctx, doctorID)
	if err != nil {
		return fmt.Errorf("check doctor exists: %w", err)
	}
	if !doctorExists {
		return ErrInvalidDoctorID
	}

	// проверка на существование связи
	exists, err := s.doctorRepo.ServiceExists(ctx, doctorID, serviceID)
	if err != nil {
		return fmt.Errorf("check service for doctor: %w", err)
	}

	if exists {
		return ErrServiceAlreadyAssigned
	}

	return s.doctorRepo.AddService(ctx, doctorID, serviceID)
}

func (s *DoctorService) DeleteService(ctx context.Context, doctorID, serviceID int) error {
	if doctorID <= 0 {
		return ErrInvalidDoctorID
	} else if serviceID <= 0 {
		return ErrInvalidServiceID
	}

	return s.doctorRepo.DeleteService(ctx, doctorID, serviceID)
}

func buildSlots(day time.Time, appointments []*domain.Appointment) []domain.AppointmentSlot {
	start := time.Date(day.Year(), day.Month(), day.Day(), workStartHour, 0, 0, 0, day.Location())
	end := time.Date(day.Year(), day.Month(), day.Day(), workEndHour, 0, 0, 0, day.Location())
	result := make([]domain.AppointmentSlot, 0)

	for slotStart := start; slotStart.Before(end); slotStart = slotStart.Add(slotStepMinutes * time.Minute) {
		slotEnd := slotStart.Add(slotStepMinutes * time.Minute)
		status := "available"

		for _, appointment := range appointments {
			if appointment.Status == "Отменена" {
				continue
			}

			appointmentStart, err := time.Parse(time.RFC3339, appointment.Date)
			if err != nil {
				continue
			}

			appointmentEnd := appointmentStart.Add(time.Duration(appointment.ServiceDuration) * time.Minute)
			if slotStart.Before(appointmentEnd) && slotEnd.After(appointmentStart) {
				status = "disabled"
				break
			}
		}

		result = append(result, domain.AppointmentSlot{
			Time:   slotStart.Format("15:04"),
			Status: status,
		})
	}

	return result
}
