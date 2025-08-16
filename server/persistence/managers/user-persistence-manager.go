package managers

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

type UserPersistenceManager interface {
	UpdateOne(criteria entities.User, update entities.User) (entities.User, error)
	DeleteOne(criteria entities.User) (int64, error)
	InsertOne(user entities.User) (entities.User, error)
	FindOne(criteria entities.User) (entities.User, error)
	FindMany(criteria entities.User, pagination pagination.Pagination) ([]entities.User, error)
	InsertOneNotification(realmId string, notification entities.Notification) error
	MarkNotificationAsRead(userId string, notificationId string) error
	// New methods for report management in users array
	InsertOneReport(criteria entities.User, report entities.Report) (entities.User, error)
	UpdateReport(criteria entities.User, reportId string, report entities.Report) (entities.User, error)
	DeleteOneReport(criteria entities.User, reportCriteria entities.Report) (entities.User, error)
}
