package main

import (
	"context"
	"dental-time/internal/config"
	"dental-time/internal/database"
	"dental-time/internal/handler"
	"dental-time/internal/logger"
	"dental-time/internal/middleware"
	"dental-time/internal/repository/postgresql"
	"dental-time/internal/router"
	"dental-time/internal/service"
	"log/slog"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
)

func main() {
	if err := godotenv.Load(); err != nil {
		slog.Error("ошибка при загрузке переменных из .env")
		return
	}

	config, err := config.Load()
	if err != nil {
		slog.Error("ошибка при загрузке конфига:\n\t", "error", err)
		return
	}

	db, err := database.InitDB(config.DSN())
	if err != nil {
		slog.Error("ошибка при подключении к БД", "error", err)
		return
	}

	doctorRepo := postgresql.NewDoctorRepo(db)
	serviceRepo := postgresql.NewServiceRepo(db)
	appointmentRepo := postgresql.NewAppointmentRepo(db)
	managerRepo := postgresql.NewManagerRepo(db)

	doctorService := service.NewDoctorService(doctorRepo, appointmentRepo)
	serviceService := service.NewServiceService(serviceRepo)
	appointmentService := service.NewAppointmentService(appointmentRepo)
	managerService := service.NewManagerService(managerRepo, config.JWTSecret)

	if err := managerService.EnsureDefaultManager(context.Background()); err != nil {
		slog.Error("ошибка при создании администратора", "error", err)
		return
	}

	doctorHandler := handler.NewDoctorHandler(doctorService, serviceService)
	serviceHandler := handler.NewServiceHandler(serviceService, doctorService)
	appointmentHandler := handler.NewAppointmentHandler(appointmentService)
	authHandler := handler.NewAuthHandler(managerService)

	myLogger := logger.NewLogger()
	slog.SetDefault(myLogger)

	e := echo.New()
	e.Logger = myLogger
	e.Use(middleware.RequestLogger())

	router.SetupRoutes(e, router.Handlers{
		DoctorHandler:      doctorHandler,
		ServiceHandler:     serviceHandler,
		AppointmentHandler: appointmentHandler,
		AuthHandler:        authHandler,
		ManagerService:     managerService,
	})

	port := config.ServerPort
	if port == "" {
		port = "1323"
	}

	if err := e.Start(":" + port); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
