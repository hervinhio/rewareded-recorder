package main

import (
  "github.com/go-chi/chi"
  "github.com/go-chi/cors"
  "github.com/hervinhio/rewarded-recorder/db"
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
  registerRoutes(router)

  router.Use(cors.Handler(cors.Options{
    AllowedOrigins:   []string{"https://*", "http://*"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "POST", "OPTIONS"},
    AllowedHeaders:   []string{"*"},
    ExposedHeaders:   []string{"Link"},
    AllowCredentials: false,
    MaxAge:           300,
  }))

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

func registerRoutes(router chi.Router) {
  router.Get("/api/health", api.GetHealth)
}
