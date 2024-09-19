package mongodb

import (
  "github.com/hervinhio/rewarded-recorder/persistence/pagination"
  "go.mongodb.org/mongo-driver/bson/primitive"
  "go.mongodb.org/mongo-driver/mongo/options"
)

func findOne[T any](collection string, criteria T) (T, error) {
  var result T
  err := db.Collection(collection).FindOne(ctx, criteria).Decode(&result)
  if err != nil {
    return result, err
  }

  return result, nil
}

func updateOne[T any](collection string, criteria T, update T, upsert bool) (T, error) {
  opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

  if upsert {
    opts = opts.SetUpsert(true)
  }

  result := db.Collection(collection).FindOneAndUpdate(ctx, criteria, update, opts)
  if result.Err() != nil {
    return update, result.Err()
  }

  var output T
  if err := result.Decode(&output); err != nil {
    return update, err
  }

  return output, nil
}

func deleteOne[T any](collection string, criteria T) (int64, error) {
  result, err := db.Collection(collection).DeleteOne(ctx, criteria)
  if err != nil {
    return 0, err
  }

  return result.DeletedCount, nil
}

func findMany[T any](collection string, criteria T, pagination pagination.Pagination) ([]T, error) {
  opts := options.Find().SetSkip(int64(pagination.Skip)).SetLimit(int64(pagination.Take))
  result, err := db.Collection(collection).Find(ctx, criteria, opts)
  if err != nil {
    return nil, err
  }

  var records []T
  for result.Next(ctx) {
    var record T
    err := result.Decode(&record)
    if err != nil {
      return nil, err
    }
    records = append(records, record)
  }

  return records, nil
}

func insertOne[T any](collection string, record T) (string, error) {
  result, err := db.Collection(collection).InsertOne(ctx, record)
  if err != nil {
    return "", err
  }

  return result.InsertedID.(primitive.ObjectID).Hex(), nil
}
