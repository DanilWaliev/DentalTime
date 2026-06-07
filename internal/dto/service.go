package dto

import "dental-time/internal/domain"

type CreateServiceRequest struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Duration int    `json:"duration"`
	Price    int    `json:"price"`
}

type UpdateServiceRequest struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Duration int    `json:"duration"`
	Price    int    `json:"price"`
}

type ServiceResponse struct {
	ID       int    `json:"service_id"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Duration int    `json:"duration"`
	Price    int    `json:"price"`
}

type ServicesResponse struct {
	Services []ServiceResponse `json:"services"`
}

func (r CreateServiceRequest) ToDomain() domain.Service {
	return domain.Service{
		Title:    r.Title,
		Subtitle: r.Subtitle,
		Duration: r.Duration,
		Price:    r.Price,
	}
}

func (r UpdateServiceRequest) ToDomain() domain.Service {
	return domain.Service{
		Title:    r.Title,
		Subtitle: r.Subtitle,
		Duration: r.Duration,
		Price:    r.Price,
	}
}

func ServiceResponseFromDomain(service *domain.Service) ServiceResponse {
	return ServiceResponse{
		ID:       service.ID,
		Title:    service.Title,
		Subtitle: service.Subtitle,
		Duration: service.Duration,
		Price:    service.Price,
	}
}

func ServicesResponseFromDomain(services []*domain.Service) ServicesResponse {
	result := make([]ServiceResponse, 0, len(services))

	for _, service := range services {
		result = append(result, ServiceResponseFromDomain(service))
	}

	return ServicesResponse{
		Services: result,
	}
}
