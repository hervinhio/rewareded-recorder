package mongo

import (
  "context"
  "encoding/json"
  "fmt"
  "go.mongodb.org/mongo-driver/bson"
  "go.mongodb.org/mongo-driver/bson/primitive"
  "log"
  "os"

  "go.mongodb.org/mongo-driver/mongo"
  "go.mongodb.org/mongo-driver/mongo/options"
)

// Connector is a type that represents a connection to a MongoDB database.
type Connector struct {
  client  *mongo.Client
  context context.Context
  db      *mongo.Database
}

// Connect connects to the database using the provided URL and database name.
func (c *Connector) Connect() {
  var err error
  dbUrl := os.Getenv("DATABASE_URL")
  dbName := os.Getenv("DATABASE_NAME")

  if dbUrl == "" {
    log.Fatal("The variable DATABASE_URL is not defined. Please define it.")
  }

  c.context = context.TODO()
  c.client, err = mongo.Connect(c.context, options.Client().ApplyURI(dbUrl))
  if err != nil {
    log.Fatalf("Cannot connect to the database [%s], err=[%v]", dbUrl, err)
  }

  err = c.client.Ping(c.context, nil)
  if err != nil {
    log.Fatalf("Database is unavailable, err=[%v]", err)
  }

  c.db = c.client.Database(dbName)
}

// InsertOne inserts a single document into the specified collection and returns the inserted document with the updated ID field if available.
func (c *Connector) InsertOne(record interface{}, collection string) (map[string]interface{}, error) {
  result, err := c.getCollection(collection).InsertOne(c.context, record)

  if err != nil {
    return map[string]interface{}{}, err
  }

  b, _ := json.Marshal(record)
  var mapRecord map[string]interface{}
  _ = json.Unmarshal(b, &mapRecord)
  mapRecord["_id"] = result.InsertedID.(primitive.ObjectID)
  mapRecord["id"] = result.InsertedID.(primitive.ObjectID).Hex()
  return mapRecord, nil
}

func (c *Connector) getCollection(name string) *mongo.Collection {
  return c.db.Collection(name)
}

// DeleteOne deletes a single record from the specified collection.
// It takes the `record` parameter as the filter to match the record to delete,
// and the `collection` parameter as the name of the collection where the record will be deleted from.
// The method returns an error if any error occurs during the deletion process.
//
// Example usage:
//
//	err := connector.DeleteOne(myRecord, "myCollection")
//
// Where `connector` is an instance of the `Connector` struct, `myRecord` is the record to delete,
// and "myCollection" is the name of the collection.
//
// The record matching the provided filter will be deleted from the collection.
// If no matching record is found, the method will not return an error.
func (c *Connector) DeleteOne(record interface{}, collection string) (int64, error) {
  col := c.getCollection(collection)
  result, err := col.DeleteOne(c.context, record)
  return result.DeletedCount, err
}

// FindOne finds a single document in the specified collection that matches the given criteria.
// It takes the following parameters:
// - record: a pointer to the structure that will hold the result of the query
// - collection: the name of the collection to search in
// It returns a map[string]interface{} and an error. The map[string]interface{} represents the found document, or an empty document if no match was found.
// The error contains any error that occurred during the operation, or nil if it was successful.
func (c *Connector) FindOne(record interface{}, collection string) (map[string]interface{}, error) {
  var output map[string]interface{}
  col := c.getCollection(collection)
  err := col.FindOne(c.context, record).Decode(&output)
  if err != nil {
    return output, err
  }

  output["id"] = output["_id"].(primitive.ObjectID).Hex()
  output["isLoadedFromDb"] = true

  return output, err
}

// UpdateOne updates a single document in the specified collection based on the given criteria.
// The criteria is used to identify the document to be updated.
// The update parameter specifies the changes to be applied to the document.
// The collection parameter specifies the name of the collection to update.
// Returns an error if the update operation fails.
func (c *Connector) UpdateOne(criteria interface{}, update interface{}, collection string) error {
  return c.updateOneWithOptions(criteria, update, collection, false)
}

func (c *Connector) updateOneWithOptions(criteria interface{}, update interface{}, collection string, upsert bool) error {
  var opts *options.UpdateOptions
  if upsert {
    opts = options.Update().SetUpsert(true)
  }

  col := c.getCollection(collection)
  result, err := col.UpdateOne(c.context, criteria, primitive.M{"$set": update}, opts)
  if err != nil {
    return err
  }

  if result.ModifiedCount == 0 && result.UpsertedCount == 0 {
    return fmt.Errorf("No records were updated/upserted")
  }

  return nil
}

// UpsertOne updates a document in the specified collection if it exists,
// otherwise it inserts a new document with the provided criteria and update data.
// It uses the updateOneWithOptions method with upsert set to true.
func (c *Connector) UpsertOne(criteria interface{}, update interface{}, collection string) error {
  return c.updateOneWithOptions(criteria, update, collection, true)
}

// FindMany retrieves multiple records from the specified collection based on the given criteria.
// It returns a slice of records and any error that occurred during the retrieval process.
// The criteria parameter is used to filter the records to be retrieved from the collection.
// The collection parameter specifies the name of the collection to retrieve records from.
//
// Example:
//
//	criteria := bson.M{"age": bson.D{{"$gt", 30}}}
//	collection := "users"
//	records, err := conn.FindMany(criteria, collection)
//	if err != nil {
//	    log.Fatal(err)
//	}
//
// This method internally invokes the getCollection() method to obtain a handle to the specified collection.
// It then uses the col.Find() method to retrieve a cursor representing the result of the query.
// The cursor.Next() method is used to iterate through the result set, and each record is appended to the output slice.
// If any decoding error occurs while processing a record, the method returns the output slice along with the error.
// Otherwise, it returns the output slice and any error that occurred during retrieval.
func (c *Connector) FindMany(criteria interface{}, collection string) ([]map[string]interface{}, error) {
  output := make([]map[string]interface{}, 0)
  col := c.getCollection(collection)
  cursor, err := col.Find(c.context, criteria)
  if err != nil {
    if err == mongo.ErrNoDocuments {
      return output, nil
    }

    return output, err
  }

  for cursor.Next(c.context) {
    var row map[string]interface{}
    if err = cursor.Decode(&row); err != nil {
      return output, err
    }

    row["id"] = row["_id"].(primitive.ObjectID).Hex()
    row["isLoadedFromDb"] = true
    output = append(output, row)
  }

  return output, err
}

// Ping pings the database to check if it is reachable. Returns true if the
// ping is successful, false otherwise.
func (c *Connector) Ping() bool {
  err := c.client.Ping(c.context, nil)
  if err != nil {
    log.Printf("Error ping the database, %v\n", err)
  }
  return err == nil
}

// Close disconnects from the MongoDB database by calling the Disconnect method on the client.
// It returns an error if any error occurs during the disconnection process.
func (c *Connector) Close() error {
  return c.client.Disconnect(c.context)
}

func (c *Connector) AppendChild(criteria interface{}, relationship string, update interface{}, collection string) error {
  col := c.getCollection(collection)
  _, err := col.UpdateOne(c.context, criteria, bson.M{"$push": bson.M{relationship: update}})
  return err
}

func (c *Connector) GetChild(parentId interface{}, childId interface{}, relationship string, childIdField string, collection string) (map[string]interface{}, error) {
  col := c.getCollection(collection)
  result, err := col.Aggregate(c.context, []interface{}{
    map[string]interface{}{"$match": map[string]interface{}{"_id": parentId, relationship + "." + childIdField: childId}},
    map[string]interface{}{"$project": map[string]interface{}{
      "child": map[string]interface{}{
        "$filter": map[string]interface{}{
          "input": "$" + relationship,
          "as":    "child",
          "cond": map[string]interface{}{
            "$eq": []interface{}{"$$child." + childIdField, childId},
          },
        },
      },
      "_id": 0,
    }},
    map[string]interface{}{"$unwind": map[string]interface{}{
      "path":                       "$child",
      "preserveNullAndEmptyArrays": false,
    }},
  })

  if err != nil {
    return nil, err
  }

  var output map[string]interface{}
  if result.Next(c.context) {
    if err = result.Decode(&output); err != nil {
      return nil, err
    }

    child := output["child"].(map[string]interface{})
    child["isLoadedFromDb"] = true
    return child, nil
  }

  return nil, fmt.Errorf("cannot find records")
}

func (c *Connector) UpdateChild(criteria interface{}, relationship string, update interface{}, collection string) error {
  col := c.getCollection(collection)
  _, err := col.UpdateOne(c.context, criteria, bson.M{"$set": bson.M{relationship + ".$": update}})
  return err
}

func (c *Connector) DeleteChild(ids []interface{}, fieldsTree []string, collection string) (map[string]interface{}, error) {
  fieldsCount := len(fieldsTree)
  idsCount := len(ids)
  if fieldsCount != (idsCount-1)*2 {
    return nil, fmt.Errorf("count of ids and fields trees should match. The fields arborescence must be [child, idFieldOfChild, subChild, idFieldOfSubChild...]")
  }

  var opts = options.FindOneAndUpdate().
    SetUpsert(false).
    SetReturnDocument(options.After)
  update := bson.M{}
  if len(ids) == 3 {
    update["$pull"] = bson.M{fieldsTree[0] + ".$[element]." + fieldsTree[2]: bson.M{fieldsTree[3]: ids[2]}}
    opts.SetArrayFilters(options.ArrayFilters{Filters: []interface{}{bson.M{"element." + fieldsTree[1]: ids[1]}}})
  } else if len(ids) == 2 {
    update["$pull"] = bson.M{fieldsTree[0]: bson.M{fieldsTree[1]: ids[1]}}
  } else {
    return nil, fmt.Errorf("invalid relationship")
  }

  u, _ := json.Marshal(update)
  q, _ := json.Marshal(bson.M{
    "_id":                               ids[0],
    fieldsTree[0] + "." + fieldsTree[1]: ids[1],
  })
  log.Printf("The query would be %s", string(q))
  log.Printf("The update data would be %s", string(u))

  col := c.getCollection(collection)
  result := col.FindOneAndUpdate(
    c.context,
    bson.M{
      "_id":                               ids[0],
      fieldsTree[0] + "." + fieldsTree[1]: ids[1],
    },
    update,
    opts,
  )

  if result.Err() != nil {
    return nil, result.Err()
  }

  var output map[string]interface{}
  if err := result.Decode(&output); err != nil {
    return nil, err
  }

  return output, nil
}

func (c *Connector) GetIdField() string {
  return "_id"
}

func (c *Connector) StringToId(str string) interface{} {
  objId, err := primitive.ObjectIDFromHex(str)
  if err != nil {
    log.Printf("Error converting objectId to primitive.ObjectID. %v\n", err)
    return nil
  }

  return objId
}

func (c *Connector) IsNotFoundError(err error) bool {
  return err == mongo.ErrNoDocuments
}

func (c *Connector) NewAutoId() interface{} {
  return primitive.NewObjectID()
}
