package managers

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

type PublisherPersistenceManager interface {
	UpdateOne(criteria entities.Publisher, update entities.Publisher) (entities.Publisher, error)
	DeleteOne(criteria entities.Publisher) (int64, error)
	InsertOne(user entities.Publisher) (entities.Publisher, error)
	FindOne(criteria entities.Publisher) (entities.Publisher, error)
	FindMany(criteria entities.Publisher, pagination pagination.Pagination) ([]entities.Publisher, error)
	UpdateReport(criteria entities.Publisher, report entities.Report) (entities.Publisher, error)
	InsertOneReport(criteria entities.Publisher, report entities.Report) (entities.Publisher, error)
	DeleteOneReport(criteria entities.Publisher, reportCriteria entities.Report) (entities.Publisher, error)
}
