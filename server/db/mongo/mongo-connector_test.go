package mongo

import (
  "context"
  "fmt"
  mim "github.com/ONSdigital/dp-mongodb-in-memory"
  "os"
  "testing"
)

type user struct {
  Id           interface{}
  Name         string `bson:"name"`
  FirstName    string `bson:"firstName"`
  LastName     string `bson:"lastName"`
  EmailAddress string `bson:"emailAddress"`
}

type address struct {
  Street string
}

const userTable = "users"

func TestConnect(t *testing.T) {
  testCtx := context.Background()
  server, err := mim.Start(testCtx, "5.0.2")
  if err != nil {
    fmt.Printf("Error starting mongo in memory server, %v", err)
    t.Fail()
    return
  }

  defer server.Stop(testCtx)
  if os.Setenv("DATABASE_NAME", "pourrie") != nil || os.Setenv("DATABASE_URL", server.URI()) != nil {
    fmt.Printf("Unable to set environment variables, test must fail")
    t.Fail()
    return
  }

  connector := Connector{}

  t.Run("Connect()", func(t *testing.T) {
    connector.Connect()
  })

  t.Run("InsertOne()", func(t *testing.T) {
    t.Run("CorrectlySetsTheIdField", func(t *testing.T) {
      user := user{
        Name:      "John Doe",
        FirstName: "John",
        LastName:  "Doe",
      }
      record, err := connector.InsertOne(user, userTable)
      if err != nil {
        t.Errorf("Error inserting record: %v", err)
      }
      fmt.Printf("The result is %v", record)
      if record["_id"] == nil {
        t.Errorf("Id field not set")
      }
    })

    t.Run("CorrectlyInsertsARecord", func(t *testing.T) {
      user := user{
        Name:      "Jane Smith",
        FirstName: "Jane",
        LastName:  "Smith",
      }
      _, err := connector.InsertOne(user, userTable)
      if err != nil {
        t.Errorf("Error inserting record: %v", err)
      }
    })
  })

  t.Run("DeleteOne()", func(t *testing.T) {

    t.Run("DoesNotFailEvenWhenRecordDoesNotExist", func(t *testing.T) {
      record := user{
        Name:      "Castor",
        FirstName: "Troy",
      }
      deletedCount, err := connector.DeleteOne(record, userTable)
      if err != nil {
        t.Errorf("Error inserting record: %v", err)
      }

      if deletedCount > 0 {
        t.Errorf("Expectation failed, some records were deleted")
      }
    })

    t.Run("SuccessfullyDeletesARecord", func(t *testing.T) {
      record := user{
        Name:      "John Doe",
        FirstName: "John",
        LastName:  "Doe",
      }
      _, err = connector.InsertOne(record, userTable)
      if err != nil {
        t.Errorf("Error while insert record to delete")
      }

      deletedCount, err := connector.DeleteOne(record, userTable)
      if err != nil {
        t.Errorf("Error deleting record: %v", err)
      }

      if deletedCount != 1 {
        t.Errorf("Expectation failed, expected deletion count is 1")
      }
    })
  })

  t.Run("UpdateOne()", func(t *testing.T) {
    t.Run("SuccessfullyUpdatesARecord", func(t *testing.T) {
      record := user{
        Name:         "John Doe",
        FirstName:    "John",
        LastName:     "Doe",
        EmailAddress: "karibu@safari.world",
      }
      update := user{
        Name:      "Jane Smith",
        FirstName: "Jane",
        LastName:  "Smith",
      }
      inserted, err := connector.InsertOne(record, userTable)
      if err != nil {
        t.Errorf("Error inserting test data")
      }

      found, err := connector.FindOne(map[string]interface{}{"_id": inserted["_id"]}, userTable)
      if err != nil {
        t.Errorf("Canot find the inserted record")
        return
      }
      fmt.Printf("The inserted record looks like %v\n", found)

      err = connector.UpdateOne(map[string]interface{}{"emailAddress": record.EmailAddress}, update, userTable)
      if err != nil {
        t.Errorf("Error updating record: %v", err)
        return
      }
    })
  })

  t.Run("FailsToUpdateUnexistingRecord", func(t *testing.T) {
    record := user{
      Name:         "John Doe",
      FirstName:    "John",
      LastName:     "Doe",
      EmailAddress: "karibu@safari.world",
    }
    update := user{
      Name:      "Jane Smith",
      FirstName: "Jane",
      LastName:  "Smith",
    }
    _, err = connector.InsertOne(record, userTable)
    if err != nil {
      t.Errorf("Error inserting test data")
    }

    err := connector.UpdateOne(map[string]interface{}{"emailAddress": "karibu@org.cd"}, update, userTable)
    if err == nil {
      t.Errorf("Error updating record: %v", err)
    }
  })

  t.Run("UpsertOne()", func(t *testing.T) {
    t.Run("CreatesARecordWhenNoMatchExists()", func(t *testing.T) {
      update := map[string]interface{}{
        "name":      "Jane Smith",
        "firstName": "Jane",
        "lastName":  "Smith",
      }
      err := connector.UpsertOne(map[string]interface{}{"emailAddress": "welcome@safari.world"}, update, userTable)
      if err != nil {
        t.Errorf("Error upserting record: %v", err)
      }

      record, err := connector.FindOne(map[string]interface{}{"emailAddress": "welcome@safari.world"}, userTable)
      if err != nil {
        t.Errorf("Error finding record: %v", err)
        return
      }

      if record["name"] != "Jane Smith" {
        t.Errorf("Expectation failed, record not found or not updated")
      }
    })

    t.Run("UpdatesTheExistingRecord()", func(t *testing.T) {
      record := user{
        Name:         "Jane Smith",
        FirstName:    "Jane",
        LastName:     "Smith",
        EmailAddress: "karibu@safari.world",
      }
      update := user{
        Name:      "Jane Smith",
        FirstName: "Jane",
        LastName:  "Smith",
      }

      _, err = connector.InsertOne(record, userTable)
      if err != nil {
        t.Errorf("Error inserting test data")
      }

      err := connector.UpsertOne(map[string]interface{}{"emailAddress": "karibu@safari.world"}, update, userTable)
      if err != nil {
        t.Errorf("Error upserting record: %v", err)
      }
    })
  })

  t.Run("FindMany()", func(t *testing.T) {
    t.Run("ShouldFindAllInsertedRecords()", func(t *testing.T) {
      _, err := connector.InsertOne(map[string]interface{}{"emailAddress": "sticky@sticker.com"}, userTable)
      if err != nil {
        t.Errorf("Unable to insert reacords, %v\n", err)
        return
      }
      _, err = connector.InsertOne(map[string]interface{}{"emailAddress": "maria@sticker.com"}, userTable)
      if err != nil {
        t.Errorf("Unable to insert reacords, %v\n", err)
        return
      }

      records, err := connector.FindMany(map[string]interface{}{}, userTable)
      if err != nil {
        t.Errorf("Error finding records: %v", err)
        return
      }

      if len(records) < 2 {
        t.Errorf("Expectation failed, expected at least records but found %d", len(records))
      }
    })

    t.Run("ReturnsEmptyArrayWhenTheCriteriaDoNotMatchRecords", func(t *testing.T) {
      criteria := map[string]interface{}{"emailAddress": "nonexistent@sticker.com"}
      records, err := connector.FindMany(criteria, userTable)
      if err != nil {
        t.Errorf("Error finding records: %v", err)
        return
      }

      if len(records) > 0 {
        t.Errorf("Expectation failed, expected 0 records but found %d", len(records))
      }
    })
  })

  t.Run("Ping()", func(t *testing.T) {
    t.Run("ShouldPingSuccessfully", func(t *testing.T) {
      if ok := connector.Ping(); !ok {
        t.Errorf("Error pinging the database")
      }
    })
  })
}
