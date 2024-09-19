package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type UserPersistenceManager struct{}

func (m *UserPersistenceManager) UpdateOne(criteria entities.User, update entities.User) (entities.User, error) {
  return updateOne(collectionUsers, criteria, update)
}

func (m *UserPersistenceManager) DeleteOne(criteria entities.User) (int64, error) {
  return deleteOne(collectionUsers, criteria)
}

func (m *UserPersistenceManager) InsertOne(user entities.User) (entities.User, error) {
  _, err := deleteOne(collectionUsers, user)
  return user, err
}

func (m *UserPersistenceManager) FindOne(criteria entities.User) (entities.User, error) {
  return findOne(collectionUsers, criteria)
}

func (m *UserPersistenceManager) FindMany(criteria entities.User) ([]entities.User, error) {
  return findMany(collectionUsers, criteria)
}
