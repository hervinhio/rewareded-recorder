package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type SubmissionPersistenceManager struct{}

func (m *SubmissionPersistenceManager) UpdateOne(criteria entities.Submission, update entities.Submission) (entities.Submission, error) {
	return updateOne(collectionSubmissions, criteria, update)
}

func (m *SubmissionPersistenceManager) DeleteOne(criteria entities.Submission) (int64, error) {
	return deleteOne(collectionSubmissions, criteria)
}

func (m *SubmissionPersistenceManager) InsertOne(submission entities.Submission) (entities.Submission, error) {
	_, err := insertOne(collectionSubmissions, submission)
	return submission, err
}

func (m *SubmissionPersistenceManager) FindOne(criteria entities.Submission) (entities.Submission, error) {
	return findOne(collectionSubmissions, criteria)
}

func (m *SubmissionPersistenceManager) FindMany(criteria entities.Submission) ([]entities.Submission, error) {
	return findMany(collectionSubmissions, criteria)
}
