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
    bson.M{"$push": bson.M{"notifications": notification}},
  )
  if err != nil {
    return err
  }

  return nil
}

func (m UserPersistenceManager) MarkNotificationAsRead(userId string, notificationId string) error {
  userBsonId, err := primitive.ObjectIDFromHex(userId)
  if err != nil {
    return err
  }

  _, err = db.Collection(collectionUsers).UpdateOne(
    ctx,
    bson.M{"_id": userBsonId, "notifications.id": notificationId},
    bson.M{"$set": bson.M{"notifications.$.unread": false}},
  )
  if err != nil {
    return err
  }

  return nil
}

// InsertOneReport adds a report to the user's reports array
func (m UserPersistenceManager) InsertOneReport(criteria entities.User, report entities.Report) (entities.User, error) {
  userBsonId, err := primitive.ObjectIDFromHex(criteria.Id.(string))
  if err != nil {
    return entities.User{}, err
  }

  _, err = db.Collection(collectionUsers).UpdateOne(
    ctx,
    bson.M{"_id": userBsonId, "realmId": criteria.RealmId},
    bson.M{"$push": bson.M{"reports": report}},
  )
  if err != nil {
    return entities.User{}, err
  }

  // Return the updated user
  return m.FindOne(criteria)
}

// UpdateReport updates a specific report in the user's reports array
func (m UserPersistenceManager) UpdateReport(criteria entities.User, reportId string, report entities.Report) (entities.User, error) {
  userBsonId, err := primitive.ObjectIDFromHex(criteria.Id.(string))
  if err != nil {
    return entities.User{}, err
  }

  _, err = db.Collection(collectionUsers).UpdateOne(
    ctx,
    bson.M{"_id": userBsonId, "realmId": criteria.RealmId, "reports.id": reportId},
    bson.M{"$set": bson.M{"reports.$": report}},
  )
  if err != nil {
    return entities.User{}, err
  }

  // Return the updated user
  return m.FindOne(criteria)
}

// DeleteOneReport removes a specific report from the user's reports array
func (m UserPersistenceManager) DeleteOneReport(criteria entities.User, reportCriteria entities.Report) (entities.User, error) {
  userBsonId, err := primitive.ObjectIDFromHex(criteria.Id.(string))
  if err != nil {
    return entities.User{}, err
  }

  _, err = db.Collection(collectionUsers).UpdateOne(
    ctx,
    bson.M{"_id": userBsonId, "realmId": criteria.RealmId},
    bson.M{"$pull": bson.M{"reports": bson.M{"id": reportCriteria.Id}}},
  )
  if err != nil {
    return entities.User{}, err
  }

  // Return the updated user
  return m.FindOne(criteria)
}
