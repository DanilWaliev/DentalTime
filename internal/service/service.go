package service

import (
	"context"
	"dental-time/internal/domain"
	"errors"
)

var ErrServiceNotFound = errors.New("service not found")
var ErrServiceAlreadyExists = errors.New("service already exists")
var ErrInvalidServiceID = errors.New("invalid service id")
var ErrInvalidServiceData = errors.New("invalid service data")

type ServiceRepository interface {
	GetAll(ctx context.Context) ([]*domain.Service, error)
	GetByID(ctx context.Context, id int) (*domain.Service, error)
	GetByTitle(ctx context.Context, title string) (*domain.Service, error)
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

func (s *ServiceService) 
