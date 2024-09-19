package persistence

import (
  "github.com/hervinhio/rewarded-recorder/persistence/mongodb"
  "log"
  "os"
)

func IsNotFoundError(err error) bool {
  if os.Getenv("DATABAS_SYSTEM") == "mongodb" {
    return mongodb.IsNotFoundError(err)
  }

  log.Fatalf("Databse system is unsupported")
  return false
}
