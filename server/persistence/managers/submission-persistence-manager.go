package managers

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

type SubmissionPersistenceManager interface {
	UpdateOne(criteria entities.Submission, update entities.Submission) (entities.Submission, error)
	DeleteOne(criteria entities.Submission) (int64, error)
	InsertOne(user entities.Submission) (entities.Submission, error)
	FindOne(criteria entities.Submission) (entities.Submission, error)
	FindMany(criteria entities.Submission, pagination pagination.Pagination) ([]entities.Submission, error)
}
