package main

import (
  "github.com/go-chi/chi"
  "github.com/go-chi/cors"
  "github.com/hervinhio/rewarded-recorder/api"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/middlewares"
  "github.com/joho/godotenv"
  "log"
  "net/http"
  "os"
)

func main() {
  initializeEnvironment()
  db.Initialize(nil)
  initializeServer()
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

  // Users
  router.Get("/api/users", api.HandleGetUsers)
  router.Post("/api/users", api.HandleCreateUser)
  router.Get("/api/users/{id}", api.HandleGetUser)
  router.Delete("/api/users/{id}", api.HandleDeleteUser)
  router.Patch("/api/users/{id}", api.HandleUpdateUser)

  // Publishers
  router.Get("/api/publishers", api.HandleGetPublishers)
  router.Post("/api/publishers", api.HandleCreatePublisher)
  router.Get("/api/publishers/{id}", api.HandleGetPublisher)
  router.Delete("/api/publishers/{id}", api.HandleDeletePublisher)
  router.Patch("/api/publishers/{id}", api.HandleUpdatePublisher)

  // Reports
  router.Post("/api/publishers/{id}/reports", api.HandleCreateReport)
  router.Patch("/api/publishers/{id}/reports/{reportId}", api.HandleUpdateReport)
  router.Delete("/api/publishers/{id}/reports/{reportId}", api.HandleDeleteReport)

  // Attendance records
  router.Post("/api/attendance", api.HandleCreateAttendanceRecord)
  router.Patch("/api/attendance/{id}", api.HandleUpdateAttendanceRecord)
  router.Delete("/api/attendance/{id}", api.HandleDeleteAttendanceRecord)
  router.Get("/api/attendance", api.HandleGetAttendanceRecords)

  // Configs
  router.Get("/api/configs/{userId}", api.HandleGetConfig)
  router.Patch("/api/configs/{userId}", api.HandleUpdateConfig)
}
