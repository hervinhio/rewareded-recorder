package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type SubmissionPersistenceManager interface {
  UpdateOne(criteria entities.Submission, update entities.Submission) (entities.Submission, error)
  DeleteOne(criteria entities.Submission) (int64, error)
  InsertOne(user entities.Submission) (entities.Submission, error)
  FindOne(criteria entities.Submission) (entities.Submission, error)
  FindMany(criteria entities.Submission) ([]entities.Submission, error)
}
