package postgresql

import (
	"context"
	"database/sql"
	"dental-time/internal/domain"
	"dental-time/internal/service"
	"errors"
	"fmt"
)

type DoctorRepo struct {
	db *sql.DB
}

func NewDoctorRepo(db *sql.DB) *DoctorRepo {
	return &DoctorRepo{
		db: db,
	}
}

// Модель для БД

type DoctorRow struct {
	doctor_id  int
	full_name  string
	spec       string
	experience int
	photo_url  string
}

// Мапперы

func (r DoctorRow) ToDomain() domain.Doctor {
	return domain.Doctor{
		ID:             r.doctor_id,
		FullName:       r.full_name,
		Specialization: r.spec,
		Experience:     r.experience,
		PhotoURL:       r.photo_url,
	}
}

//TODO: метод для получения списка врачей по определенной услуге

func (r *DoctorRepo) GetByID(ctx context.Context, id int) (*domain.Doctor, error) {
	const query = `
	SELECT 
		doctor_id,
		full_name,
		spec,
		experience,
		photo_url
	 FROM doctors 
	 WHERE doctor_id = $1;`

	var row DoctorRow

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&row.doctor_id,
		&row.full_name,
		&row.spec,
		&row.experience,
		&row.photo_url,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrDoctorNotFound
		}

		return nil, fmt.Errorf("get doctor by id: %w", err)
	}

	doctor := row.ToDomain()
	return &doctor, nil
}

func (r *DoctorRepo) GetBySpecialization(ctx context.Context, spec string) ([]*domain.Doctor, error) {
	const query = `
	SELECT
		doctor_id,
		full_name,
		spec,
		experience,
		photo_url
	FROM doctors
	WHERE spec = $1;`

	rows, err := r.db.QueryContext(ctx, query, spec)
	if err != nil {
		return nil, fmt.Errorf("get doctor by spec: %w", err)
	}
	defer rows.Close()

	var doctors []*domain.Doctor

	for rows.Next() {
		var row DoctorRow

		err := rows.Scan(
			&row.doctor_id,
			&row.full_name,
			&row.spec,
			&row.experience,
			&row.photo_url,
		)
		if err != nil {
			return nil, fmt.Errorf("scan doctors: %w", err)
		}

		doctor := row.ToDomain()
		doctors = append(doctors, &doctor)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate doctors: %w", err)
	}

	return doctors, nil
}

func (r *DoctorRepo) GetAll(ctx context.Context) ([]*domain.Doctor, error) {
	const query = `
	SELECT
		doctor_id,
		full_name,
		spec,
		experience,
		photo_url
	FROM doctors`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get all doctors: %w", err)
	}
	defer rows.Close()

	var doctors []*domain.Doctor

	for rows.Next() {
		var row DoctorRow

		err := rows.Scan(
			&row.doctor_id,
			&row.full_name,
			&row.spec,
			&row.experience,
			&row.photo_url,
		)
		if err != nil {
			return nil, fmt.Errorf("scan doctors: %w", err)
		}

		doctor := row.ToDomain()
		doctors = append(doctors, &doctor)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate doctors: %w", err)
	}

	return doctors, nil
}

func (r *DoctorRepo) Create(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	const query = `
	INSERT INTO doctors(
		full_name,
		spec,
		experience,
		photo_url)
	VALUES ($1, $2, $3, $4)
	RETURNING doctor_id, full_name, spec, experience, photo_url;`

	var doctorRow DoctorRow
	err := r.db.QueryRowContext(ctx, query,
		doctor.FullName,
		doctor.Specialization,
		doctor.Experience,
		doctor.PhotoURL).Scan(
		&doctorRow.doctor_id,
		&doctorRow.full_name,
		&doctorRow.spec,
		&doctorRow.experience,
		&doctorRow.photo_url)

	if err != nil {
		return nil, fmt.Errorf("create doctor: %w", err)
	}

	doctor = doctorRow.ToDomain()

	return &doctor, nil
}

func (r *DoctorRepo) Update(ctx context.Context, doctor domain.Doctor) (*domain.Doctor, error) {
	const query = `
	UPDATE doctors
	SET full_name = $1,
			spec = $2,
			experience = $3,
			photo_url = $4
	WHERE doctor_id = $5
	RETURNING doctor_id, full_name, spec, experience, photo_url;`

	var doctorRow DoctorRow
	err := r.db.QueryRowContext(ctx, query,
		doctor.FullName,
		doctor.Specialization,
		doctor.Experience,
		doctor.PhotoURL,
		doctor.ID).Scan(
		&doctorRow.doctor_id,
		&doctorRow.full_name,
		&doctorRow.spec,
		&doctorRow.experience,
		&doctorRow.photo_url)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrDoctorNotFound
		}

		return nil, fmt.Errorf("update doctor: %w", err)
	}

	updatedDoctor := doctorRow.ToDomain()
	return &updatedDoctor, nil
}

func (r *DoctorRepo) Delete(ctx context.Context, id int) error {
	const query = `
	DELETE FROM doctors
	WHERE doctor_id = $1`

	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete doctor: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete doctor rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return service.ErrDoctorNotFound
	}

	return nil
}
