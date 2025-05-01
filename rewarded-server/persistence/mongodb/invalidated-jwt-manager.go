package mongodb

import (
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type InvalidatedJWTManager struct {
}

func IsInvalidated(jwt string) (bool, error) {
	_, err := findOne(collectionInvalidJwt, bson.M{"jwt": jwt})
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		} else {
			return false, err
		}
	}

	return false, nil
}

func InvalidateToken(jwt string) error {
	_, err := insertOne(collectionInvalidJwt, bson.M{"jwt": jwt})
	return err
}
