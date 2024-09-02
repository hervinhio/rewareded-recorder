package main

import (
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/joho/godotenv"
  "log"
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
}
