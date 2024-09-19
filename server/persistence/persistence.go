package persistence

import "github.com/hervinhio/rewarded-recorder/persistence/managers"

type PersistenceManagers struct {
  Users         managers.UserPersistenceManager
  Groups        managers.GroupPersistenceManager
  Attendance    managers.AttendancePersistenceManager
  Config        managers.ConfigPersistenceManager
  Notifications managers.NotificationPersistenceManager
  Stats         managers.StatsPersistenceManager
  Submissions   managers.SubmissionPersistenceManager
  Publishers    managers.PublisherPersistenceManager
}
