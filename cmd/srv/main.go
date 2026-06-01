package main

import (
	"dental-time/internal/config"
	"dental-time/internal/database"
	"dental-time/internal/logger"
	"dental-time/internal/middleware"
	"log/slog"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
)

func main() {
	// только для локальной разработки на Windows
	if err := godotenv.Load(); err != nil {
		slog.Error("ошибка при загрузке переменных из .env")
		return
	}

	config, err := config.Load()
	if err != nil {
		slog.Error("ошибка при загрузке конфига:\n\t", "error", err)
		return
	}
	slog.Info("dsn: ", "dsn", config.DSN())

	_, err = database.InitDB(config.DSN())
	if err != nil {
		slog.Error("ошибка при подключении к БД", "error", err)
		return
	}

	myLogger := logger.NewLogger()
	slog.SetDefault(myLogger)

	e := echo.New()
	e.Logger = myLogger
	e.Use(middleware.RequestLogger())

	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello World")
	})

	e.GET("/users/:id", getUser)
	e.POST("/users", save)

	e.Static("/static", "web")

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}

func getUser(c *echo.Context) error {
	id := c.Param("id")
	return c.String(http.StatusOK, id)
}

func save(c *echo.Context) error {
	name := c.QueryParam("name")
	email := c.QueryParam("email")

	return c.String(http.StatusOK, "name: "+name+", email: "+email)
}
