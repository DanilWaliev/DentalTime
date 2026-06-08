package dto

import "dental-time/internal/domain"

type LoginRequest struct {
	Login    string `json:"login"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type CreateManagerRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type ManagerResponse struct {
	ID    int    `json:"manager_id"`
	Login string `json:"login"`
}

type ManagersResponse struct {
	Managers []ManagerResponse `json:"managers"`
}

func ManagerResponseFromDomain(manager *domain.Manager) ManagerResponse {
	return ManagerResponse{
		ID:    manager.ID,
		Login: manager.Login,
	}
}

func ManagersResponseFromDomain(managers []*domain.Manager) ManagersResponse {
	result := make([]ManagerResponse, 0, len(managers))

	for _, manager := range managers {
		result = append(result, ManagerResponseFromDomain(manager))
	}

	return ManagersResponse{
		Managers: result,
	}
}
