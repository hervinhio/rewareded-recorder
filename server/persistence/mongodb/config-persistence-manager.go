package mongodb

import (
	"github.com/hervinhio/rewarded-recorder/entities"
)

type ConfigPersistenceManager struct {
}

func (m ConfigPersistenceManager) UpdateOne(criteria entities.Config, update entities.Config) (entities.Config, error) {
	return updateOne(collectionConfigs, criteria, update)
}

func (m ConfigPersistenceManager) DeleteOne(criteria entities.Config) (int64, error) {
	return deleteOne(collectionConfigs, criteria)
}

func (m ConfigPersistenceManager) InsertOne(config entities.Config) (entities.Config, error) {
	_, err := insertOne(collectionConfigs, config)
	return config, err
}

func (m ConfigPersistenceManager) FindOne(criteria entities.Config) (entities.Config, error) {
	return findOne(collectionConfigs, criteria)
}

func (m ConfigPersistenceManager) FindMany(criteria entities.Config) ([]entities.Config, error) {
	return findMany(collectionConfigs, criteria)
}
