package mongodb

import (
  "github.com/hervinhio/rewarded-recorder/entities"
  "github.com/hervinhio/rewarded-recorder/persistence/pagination"
  "go.mongodb.org/mongo-driver/bson"
  "go.mongodb.org/mongo-driver/bson/primitive"
)

type UserPersistenceManager struct{}

func (m UserPersistenceManager) UpdateOne(criteria entities.User, update entities.User) (entities.User, error) {
  return updateOne(collectionUsers, criteria, update, false)
}

func (m UserPersistenceManager) DeleteOne(criteria entities.User) (int64, error) {
  return deleteOne(collectionUsers, criteria)
}

func (m UserPersistenceManager) InsertOne(user entities.User) (entities.User, error) {
  id, err := insertOne(collectionUsers, user)
  user.Id = id
  return user, err
}

func (m UserPersistenceManager) FindOne(criteria entities.User) (entities.User, error) {
  return findOne(collectionUsers, criteria)
}

func (m UserPersistenceManager) FindMany(criteria entities.User, pagination pagination.Pagination) ([]entities.User, error) {
  return findMany(collectionUsers, criteria, pagination)
}

func (m UserPersistenceManager) InsertOneNotification(realmId string, notification entities.Notification) error {
  actorBsonId, err := primitive.ObjectIDFromHex(notification.AuthorId)
  if err != nil {
    return err
  }

  _, err = db.Collection(collectionUsers).UpdateMany(
    ctx,
    bson.M{"realmId": realmId, "_id": bson.M{"$ne": actorBsonId}},
    bson.M{"$push": notification},
  )
  if err != nil {
    return err
  }

  return nil
}
