package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type NotificationPersistenceManager interface {
	UpdateOne(criteria entities.Notification, update entities.Notification) (entities.Notification, error)
	DeleteOne(criteria entities.Notification, update entities.Notification) (int64, error)
	InsertOne(user entities.Notification) (entities.Notification, error)
	FindOne(criteria entities.Notification) (entities.Notification, error)
	FindMany(criteria entities.Notification) ([]entities.Notification, error)
}
