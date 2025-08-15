package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/hervinhio/rewarded-recorder/api"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/middlewares"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/joho/godotenv"
)

func main() {
	initializeEnvironment()
	persistence.Initialize()
	initializeServer()
	persistence.Teardown()
}

func initializeEnvironment() {
	mode := os.Getenv("MODE")
	if mode != "production" && mode != "docker" {
		if err := godotenv.Load(); err != nil {
			log.Fatalf("Unable to load .env, err=[%v]", err)
		}
		log.Printf("Running in development mode")
	}
}

func initializeServer() {
	portNum := os.Getenv("PORT")
	if portNum == "" {
		log.Fatal("The port is not set")
	}

	router := chi.NewRouter()
	registerMiddlewares(router)
	registerRoutes(router)

	host := os.Getenv("HOST")
	if host == "" {
		host = "localhost"
	}

	srv := &http.Server{
		Handler: router,
		Addr:    host + ":" + portNum,
	}

	log.Printf("The server is running on port: %v", portNum)

	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("Unable to start server, err=[%v]", err)
	}
}

func registerMiddlewares(router chi.Router) {
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	router.Use(middlewares.ResponseMiddleWare)
	router.Use(middlewares.AuthMiddleWare)
	router.Use(middlewares.PaginationMiddleWare)

}

func registerRoutes(router chi.Router) {
	router.Get("/health", api.HandleGetHealth)

	// Users - Require root permission for user administration
	router.With(middlewares.RequirePermission(entities.PermissionUserAdmin)).Get("/api/users", api.HandleGetUsers)
	router.With(middlewares.RequirePermission(entities.PermissionUserAdmin)).Post("/api/users", api.HandleCreateUser)
	router.Get("/api/users/{id}", api.HandleGetUser) // Allow users to view their own profile
	router.With(middlewares.RequirePermission(entities.PermissionUserAdmin)).Delete("/api/users/{id}", api.HandleDeleteUser)
	router.With(middlewares.RequirePermission(entities.PermissionUserAdmin)).Patch("/api/users/{id}", api.HandleUpdateUser)

	// Publishers - Require group admin or publisher management permission
	router.With(middlewares.RequireAnyPermission(entities.PermissionPublisherManage, entities.PermissionViewGroupMembers)).Get("/api/publishers", api.HandleGetPublishers)
	router.With(middlewares.RequirePermission(entities.PermissionPublisherManage)).Post("/api/publishers", api.HandleCreatePublisher)
	router.With(middlewares.RequireAnyPermission(entities.PermissionPublisherManage, entities.PermissionViewGroupMembers)).Get("/api/publishers/{id}", api.HandleGetPublisher)
	router.With(middlewares.RequirePermission(entities.PermissionPublisherManage)).Delete("/api/publishers/{id}", api.HandleDeletePublisher)
	router.With(middlewares.RequireAnyPermission(entities.PermissionPublisherManage, entities.PermissionContactEdit)).Patch("/api/publishers/{id}", api.HandleUpdatePublisher)

	// Reports - Require report management permission
	router.With(middlewares.RequirePermission(entities.PermissionReportManage)).Post("/api/publishers/{id}/reports", api.HandleCreateReport)
	router.With(middlewares.RequirePermission(entities.PermissionReportManage)).Patch("/api/publishers/{id}/reports/{reportId}", api.HandleUpdateReport)
	router.With(middlewares.RequirePermission(entities.PermissionReportManage)).Delete("/api/publishers/{id}/reports/{reportId}", api.HandleDeleteReport)
	// Missing Reports
	router.With(middlewares.RequireAnyPermission(entities.PermissionReportManage)).Get("/api/reports/missing-reports/download", api.HandleDownloadMissingReports)

	// Attendance records - Require attendance management permission
	router.With(middlewares.RequirePermission(entities.PermissionAttendanceManage)).Post("/api/attendance", api.HandleCreateAttendanceRecord)
	router.With(middlewares.RequirePermission(entities.PermissionAttendanceManage)).Patch("/api/attendance/{id}", api.HandleUpdateAttendanceRecord)
	router.With(middlewares.RequirePermission(entities.PermissionAttendanceManage)).Delete("/api/attendance/{id}", api.HandleDeleteAttendanceRecord)
	router.With(middlewares.RequireAnyPermission(entities.PermissionAttendanceManage, entities.PermissionViewGroupMembers)).Get("/api/attendance", api.HandleGetAttendanceRecords)

	// Configs - Allow basic access, more granular control in handlers
	router.Get("/api/configs/{userId}", api.HandleGetConfig)
	router.With(middlewares.RequirePermission(entities.PermissionConfigManage)).Patch("/api/configs/{userId}", api.HandleUpdateConfig)

	// Groups - Require group management permission
	router.With(middlewares.RequirePermission(entities.PermissionGroupManage)).Post("/api/groups", api.HandleCreateGroup)
	router.With(middlewares.RequirePermission(entities.PermissionGroupManage)).Patch("/api/groups/{id}", api.HandleUpdateGroup)
	router.With(middlewares.RequirePermission(entities.PermissionGroupManage)).Delete("/api/groups/{id}", api.HandleDeleteGroup)
	router.With(middlewares.RequireAnyPermission(entities.PermissionGroupManage, entities.PermissionViewGroupMembers)).Get("/api/groups/{id}", api.HandleGetGroup)
	router.With(middlewares.RequireAnyPermission(entities.PermissionGroupManage, entities.PermissionViewGroupMembers)).Get("/api/groups", api.HandleGetGroups)

	// Submissions - Basic access for viewing, report management for creating
	router.With(middlewares.RequirePermission(entities.PermissionReportManage)).Post("/api/submissions", api.HandleCreateSubmission)
	router.With(middlewares.RequireAnyPermission(entities.PermissionReportManage, entities.PermissionViewGroupMembers)).Get("/api/submissions", api.HandleGetSubmissions)

	// Notifications - Basic access for all authenticated users
	router.Post("/api/notifications", api.HandleCreateNotification)

	// Stats - Require view stats permission (admin level and above)
	router.With(middlewares.RequirePermission(entities.PermissionViewStats)).Patch("/api/stats", api.HandleUpdateStats)
}
