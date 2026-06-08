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
