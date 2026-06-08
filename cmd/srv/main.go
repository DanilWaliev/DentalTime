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
	appointmentRepo := postgresql.NewAppointmentRepo(db)

	doctorService := service.NewDoctorService(doctorRepo, appointmentRepo)
	serviceService := service.NewServiceService(serviceRepo)
	appointmentService := service.NewAppointmentService(appointmentRepo)

	doctorHandler := handler.NewDoctorHandler(doctorService, serviceService)
	serviceHandler := handler.NewServiceHandler(serviceService, doctorService)
	appointmentHandler := handler.NewAppointmentHandler(appointmentService)

	// логгер
	myLogger := logger.NewLogger()
	slog.SetDefault(myLogger)

	e := echo.New()
	e.Logger = myLogger
	e.Use(middleware.RequestLogger())

	e.GET("api/doctors/:id", doctorHandler.GetByID)
	e.GET("api/doctors", doctorHandler.GetAll)
	e.GET("api/doctors/:id/services", doctorHandler.GetServices)
	e.GET("api/doctors/:id/calendar", doctorHandler.GetCalendar)
	e.GET("api/doctors/:id/slots", doctorHandler.GetSlots)
	e.POST("api/doctors", doctorHandler.Create)
	e.PUT("api/doctors/:id", doctorHandler.Update)
	e.DELETE("api/doctors/:id", doctorHandler.Delete)
	e.DELETE("api/doctors/:doctorId/services/:serviceId", doctorHandler.DeleteService)
	e.POST("api/doctors/:id/services", doctorHandler.AddService)

	e.GET("api/services/:id", serviceHandler.GetByID)
	e.GET("api/services", serviceHandler.GetAll)
	e.GET("api/services/:id/doctors", serviceHandler.GetDoctors)
	e.POST("api/services", serviceHandler.Create)
	e.PUT("api/services/:id", serviceHandler.Update)
	e.DELETE("api/services/:id", serviceHandler.Delete)

	e.GET("api/appointments/:id", appointmentHandler.GetByID)
	e.GET("api/appointments", appointmentHandler.GetAll)
	e.POST("api/appointments", appointmentHandler.Create)
	e.PUT("api/appointments/:id", appointmentHandler.Update)
	e.POST("api/appointments/:id/cancel", appointmentHandler.Cancel)
	e.POST("api/appointments/:id/reschedule", appointmentHandler.Reschedule)
	e.DELETE("api/appointments/:id", appointmentHandler.Delete)

	// статический контент
	e.Static("/static", "web")

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
