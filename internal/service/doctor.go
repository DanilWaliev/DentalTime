package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrDoctorNotFound              = errors.New("doctor not found")
	ErrDoctorAlreadyExists         = errors.New("doctor already exists")
	ErrInvalidDoctorData           = errors.New("invalid doctor data")
	ErrInvalidDoctorID             = errors.New("invalid doctor id")
	ErrInvalidDoctorSpecialization = errors.New("invalid doctor specialization")
	ErrServiceAlreadyAssigned      = errors.New("service is already assigned")
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
	doctorRepo DoctorRepository
}

func NewDoctorService(doctorRepo DoctorRepository) *DoctorService {
	return &DoctorService{
		doctorRepo: doctorRepo,
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
