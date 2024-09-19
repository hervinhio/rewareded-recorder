package managers

import "github.com/hervinhio/rewarded-recorder/entities"

type GroupPersistenceManager interface {
  UpdateOne(criteria entities.Group, update entities.Group) (entities.Group, error)
  DeleteOne(criteria entities.Group) (int64, error)
  InsertOne(user entities.Group) (entities.Group, error)
  FindOne(criteria entities.Group) (entities.Group, error)
  FindMany(criteria entities.Group) ([]entities.Group, error)
  InsertOnePublisher(groupId string, user entities.Publisher) (entities.Publisher, error)
  DeleteOnePublisher(groupId string, user entities.Publisher) (int64, error)
}
