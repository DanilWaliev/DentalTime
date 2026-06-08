package main

import (
	"context"
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

	// логгер
	myLogger := logger.NewLogger()
	slog.SetDefault(myLogger)

	e := echo.New()
	e.Logger = myLogger
	e.Use(middleware.RequestLogger())

	requireManager := middleware.RequireManager(managerService)

	e.POST("api/login", authHandler.Login)
	e.POST("api/logout", authHandler.Logout)

	e.GET("api/managers", authHandler.GetManagers, requireManager)
	e.POST("api/managers", authHandler.CreateManager, requireManager)
	e.DELETE("api/managers/:id", authHandler.DeleteManager, requireManager)

	e.GET("api/doctors/:id", doctorHandler.GetByID)
	e.GET("api/doctors", doctorHandler.GetAll)
	e.GET("api/doctors/:id/services", doctorHandler.GetServices)
	e.GET("api/doctors/:id/calendar", doctorHandler.GetCalendar)
	e.GET("api/doctors/:id/slots", doctorHandler.GetSlots)
	e.POST("api/doctors", doctorHandler.Create, requireManager)
	e.POST("api/doctors/:id/photo", doctorHandler.UploadPhoto, requireManager)
	e.PUT("api/doctors/:id", doctorHandler.Update, requireManager)
	e.DELETE("api/doctors/:id", doctorHandler.Delete, requireManager)
	e.DELETE("api/doctors/:doctorId/services/:serviceId", doctorHandler.DeleteService, requireManager)
	e.POST("api/doctors/:id/services", doctorHandler.AddService, requireManager)

	e.GET("api/services/:id", serviceHandler.GetByID)
	e.GET("api/services", serviceHandler.GetAll)
	e.GET("api/services/:id/doctors", serviceHandler.GetDoctors)
	e.POST("api/services", serviceHandler.Create, requireManager)
	e.PUT("api/services/:id", serviceHandler.Update, requireManager)
	e.DELETE("api/services/:id", serviceHandler.Delete, requireManager)

	e.GET("api/appointments/:id", appointmentHandler.GetByID)
	e.GET("api/appointments", appointmentHandler.GetAll)
	e.POST("api/appointments", appointmentHandler.Create)
	e.PUT("api/appointments/:id", appointmentHandler.Update, requireManager)
	e.POST("api/appointments/:id/cancel", appointmentHandler.Cancel)
	e.POST("api/appointments/:id/reschedule", appointmentHandler.Reschedule)
	e.DELETE("api/appointments/:id", appointmentHandler.Delete, requireManager)

	e.Static("/static", "web")

	port := config.ServerPort
	if port == "" {
		port = "1323"
	}

	if err := e.Start(":" + port); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
