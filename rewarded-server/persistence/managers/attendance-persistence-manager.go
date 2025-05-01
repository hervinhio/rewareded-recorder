package managers

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

type AttendancePersistenceManager interface {
	UpdateOne(criteria entities.AttendanceRecord, update entities.AttendanceRecord) (entities.AttendanceRecord, error)
	DeleteOne(criteria entities.AttendanceRecord) (int64, error)
	InsertOne(user entities.AttendanceRecord) (entities.AttendanceRecord, error)
	FindOne(criteria entities.AttendanceRecord) (entities.AttendanceRecord, error)
	FindMany(criteria entities.AttendanceRecord, pagination pagination.Pagination) ([]entities.AttendanceRecord, error)
}
