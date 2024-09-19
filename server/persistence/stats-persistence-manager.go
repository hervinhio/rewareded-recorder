package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type StatsPersistenceManager interface {
	DeleteOne(criteria entities.Stats, update entities.AttendanceRecord) (int64, error)
	InsertOne(user entities.AttendanceRecord) (entities.AttendanceRecord, error)
	FindOne(criteria entities.AttendanceRecord) (entities.AttendanceRecord, error)
	FindMany(criteria entities.AttendanceRecord) ([]entities.AttendanceRecord, error)
}
