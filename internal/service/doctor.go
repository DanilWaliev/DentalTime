package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
)

var ErrDoctorNotFound = errors.New("doctor not found")
var ErrDoctorAlreadyExists = errors.New("doctor already exists")
var ErrInvalidDoctorData = errors.New("invalid doctor data")
var ErrInvalidDoctorID = errors.New("invalid doctor id")
var ErrInvalidDoctorSpecialization = errors.New("invalid doctor specialization")

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
	if spec == "" {
		return nil, ErrInvalidDoctorSpecialization
	}

	return s.doctorRepo.GetBySpecialization(ctx, spec)
}

func (s *DoctorService) Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	if doctor.FullName == "" || doctor.Experience <= 0 || doctor.Specialization == "" {
		return nil, ErrInvalidDoctorData
	}

	return s.doctorRepo.Create(ctx, doctor)
}

func (s *DoctorService) Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	return s.doctorRepo.Update(ctx, doctor)
}

func (s *DoctorService) Delete(ctx context.Context, id int) error {
	return s.doctorRepo.Delete(ctx, id)
}
