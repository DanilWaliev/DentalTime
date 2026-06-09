package postgresql

import (
	"context"
	"database/sql"
	"dental-time/internal/domain"
	"dental-time/internal/service"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
)

type AppointmentRepo struct {
	db *sql.DB
}

func NewAppointmentRepo(db *sql.DB) *AppointmentRepo {
	return &AppointmentRepo{
		db: db,
	}
}

type AppointmentRow struct {
	appointment_id       int
	number               int
	status               sql.NullString
	patient_first_name   string
	patient_phone_number string
	date                 time.Time
	service_id           int
	service_title        string
	duration             int
	doctor_id            int
	doctor_full_name     string
}

func (r AppointmentRow) ToDomain() domain.Appointment {
	appointment := domain.Appointment{
		ID:                 r.appointment_id,
		Number:             r.number,
		PatientFirstName:   r.patient_first_name,
		PatientPhoneNumber: r.patient_phone_number,
		Date:               r.date.Format(time.RFC3339),
		ServiceID:          r.service_id,
		ServiceTitle:       r.service_title,
		ServiceDuration:    r.duration,
		DoctorID:           r.doctor_id,
		DoctorFullName:     r.doctor_full_name,
	}

	if r.status.Valid {
		appointment.Status = r.status.String
	} else {
		appointment.Status = "Ожидает"
	}

	return appointment
}

func (r *AppointmentRepo) GetAll(ctx context.Context) ([]*domain.Appointment, error) {
	const query = `
	SELECT
		a.appointment_id,
		a.number,
		a.status,
		a.patient_first_name,
		a.patient_phone_number,
		a.date,
		a.service_id,
		s.title,
		s.duration,
		a.doctor_id,
		d.full_name
	FROM appointments a
	JOIN services s ON a.service_id = s.service_id
	JOIN doctors d ON a.doctor_id = d.doctor_id
	ORDER BY a.date;`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get all appointments: %w", err)
	}
	defer rows.Close()

	var appointments []*domain.Appointment

	for rows.Next() {
		var row AppointmentRow

		err := rows.Scan(
			&row.appointment_id,
			&row.number,
			&row.status,
			&row.patient_first_name,
			&row.patient_phone_number,
			&row.date,
			&row.service_id,
			&row.service_title,
			&row.duration,
			&row.doctor_id,
			&row.doctor_full_name,
		)
		if err != nil {
			return nil, fmt.Errorf("scan appointments: %w", err)
		}

		appointment := row.ToDomain()
		appointments = append(appointments, &appointment)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate appointments: %w", err)
	}

	return appointments, nil
}

func (r *AppointmentRepo) GetByID(ctx context.Context, id int) (*domain.Appointment, error) {
	const query = `
	SELECT
		a.appointment_id,
		a.number,
		a.status,
		a.patient_first_name,
		a.patient_phone_number,
		a.date,
		a.service_id,
		s.title,
		s.duration,
		a.doctor_id,
		d.full_name
	FROM appointments a
	JOIN services s ON a.service_id = s.service_id
	JOIN doctors d ON a.doctor_id = d.doctor_id
	WHERE a.appointment_id = $1;`

	var row AppointmentRow

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&row.appointment_id,
		&row.number,
		&row.status,
		&row.patient_first_name,
		&row.patient_phone_number,
		&row.date,
		&row.service_id,
		&row.service_title,
		&row.duration,
		&row.doctor_id,
		&row.doctor_full_name,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrAppointmentNotFound
		}

		return nil, fmt.Errorf("get appointment by id: %w", err)
	}

	appointment := row.ToDomain()
	return &appointment, nil
}

func (r *AppointmentRepo) GetByNumber(ctx context.Context, number int) (*domain.Appointment, error) {
	const query = `
	SELECT
		a.appointment_id,
		a.number,
		a.status,
		a.patient_first_name,
		a.patient_phone_number,
		a.date,
		a.service_id,
		s.title,
		s.duration,
		a.doctor_id,
		d.full_name
	FROM appointments a
	JOIN services s ON a.service_id = s.service_id
	JOIN doctors d ON a.doctor_id = d.doctor_id
	WHERE a.number = $1;`

	var row AppointmentRow

	err := r.db.QueryRowContext(ctx, query, number).Scan(
		&row.appointment_id,
		&row.number,
		&row.status,
		&row.patient_first_name,
		&row.patient_phone_number,
		&row.date,
		&row.service_id,
		&row.service_title,
		&row.duration,
		&row.doctor_id,
		&row.doctor_full_name,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrAppointmentNotFound
		}

		return nil, fmt.Errorf("get appointment by number: %w", err)
	}

	appointment := row.ToDomain()
	return &appointment, nil
}

func (r *AppointmentRepo) GetByDoctorID(ctx context.Context, doctorID int) ([]*domain.Appointment, error) {
	const query = `
	SELECT
		a.appointment_id,
		a.number,
		a.status,
		a.patient_first_name,
		a.patient_phone_number,
		a.date,
		a.service_id,
		s.title,
		s.duration,
		a.doctor_id,
		d.full_name
	FROM appointments a
	JOIN services s ON a.service_id = s.service_id
	JOIN doctors d ON a.doctor_id = d.doctor_id
	WHERE a.doctor_id = $1
	ORDER BY a.date;`

	rows, err := r.db.QueryContext(ctx, query, doctorID)
	if err != nil {
		return nil, fmt.Errorf("get appointments by doctor id: %w", err)
	}
	defer rows.Close()

	var appointments []*domain.Appointment

	for rows.Next() {
		var row AppointmentRow

		err := rows.Scan(
			&row.appointment_id,
			&row.number,
			&row.status,
			&row.patient_first_name,
			&row.patient_phone_number,
			&row.date,
			&row.service_id,
			&row.service_title,
			&row.duration,
			&row.doctor_id,
			&row.doctor_full_name,
		)
		if err != nil {
			return nil, fmt.Errorf("scan appointments: %w", err)
		}

		appointment := row.ToDomain()
		appointments = append(appointments, &appointment)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate appointments: %w", err)
	}

	return appointments, nil
}

func (r *AppointmentRepo) Create(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error) {
	if appointment.Number <= 0 {
		const query = `
		SELECT MAX(number)
		FROM appointments;`

		var maxNumber sql.NullInt64
		err := r.db.QueryRowContext(ctx, query).Scan(&maxNumber)
		if err != nil {
			return nil, fmt.Errorf("get next appointment number: %w", err)
		}

		if maxNumber.Valid {
			appointment.Number = int(maxNumber.Int64) + 1
		} else {
			appointment.Number = 1
		}
	}

	const query = `
	INSERT INTO appointments(
		number,
		status,
		patient_first_name,
		patient_phone_number,
		date,
		service_id,
		doctor_id)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING appointment_id;`

	var appointmentID int
	err := r.db.QueryRowContext(ctx, query,
		appointment.Number,
		appointment.Status,
		appointment.PatientFirstName,
		appointment.PatientPhoneNumber,
		appointment.Date,
		appointment.ServiceID,
		appointment.DoctorID,
	).Scan(&appointmentID)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			switch pqErr.Code {
			case "23505":
				return nil, service.ErrAppointmentAlreadyExists
			case "23503":
				return nil, service.ErrInvalidAppointmentData
			}
		}

		return nil, fmt.Errorf("create appointment: %w", err)
	}

	return r.GetByID(ctx, appointmentID)
}

func (r *AppointmentRepo) Update(ctx context.Context, appointment domain.Appointment) (*domain.Appointment, error) {
	const query = `
	UPDATE appointments
	SET status = $1,
		patient_first_name = $2,
		patient_phone_number = $3,
		date = $4,
		service_id = $5,
		doctor_id = $6
	WHERE appointment_id = $7
	RETURNING appointment_id;`

	var appointmentID int
	err := r.db.QueryRowContext(ctx, query,
		appointment.Status,
		appointment.PatientFirstName,
		appointment.PatientPhoneNumber,
		appointment.Date,
		appointment.ServiceID,
		appointment.DoctorID,
		appointment.ID,
	).Scan(&appointmentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrAppointmentNotFound
		}

		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			switch pqErr.Code {
			case "23503":
				return nil, service.ErrInvalidAppointmentData
			}
		}

		return nil, fmt.Errorf("update appointment: %w", err)
	}

	return r.GetByID(ctx, appointmentID)
}

func (r *AppointmentRepo) Delete(ctx context.Context, id int) error {
	const query = `
	DELETE FROM appointments
	WHERE appointment_id = $1`

	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete appointment: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete appointment rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return service.ErrAppointmentNotFound
	}

	return nil
}
