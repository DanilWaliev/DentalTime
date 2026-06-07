package postgresql

import (
	"context"
	"database/sql"
	"dental-time/internal/domain"
	"dental-time/internal/service"
	"errors"
	"fmt"
)

type ServiceRepo struct {
	db *sql.DB
}

func NewServiceRepo(db *sql.DB) *ServiceRepo {
	return &ServiceRepo{
		db: db,
	}
}

// Модель для БД

type ServiceRow struct {
	service_id int
	title      string
	subtitle   string
	duration   int
	price      int
}

// Мапперы

func (r ServiceRow) ToDomain() domain.Service {
	return domain.Service{
		ID:       r.service_id,
		Title:    r.title,
		Subtitle: r.subtitle,
		Duration: r.duration,
		Price:    r.price,
	}
}

func (r *ServiceRepo) Create(ctx context.Context, service domain.Service) (*domain.Service, error) {
	const query = `
	INSERT INTO services(
		title,
		subtitle,
		duration,
		price)
	VALUES ($1, $2, $3, $4)
	RETURNING service_id, title, subtitle, duration, price;`

	var serviceRow ServiceRow
	err := r.db.QueryRowContext(ctx, query,
		service.Title,
		service.Subtitle,
		service.Duration,
		service.Price).Scan(
		&serviceRow.service_id,
		&serviceRow.title,
		&serviceRow.subtitle,
		&serviceRow.duration,
		&serviceRow.price,
	)

	if err != nil {
		return nil, fmt.Errorf("create service: %w", err)
	}

	service = serviceRow.ToDomain()

	return &service, nil
}

func (r *ServiceRepo) Delete(ctx context.Context, id int) error {
	const query = `
	DELETE FROM services
	WHERE service_id = $1`

	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete service: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete service rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return service.ErrServiceNotFound
	}

	return nil
}

func (r *ServiceRepo) GetAll(ctx context.Context) ([]*domain.Service, error) {
	const query = `
	SELECT
		service_id,
		title,
		subtitle,
		duration,
		price
	FROM services`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get all services: %w", err)
	}

	defer rows.Close()

	var services []*domain.Service

	for rows.Next() {
		var row ServiceRow

		err := rows.Scan(
			&row.service_id,
			&row.title,
			&row.subtitle,
			&row.duration,
			&row.price,
		)
		if err != nil {
			return nil, fmt.Errorf("scan services: %w", err)
		}

		service := row.ToDomain()
		services = append(services, &service)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate services: %w", err)
	}

	return services, nil
}

func (r *ServiceRepo) GetByID(ctx context.Context, id int) (*domain.Service, error) {
	const query = `SELECT
		service_id,
		title,
		subtitle,
		duration,
		price
	FROM services
	WHERE service_id = $1`

	var row ServiceRow

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&row.service_id,
		&row.title,
		&row.subtitle,
		&row.duration,
		&row.price,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrServiceNotFound
		}

		return nil, fmt.Errorf("get service by id: %w", err)
	}

	service := row.ToDomain()
	return &service, nil
}

func (r *ServiceRepo) GetByTitle(ctx context.Context, title string) (*domain.Service, error) {
	const query = `SELECT
		service_id,
		title,
		subtitle,
		duration,
		price
	FROM services
	WHERE title = $1`

	var row ServiceRow

	err := r.db.QueryRowContext(ctx, query, title).Scan(
		&row.service_id,
		&row.title,
		&row.subtitle,
		&row.duration,
		&row.price,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrServiceNotFound
		}

		return nil, fmt.Errorf("get service by title: %w", err)
	}

	service := row.ToDomain()
	return &service, nil
}

func (r *ServiceRepo) Update(ctx context.Context, serviceToUpdate domain.Service) (*domain.Service, error) {
	const query = `
	UPDATE services
	SET title = $1,
			subtitle = $2,
			duration = $3,
			price = $4
	WHERE service_id = $5
	RETURNING service_id, title, subtitle, duration, price;`

	var serviceRow ServiceRow
	err := r.db.QueryRowContext(ctx, query,
		serviceToUpdate.Title,
		serviceToUpdate.Subtitle,
		serviceToUpdate.Duration,
		serviceToUpdate.Price,
		serviceToUpdate.ID).Scan(
		&serviceRow.service_id,
		&serviceRow.title,
		&serviceRow.subtitle,
		&serviceRow.duration,
		&serviceRow.price,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrServiceNotFound
		}
		return nil, fmt.Errorf("update service: %w", err)
	}

	updatedService := serviceRow.ToDomain()

	return &updatedService, nil
}
