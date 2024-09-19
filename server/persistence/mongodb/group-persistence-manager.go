package mongodb

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"go.mongodb.org/mongo-driver/bson"
)

type GroupPersistenceManager struct{}

func (m GroupPersistenceManager) UpdateOne(criteria entities.Group, update entities.Group) (entities.Group, error) {
	return updateOne(collectionGroups, criteria, update)
}

func (m GroupPersistenceManager) DeleteOne(criteria entities.Group) (int64, error) {
	return deleteOne(collectionGroups, criteria)
}

func (m GroupPersistenceManager) InsertOne(group entities.Group) (entities.Group, error) {
	_, err := insertOne(collectionGroups, group)
	return group, err
}

func (m GroupPersistenceManager) FindOne(criteria entities.Group) (entities.Group, error) {
	return findOne(collectionGroups, criteria)
}

func (m GroupPersistenceManager) FindMany(criteria entities.Group) ([]entities.Group, error) {
	return findMany(collectionGroups, criteria)
}

func (m GroupPersistenceManager) InsertOnePublisher(groupId string, publisher entities.Publisher) (entities.Publisher, error) {
	publisher.GroupId = groupId
	id, err := insertOne(collectionPublishers, publisher)
	publisher.Id = id

	return publisher, err
}

func (m GroupPersistenceManager) DeleteOnePublisher(groupId string, publisher entities.Publisher) (int64, error) {
	result, err := db.Collection(collectionPublishers).DeleteOne(ctx, bson.M{"groupId": groupId, "_id": publisher.Id})
	if err != nil {
		return 0, err
	}

	return result.DeletedCount, nil
}
