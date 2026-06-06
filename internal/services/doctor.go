package services

import (
	"context"
	"dental-time/internal/domain"
	"dental-time/internal/repository/postgresql"
)

type DoctorService struct {
	doctorRepo *postgresql.DoctorRepo
}

func (s *DoctorService) GetAll(ctx context.Context) ([]*domain.Doctor, error) {
	return s.doctorRepo.GetAll(ctx)
}
