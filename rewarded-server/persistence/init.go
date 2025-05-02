package persistence

import (
  "github.com/hervinhio/rewarded-recorder/persistence/mongodb"
  "log"
  "os"
)

var AllManagers Managers

// Initialize initializes the connector and establishes a connection.
func Initialize() {
  if os.Getenv("DATABASE_SYSTEM") == "mongodb" {
    mongodb.Setup()

    AllManagers = Managers{
      Users:         mongodb.UserPersistenceManager{},
      Groups:        mongodb.GroupPersistenceManager{},
      Attendance:    mongodb.AttendancePersistenceManager{},
      Config:        mongodb.ConfigPersistenceManager{},
      Notifications: mongodb.NotificationPersistenceManager{},
      Stats:         mongodb.StatsPersistenceManager{},
      Submissions:   mongodb.SubmissionPersistenceManager{},
      Publishers:    mongodb.PublisherPersistenceManager{},
      InvalidJWT:    mongodb.InvalidatedJWTPersistenceManager{},
    }
  } else {
    log.Fatal("Database system is not supported")
  }
}

func Teardown() {
  if os.Getenv("DATABASE_SYSTEM") == "mongodb" {
    mongodb.Teardown()
  }
}
