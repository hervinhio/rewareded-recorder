package managers

import (
  "github.com/hervinhio/rewarded-recorder/entities"
)

type ConfigPersistenceManager interface {
  UpdateOne(criteria entities.Config, update entities.Config) (entities.Config, error)
  DeleteOne(criteria entities.Config) (int64, error)
  InsertOne(user entities.Config) (entities.Config, error)
  FindOne(criteria entities.Config) (entities.Config, error)
}
