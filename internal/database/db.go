package database

import (
	"database/sql"
	"fmt"
)

func InitDB(dsn string) (*sql.DB, error) {
	if err := RunMigrations(dsn); err != nil {
		return nil, fmt.Errorf("ошибка при проведении миграций: %w", err)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("ошибка при открытии рабочего соединения к БД: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ошибка при пинге БД: %w", err)
	}

	return db, nil
}
