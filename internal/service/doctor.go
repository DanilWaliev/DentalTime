package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
)

var ErrDoctorNotFound = errors.New("doctor not found")

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

func (s *DoctorService) GetAll(ctx context.Context) ([]*domain.Doctor, error) {
	return s.doctorRepo.GetAll(ctx)
}

func (s *DoctorService) GetByID(ctx context.Context, id int) (*domain.Doctor, error) {
	return s.doctorRepo.GetByID(ctx, id)
}

func (s *DoctorService) GetBySpecialization(ctx context.Context, spec string) ([]*domain.Doctor, error) {
	return s.doctorRepo.GetBySpecialization(ctx, spec)
}

func (s *DoctorService) Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	return s.doctorRepo.Create(ctx, doctor)
}

func (s *DoctorService) Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	return s.doctorRepo.Update(ctx, doctor)
}

func (s *DoctorService) Delete(ctx context.Context, id int) error {
	return s.doctorRepo.Delete(ctx, id)
}
