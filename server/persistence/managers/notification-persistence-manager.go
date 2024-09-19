package managers

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

type NotificationPersistenceManager interface {
	UpdateOne(criteria entities.Notification, update entities.Notification) (entities.Notification, error)
	DeleteOne(criteria entities.Notification) (int64, error)
	InsertOne(user entities.Notification) (entities.Notification, error)
	FindOne(criteria entities.Notification) (entities.Notification, error)
	FindMany(criteria entities.Notification, pagination pagination.Pagination) ([]entities.Notification, error)
}
