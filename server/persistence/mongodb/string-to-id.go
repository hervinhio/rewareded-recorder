package mongodb

import "go.mongodb.org/mongo-driver/bson/primitive"

func StringToId(str string) (id primitive.ObjectID) {
  id, _ = primitive.ObjectIDFromHex(str)
  return id
}
