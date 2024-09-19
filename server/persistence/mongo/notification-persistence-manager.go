package persistence

import (
	"github.com/hervinhio/rewarded-recorder/entities"
)

type NotificationPersistenceManager struct{}

func (m *NotificationPersistenceManager) UpdateOne(criteria entities.Notification, update entities.Notification) (entities.Notification, error) {
	return updateOne(collectionNotifications, criteria, update)
}

func (m *NotificationPersistenceManager) DeleteOne(criteria entities.Notification) (int64, error) {
	return deleteOne(collectionNotifications, criteria)
}

func (m *NotificationPersistenceManager) InsertOne(notification entities.Notification) (entities.Notification, error) {
	id, err := insertOne(collectionNotifications, notification)
	notification.Id = id
	return notification, err
}

func (m *NotificationPersistenceManager) FindOne(criteria entities.Notification) (entities.Notification, error) {
	return findOne(collectionNotifications, criteria)
}

func (m *NotificationPersistenceManager) FindMany(criteria entities.Notification) ([]entities.Notification, error) {
	return findMany(collectionNotifications, criteria)
}
