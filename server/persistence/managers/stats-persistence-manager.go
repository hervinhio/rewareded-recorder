package managers

import "github.com/hervinhio/rewarded-recorder/entities"

type StatsPersistenceManager interface {
  FindOne(criteria entities.Stats) (entities.Stats, error)
  UpdateOne(criteria entities.Stats, update entities.Stats) (entities.Stats, error)
}
