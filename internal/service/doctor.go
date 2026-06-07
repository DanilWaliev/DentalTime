package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
	"strings"
)

var (
	ErrDoctorNotFound              = errors.New("doctor not found")
	ErrDoctorAlreadyExists         = errors.New("doctor already exists")
	ErrInvalidDoctorData           = errors.New("invalid doctor data")
	ErrInvalidDoctorID             = errors.New("invalid doctor id")
	ErrInvalidDoctorSpecialization = errors.New("invalid doctor specialization")
)

type DoctorRepository interface {
	GetAll(ctx context.Context) ([]*domain.Doctor, error)
	GetByID(ctx context.Context, id int) (*domain.Doctor, error)
	GetBySpecialization(ctx context.Context, spec string) ([]*domain.Doctor, error)
	Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error)
	Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error)
	Delete(ctx context.Context, id int) error
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
