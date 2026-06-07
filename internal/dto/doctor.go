package dto

import "dental-time/internal/domain"

type CreateDoctorRequest struct {
	FullName       string `json:"full_name"`
	Specialization string `json:"specialization"`
	Experience     int    `json:"experience"`
	PhotoURL       string `json:"photo_url"`
}

type UpdateDoctorRequest struct {
	ID             int    `json:"doctor_id"`
	FullName       string `json:"full_name"`
	Specialization string `json:"specialization"`
	Experience     int    `json:"experience"`
	PhotoURL       string `json:"photo_url"`
}

type DoctorResponse struct {
	ID             int    `json:"doctor_id"`
	FullName       string `json:"full_name"`
	Specialization string `json:"specialization"`
	Experience     int    `json:"experience"`
	PhotoURL       string `json:"photo_url"`
}

type DoctorsResponse struct {
	Doctors []DoctorResponse `json:"doctors"`
}

func (r CreateDoctorRequest) ToDomain() domain.Doctor {
	return domain.Doctor{
		FullName:       r.FullName,
		Specialization: r.Specialization,
		Experience:     r.Experience,
		PhotoURL:       r.PhotoURL,
	}
}

func (r UpdateDoctorRequest) ToDomain() domain.Doctor {
	return domain.Doctor{
		ID:             r.ID,
		FullName:       r.FullName,
		Specialization: r.Specialization,
		Experience:     r.Experience,
		PhotoURL:       r.PhotoURL,
	}
}

func DoctorResponseFromDomain(doctor *domain.Doctor) DoctorResponse {
	return DoctorResponse{
		ID:             doctor.ID,
		FullName:       doctor.FullName,
		Specialization: doctor.Specialization,
		Experience:     doctor.Experience,
		PhotoURL:       doctor.PhotoURL,
	}
}

func DoctorsResponseFromDomain(doctors []*domain.Doctor) DoctorsResponse {
	result := make([]DoctorResponse, 0, len(doctors))

	for _, doctor := range doctors {
		result = append(result, DoctorResponseFromDomain(doctor))
	}

	return DoctorsResponse{
		Doctors: result,
	}
}
