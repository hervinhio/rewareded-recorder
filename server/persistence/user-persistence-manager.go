package persistence

import "github.com/hervinhio/rewarded-recorder/entities"

type UserPersistenceManager interface {
	UpdateOne(criteria entities.User, update entities.User) (entities.User, error)
	DeleteOne(criteria entities.User, update entities.User) (int64, error)
	InsertOne(user entities.User) (entities.User, error)
	FindOne(criteria entities.User) (entities.User, error)
	FindMany(criteria entities.User) ([]entities.User, error)
}
