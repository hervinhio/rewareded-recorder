package persistence

type PersistenceManagers struct {
	Users         UserPersistenceManager
	Groups        GroupPersistenceManager
	Attendance    AttendancePersistenceManager
	Config        ConfigPersistenceManager
	Notifications NotificationPersistenceManager
	Stats         StatsPersistenceManager
	Submissions   SubmissionPersistenceManager
	Publishers    PublisherPersistenceManager
}
