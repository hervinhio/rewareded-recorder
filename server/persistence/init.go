package persistence

import (
	"github.com/hervinhio/rewarded-recorder/persistence/mongodb"
	"log"
	"os"
)

var AllManagers PersistenceManagers

// Initialize initializes the connector and establishes a connection.
func Initialize() {
	if os.Getenv("DATABASE_SYSTEM") == "mongodb" {
		mongodb.Setup()

		AllManagers = PersistenceManagers{
			Users:         mongodb.UserPersistenceManager{},
			Groups:        mongodb.GroupPersistenceManager{},
			Attendance:    mongodb.AttendancePersistenceManager{},
			Config:        mongodb.ConfigPersistenceManager{},
			Notifications: mongodb.NotificationPersistenceManager{},
			Stats:         mongodb.StatsPersistenceManager{},
			Submissions:   mongodb.SubmissionPersistenceManager{},
			Publishers:    mongodb.PublisherPersistenceManager{},
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
