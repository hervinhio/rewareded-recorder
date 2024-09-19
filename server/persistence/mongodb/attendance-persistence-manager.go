package mongodb

import (
  "github.com/hervinhio/rewarded-recorder/entities"
)

type AttendancePersistenceManager struct {
}

func (m AttendancePersistenceManager) UpdateOne(criteria entities.AttendanceRecord, update entities.AttendanceRecord) (entities.AttendanceRecord, error) {
  return updateOne(collectionAttendance, criteria, update)
}

func (m AttendancePersistenceManager) DeleteOne(criteria entities.AttendanceRecord) (int64, error) {
  return deleteOne(collectionAttendance, criteria)
}

func (m AttendancePersistenceManager) InsertOne(record entities.AttendanceRecord) (entities.AttendanceRecord, error) {
  id, err := insertOne(collectionAttendance, record)
  record.Id = id
  return record, err
}

func (m AttendancePersistenceManager) FindOne(criteria entities.AttendanceRecord) (entities.AttendanceRecord, error) {
  return findOne[entities.AttendanceRecord](collectionAttendance, criteria)
}

func (m AttendancePersistenceManager) FindMany(criteria entities.AttendanceRecord) ([]entities.AttendanceRecord, error) {
  return findMany(collectionAttendance, criteria)
}
