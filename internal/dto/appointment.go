package dto

import "dental-time/internal/domain"

type CreateAppointmentRequest struct {
	Status             string `json:"status"`
	PatientFirstName   string `json:"patient_first_name"`
	PatientPhoneNumber string `json:"patient_phone_number"`
	Date               string `json:"date"`
	ServiceID          int    `json:"service_id"`
	DoctorID           int    `json:"doctor_id"`
}

type UpdateAppointmentRequest struct {
	Status             string `json:"status"`
	PatientFirstName   string `json:"patient_first_name"`
	PatientPhoneNumber string `json:"patient_phone_number"`
	Date               string `json:"date"`
	ServiceID          int    `json:"service_id"`
	DoctorID           int    `json:"doctor_id"`
}

type AppointmentServiceResponse struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Duration int    `json:"duration"`
}

type AppointmentDoctorResponse struct {
	ID       int    `json:"id"`
	FullName string `json:"fullName"`
}

type AppointmentResponse struct {
	ID                 int                        `json:"id"`
	Num                int                        `json:"num"`
	Status             string                     `json:"status"`
	PatientName        string                     `json:"patientName"`
	PatientPhoneNumber string                     `json:"patientPhoneNumber"`
	Service            AppointmentServiceResponse `json:"service"`
	Doctor             AppointmentDoctorResponse  `json:"doctor"`
	Date               string                     `json:"date"`
	Duration           int                        `json:"duration"`
}

type AppointmentsResponse struct {
	Appointments []AppointmentResponse `json:"appointments"`
}

type AppointmentCalendarDayResponse struct {
	Date   string `json:"date"`
	Text   string `json:"text"`
	Status string `json:"status"`
}

type AppointmentCalendarResponse struct {
	Days []AppointmentCalendarDayResponse `json:"days"`
}

type AppointmentSlotResponse struct {
	Time   string `json:"time"`
	Status string `json:"status"`
}

type AppointmentSlotsResponse struct {
	Slots []AppointmentSlotResponse `json:"slots"`
}

type RescheduleAppointmentRequest struct {
	Date string `json:"date"`
}

func (r CreateAppointmentRequest) ToDomain() domain.Appointment {
	return domain.Appointment{
		Status:             r.Status,
		PatientFirstName:   r.PatientFirstName,
		PatientPhoneNumber: r.PatientPhoneNumber,
		Date:               r.Date,
		ServiceID:          r.ServiceID,
		DoctorID:           r.DoctorID,
	}
}

func (r UpdateAppointmentRequest) ToDomain() domain.Appointment {
	return domain.Appointment{
		Status:             r.Status,
		PatientFirstName:   r.PatientFirstName,
		PatientPhoneNumber: r.PatientPhoneNumber,
		Date:               r.Date,
		ServiceID:          r.ServiceID,
		DoctorID:           r.DoctorID,
	}
}

func AppointmentResponseFromDomain(appointment *domain.Appointment) AppointmentResponse {
	return AppointmentResponse{
		ID:                 appointment.ID,
		Num:                appointment.Number,
		Status:             appointment.Status,
		PatientName:        appointment.PatientFirstName,
		PatientPhoneNumber: appointment.PatientPhoneNumber,
		Service: AppointmentServiceResponse{
			ID:       appointment.ServiceID,
			Title:    appointment.ServiceTitle,
			Duration: appointment.ServiceDuration,
		},
		Doctor: AppointmentDoctorResponse{
			ID:       appointment.DoctorID,
			FullName: appointment.DoctorFullName,
		},
		Date:     appointment.Date,
		Duration: appointment.ServiceDuration,
	}
}

func AppointmentsResponseFromDomain(appointments []*domain.Appointment) AppointmentsResponse {
	result := make([]AppointmentResponse, 0, len(appointments))

	for _, appointment := range appointments {
		result = append(result, AppointmentResponseFromDomain(appointment))
	}

	return AppointmentsResponse{
		Appointments: result,
	}
}

func AppointmentCalendarResponseFromDomain(days []domain.AppointmentCalendarDay) AppointmentCalendarResponse {
	result := make([]AppointmentCalendarDayResponse, 0, len(days))

	for _, day := range days {
		result = append(result, AppointmentCalendarDayResponse{
			Date:   day.Date,
			Text:   day.Text,
			Status: day.Status,
		})
	}

	return AppointmentCalendarResponse{
		Days: result,
	}
}

func AppointmentSlotsResponseFromDomain(slots []domain.AppointmentSlot) AppointmentSlotsResponse {
	result := make([]AppointmentSlotResponse, 0, len(slots))

	for _, slot := range slots {
		result = append(result, AppointmentSlotResponse{
			Time:   slot.Time,
			Status: slot.Status,
		})
	}

	return AppointmentSlotsResponse{
		Slots: result,
	}
}
