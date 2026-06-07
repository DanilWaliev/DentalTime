package main

import (
	"dental-time/internal/config"
	"dental-time/internal/database"
	"dental-time/internal/handler"
	"dental-time/internal/logger"
	"dental-time/internal/middleware"
	"dental-time/internal/repository/postgresql"
	"dental-time/internal/service"
	"log/slog"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
)

func main() {
	// только для локальной разработки на Windows
	if err := godotenv.Load(); err != nil {
		slog.Error("ошибка при загрузке переменных из .env")
		return
	}

	// получение конфига
	config, err := config.Load()
	if err != nil {
		slog.Error("ошибка при загрузке конфига:\n\t", "error", err)
		return
	}

	// подключение к БД
	db, err := database.InitDB(config.DSN())
	if err != nil {
		slog.Error("ошибка при подключении к БД", "error", err)
		return
	}

	// прокидывание зависимостей
	doctorRepo := postgresql.NewDoctorRepo(db)
	serviceRepo := postgresql.NewServiceRepo(db)

	doctorService := service.NewDoctorService(doctorRepo)
	serviceService := service.NewServiceService(serviceRepo)

	doctorHandler := handler.NewDoctorHandler(doctorService)
	serviceHandler := handler.NewServiceHandler(*serviceService)

	// логгер
	myLogger := logger.NewLogger()
	slog.SetDefault(myLogger)

	e := echo.New()
	e.Logger = myLogger
	e.Use(middleware.RequestLogger())

	e.GET("api/doctors/:id", doctorHandler.GetByID)
	e.GET("api/doctors", doctorHandler.GetAll)
	e.POST("api/doctors", doctorHandler.Create)
	e.PUT("api/doctors/:id", doctorHandler.Update)
	e.DELETE("api/doctors/:id", doctorHandler.Delete)

	e.GET("api/services/:id", serviceHandler.GetByID)
	e.GET("api/services", serviceHandler.GetAll)
	e.POST("api/services", serviceHandler.Create)
	e.PUT("api/services/:id", serviceHandler.Update)
	e.DELETE("api/services/:id", serviceHandler.Delete)

	// статический контент
	e.Static("/static", "web")

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
