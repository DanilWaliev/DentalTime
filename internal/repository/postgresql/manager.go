package postgresql

import (
	"context"
	"database/sql"
	"dental-time/internal/domain"
	"dental-time/internal/service"
	"errors"
	"fmt"
)

type ManagerRepo struct {
	db *sql.DB
}

func NewManagerRepo(db *sql.DB) *ManagerRepo {
	return &ManagerRepo{
		db: db,
	}
}

type ManagerRow struct {
	manager_id    int
	login         string
	password_hash string
}

func (r ManagerRow) ToDomain() domain.Manager {
	return domain.Manager{
		ID:           r.manager_id,
		Login:        r.login,
		PasswordHash: r.password_hash,
	}
}

func (r *ManagerRepo) GetAll(ctx context.Context) ([]*domain.Manager, error) {
	const query = `
	SELECT
		manager_id,
		login,
		password_hash
	FROM managers`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get all managers: %w", err)
	}
	defer rows.Close()

	var managers []*domain.Manager

	for rows.Next() {
		var row ManagerRow

		err := rows.Scan(
			&row.manager_id,
			&row.login,
			&row.password_hash,
		)
		if err != nil {
			return nil, fmt.Errorf("scan managers: %w", err)
		}

		manager := row.ToDomain()
		managers = append(managers, &manager)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate managers: %w", err)
	}

	return managers, nil
}

func (r *ManagerRepo) GetByLogin(ctx context.Context, login string) (*domain.Manager, error) {
	const query = `
	SELECT
		manager_id,
		login,
		password_hash
	FROM managers
	WHERE login = $1;`

	var row ManagerRow

	err := r.db.QueryRowContext(ctx, query, login).Scan(
		&row.manager_id,
		&row.login,
		&row.password_hash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrManagerNotFound
		}

		return nil, fmt.Errorf("get manager by login: %w", err)
	}

	manager := row.ToDomain()
	return &manager, nil
}

func (r *ManagerRepo) Create(ctx context.Context, manager domain.Manager) (*domain.Manager, error) {
	const query = `
	INSERT INTO managers(
		login,
		password_hash)
	VALUES ($1, $2)
	RETURNING manager_id, login, password_hash;`

	var row ManagerRow

	err := r.db.QueryRowContext(ctx, query,
		manager.Login,
		manager.PasswordHash).Scan(
		&row.manager_id,
		&row.login,
		&row.password_hash)
	if err != nil {
		return nil, fmt.Errorf("create manager: %w", err)
	}

	createdManager := row.ToDomain()
	return &createdManager, nil
}

func (r *ManagerRepo) Delete(ctx context.Context, id int) error {
	const query = `
	DELETE FROM managers
	WHERE manager_id = $1`

	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete manager: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete manager rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return service.ErrManagerNotFound
	}

	return nil
}

func (r *ManagerRepo) Count(ctx context.Context) (int, error) {
	const query = `
	SELECT COUNT(*)
	FROM managers;`

	var count int

	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count managers: %w", err)
	}

	return count, nil
}
