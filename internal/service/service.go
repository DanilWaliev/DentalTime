package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrServiceNotFound      = errors.New("service not found")
	ErrServiceAlreadyExists = errors.New("service already exists")
	ErrInvalidServiceID     = errors.New("invalid service id")
	ErrInvalidServiceTitle  = errors.New("invalid service title")
	ErrInvalidServiceData   = errors.New("invalid service data")
)

type ServiceRepository interface {
	GetAll(ctx context.Context) ([]*domain.Service, error)
	GetByID(ctx context.Context, id int) (*domain.Service, error)
	GetByTitle(ctx context.Context, title string) (*domain.Service, error)
	GetByDoctorID(ctx context.Context, doctorID int) ([]*domain.Service, error)
	Create(ctx context.Context, service domain.Service) (*domain.Service, error)
	Update(ctx context.Context, service domain.Service) (*domain.Service, error)
	Delete(ctx context.Context, id int) error
}

type ServiceService struct {
	serviceRepo ServiceRepository
}

func NewServiceService(serviceRepo ServiceRepository) *ServiceService {
	return &ServiceService{
		serviceRepo: serviceRepo,
	}
}

func (s *ServiceService) GetAll(ctx context.Context) ([]*domain.Service, error) {
	return s.serviceRepo.GetAll(ctx)
}

func (s *ServiceService) GetByID(ctx context.Context, id int) (*domain.Service, error) {
	if id <= 0 {
		return nil, ErrInvalidServiceID
	}

	return s.serviceRepo.GetByID(ctx, id)
}

func (s *ServiceService) GetByTitle(ctx context.Context, title string) (*domain.Service, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return nil, ErrInvalidServiceTitle
	}

	return s.serviceRepo.GetByTitle(ctx, title)
}

func (s *ServiceService) GetByDoctorID(ctx context.Context, doctorID int) ([]*domain.Service, error) {
	if doctorID <= 0 {
		return nil, ErrInvalidDoctorID
	}

	return s.serviceRepo.GetByDoctorID(ctx, doctorID)
}

func (s *ServiceService) Create(ctx context.Context, service domain.Service) (*domain.Service, error) {
	service.Title = strings.TrimSpace(service.Title)
	service.Subtitle = strings.TrimSpace(service.Subtitle)
	if service.Title == "" || service.Subtitle == "" || service.Duration <= 0 || service.Price < 0 {
		return nil, ErrInvalidServiceData
	}

	_, err := s.serviceRepo.GetByTitle(ctx, service.Title)
	if err != nil {
		if errors.Is(err, ErrServiceNotFound) {
			return s.serviceRepo.Create(ctx, service)
		}

		return nil, fmt.Errorf("create service: %w", err)
	}

	return nil, ErrServiceAlreadyExists
}

func (s *ServiceService) Update(ctx context.Context, service domain.Service) (*domain.Service, error) {
	service.Title = strings.TrimSpace(service.Title)
	service.Subtitle = strings.TrimSpace(service.Subtitle)
	if service.ID <= 0 || service.Title == "" || service.Subtitle == "" || service.Duration <= 0 || service.Price < 0 {
		return nil, ErrInvalidServiceData
	}

	sameTitleService, err := s.serviceRepo.GetByTitle(ctx, service.Title)
	if err != nil {
		if !errors.Is(err, ErrServiceNotFound) {
			return nil, fmt.Errorf("check service by title: %w", err)
		}
	} else if sameTitleService.ID != service.ID {
		return nil, ErrServiceAlreadyExists
	}

	return s.serviceRepo.Update(ctx, service)
}

func (s *ServiceService) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return ErrInvalidServiceID
	}

	return s.serviceRepo.Delete(ctx, id)
}
