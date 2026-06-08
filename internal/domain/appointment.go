package domain

type Appointment struct {
	ID                 int
	Number             int
	Status             string
	PatientFirstName   string
	PatientPhoneNumber string
	Date               string
	ServiceID          int
	ServiceTitle       string
	ServiceDuration    int
	DoctorID           int
	DoctorFullName     string
}

type AppointmentCalendarDay struct {
	Date   string
	Status string
}

type AppointmentSlot struct {
	Time   string
	Status string
}
