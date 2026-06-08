package router

import (
	"dental-time/internal/handler"
	"dental-time/internal/middleware"
	"dental-time/internal/service"

	"github.com/labstack/echo/v5"
)

type Handlers struct {
	DoctorHandler      *handler.DoctorHandler
	ServiceHandler     *handler.ServiceHandler
	AppointmentHandler *handler.AppointmentHandler
	AuthHandler        *handler.AuthHandler
	ManagerService     *service.ManagerService
}

func SetupRoutes(e *echo.Echo, h Handlers) {
	requireManager := middleware.RequireManager(h.ManagerService)

	e.File("/", "web/pages/appointment.html")
	e.File("/appointment", "web/pages/appointment.html")
	e.File("/team", "web/pages/team.html")
	e.File("/services", "web/pages/services.html")
	e.File("/status", "web/pages/status.html")
	e.File("/login", "web/pages/login.html")
	e.File("/manager/schedule", "web/pages/manager_schedule.html")
	e.File("/manager/appointments", "web/pages/manager_appointments.html")
	e.File("/manager/team", "web/pages/manager_team.html")
	e.File("/manager/services", "web/pages/manager_services.html")

	e.Static("/static", "web")
	e.Static("/styles", "web/styles")
	e.Static("/scripts", "web/scripts")
	e.Static("/images", "web/images")
	e.Static("/fonts", "web/fonts")

	e.POST("api/login", h.AuthHandler.Login)
	e.POST("api/logout", h.AuthHandler.Logout)

	e.GET("api/managers", h.AuthHandler.GetManagers, requireManager)
	e.POST("api/managers", h.AuthHandler.CreateManager, requireManager)
	e.DELETE("api/managers/:id", h.AuthHandler.DeleteManager, requireManager)

	e.GET("api/doctors/:id", h.DoctorHandler.GetByID)
	e.GET("api/doctors", h.DoctorHandler.GetAll)
	e.GET("api/doctors/:id/services", h.DoctorHandler.GetServices)
	e.GET("api/doctors/:id/calendar", h.DoctorHandler.GetCalendar)
	e.GET("api/doctors/:id/slots", h.DoctorHandler.GetSlots)
	e.POST("api/doctors", h.DoctorHandler.Create, requireManager)
	e.POST("api/doctors/:id/photo", h.DoctorHandler.UploadPhoto, requireManager)
	e.PUT("api/doctors/:id", h.DoctorHandler.Update, requireManager)
	e.DELETE("api/doctors/:id", h.DoctorHandler.Delete, requireManager)
	e.DELETE("api/doctors/:doctorId/services/:serviceId", h.DoctorHandler.DeleteService, requireManager)
	e.POST("api/doctors/:id/services", h.DoctorHandler.AddService, requireManager)

	e.GET("api/services/:id", h.ServiceHandler.GetByID)
	e.GET("api/services", h.ServiceHandler.GetAll)
	e.GET("api/services/:id/doctors", h.ServiceHandler.GetDoctors)
	e.POST("api/services", h.ServiceHandler.Create, requireManager)
	e.PUT("api/services/:id", h.ServiceHandler.Update, requireManager)
	e.DELETE("api/services/:id", h.ServiceHandler.Delete, requireManager)

	e.GET("api/appointments/:id", h.AppointmentHandler.GetByID)
	e.GET("api/appointments", h.AppointmentHandler.GetAll)
	e.POST("api/appointments", h.AppointmentHandler.Create)
	e.PUT("api/appointments/:id", h.AppointmentHandler.Update, requireManager)
	e.POST("api/appointments/:id/cancel", h.AppointmentHandler.Cancel)
	e.POST("api/appointments/:id/reschedule", h.AppointmentHandler.Reschedule)
	e.DELETE("api/appointments/:id", h.AppointmentHandler.Delete, requireManager)
}
