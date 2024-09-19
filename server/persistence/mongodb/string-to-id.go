package mongodb

import "go.mongodb.org/mongo-driver/bson/primitive"

func StringToId(str string) (id primitive.ObjectID, err error) {
	return primitive.ObjectIDFromHex(str)
}
