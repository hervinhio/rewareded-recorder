package mongodb

import (
	"errors"
	"go.mongodb.org/mongo-driver/mongo"
)

func IsNotFoundError(err error) bool {
	return errors.Is(err, mongo.ErrNoDocuments)
}
