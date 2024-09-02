package main

import (
  "github.com/joho/godotenv"
  "log"
  "os"
)

func main() {
  initializeEnvironment()
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
