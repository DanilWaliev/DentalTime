package database

import (
	"database/sql"
	"embed"
	"fmt"
	"log/slog"

	"github.com/pressly/goose/v3"

	_ "github.com/lib/pq"
)

var embedMigrations embed.FS

func RunMigrations(dsn string) error {

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return fmt.Errorf("ошибка при открытии БД для миграций: %w", err)
	}
	defer db.Close()

	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("ошибка при установке диалекта goose: %w", err)
	}

	if err := goose.Up(db, "migrations"); err != nil {
		return fmt.Errorf("ошибка при установке диалекта goose: %w", err)
	}

	slog.Info("Миграции прошли успешно")
	return nil
}
