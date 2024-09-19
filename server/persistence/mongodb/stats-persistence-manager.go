package mongodb

import "github.com/hervinhio/rewarded-recorder/entities"

type StatsPersistenceManager struct{}

func (m StatsPersistenceManager) UpdateOne(criteria entities.Stats, update entities.Stats) (entities.Stats, error) {
  return updateOne(collectionStats, criteria, update, true)
}

func (m StatsPersistenceManager) FindOne(criteria entities.Stats) (entities.Stats, error) {
  return findOne(collectionStats, criteria)
}
