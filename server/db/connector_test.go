package db

import (
  "encoding/json"
  "errors"
  "fmt"
  "github.com/stretchr/testify/assert"
  "testing"
)

type mockconnector struct{}
type Data struct {
  Id   int
  Name string
}
type User struct {
  Name  string
  Id    string
  Email string
  Age   int
}

const userTable = "users"

func (mc *mockconnector) InsertOne(record interface{}, table string) (map[string]interface{}, error) {
  var result map[string]interface{}

  if table == "Fail" {
    return result, errors.New("insert failed")
  }

  b, _ := json.Marshal(record)
  _ = json.Unmarshal(b, &result)

  return result, nil
}

func (mc *mockconnector) Connect() {

}

func (mc *mockconnector) DeleteOne(criteria interface{}, table string) (int64, error) {
  if table == "invalid_table" {
    return 0, fmt.Errorf("collection/table does not exist")
  } else if criteria == "InvalidInput" {
    return 0, fmt.Errorf("Invalid input")
  }

  return 1, nil
}

func (mc *mockconnector) FindOne(criteria interface{}, table string) (map[string]interface{}, error) {
  if table == "nonExistentTable" {
    return map[string]interface{}{}, fmt.Errorf("collection/table does not exist")
  }
  return map[string]interface{}{}, nil
}

func (mc *mockconnector) UpdateOne(criteria interface{}, update interface{}, table string) error {
  if table == "invalid_table" {
    return fmt.Errorf("collection/table not found")
  }

  if (criteria.(Data)).Id == -1 {
    return fmt.Errorf("no matching record")
  }

  return nil
}

func (mc *mockconnector) FindMany(criteria interface{}, table string) ([]map[string]interface{}, error) {
  if table == "invalid_table" || table == "" {
    return make([]map[string]interface{}, 0), fmt.Errorf("collection/table does not exist")
  }

  return []map[string]interface{} {
    map[string]interface{}{
  "id": "1"
}, map[string]interface{}{"id": "2"},
}, nil
}

func (mc *mockconnector) UpsertOne(criteria interface{}, update interface{}, table string) error {
  if table == "invalid_table" {
    return fmt.Errorf("collection/table not found")
  } else if (criteria.(User)).Id == "-1" {
    return fmt.Errorf("critiera does not match any record")
  }
  return nil
}

func (mc *mockconnector) Ping() bool {
  return true
}

func (mc *mockconnector) Close() error {
  return nil
}

func TestInsertOne(t *testing.T) {
  conn = &mockconnector{}

  type testData struct {
    name    string
    record  interface{}
    table   string
    want    interface{}
    wantErr bool
  }

  tests := []testData{
    {
      name:    "SingleRecordInsertSuccess",
      record:  Data{Id: 1, Name: "test1"},
      table:   "Table1",
      want:    Data{Id: 1, Name: "test1"},
      wantErr: false,
    },
    {
      name:    "SingleRecordInsertFailure",
      record:  Data{Id: 2, Name: "test2"},
      table:   "Fail",
      want:    Data{Id: 2, Name: "test2"},
      wantErr: true,
    },
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      _, err := InsertOne[Data](tt.record.(Data), tt.table)
      if (err != nil) != tt.wantErr {
        t.Errorf("InsertOne() error = %v, wantErr %v", err, tt.wantErr)
        return
      }
      if tt.wantErr && err == nil {
        t.Errorf("InsertOne() did not return an error")
      }
    })
  }
}

func TestDeleteOne(t *testing.T) {
  // Define the test cases
  tests := []struct {
    name     string
    criteria interface{}
    table    string
    err      error
  }{
    {
      name:     "ValidDelete",
      criteria: Data{}, // add appropriate values
      table:    "valid_table",
      err:      nil,
    },
    {
      name:     "InvalidTable",
      criteria: Data{}, // add appropriate values
      table:    "invalid_table",
      err:      errors.New("collection/table does not exist"), // assume corresponding error message
    },
    // add more test cases as needed
  }

  for _, test := range tests {
    t.Run(test.name, func(t *testing.T) {
      _, err := DeleteOne(test.criteria, test.table)
      if test.err != nil {
        assert.EqualError(t, err, test.err.Error())
      } else {
        assert.Nil(t, err)
      }
    })
  }
}

func TestFindOne(t *testing.T) {
  type test struct {
    inputCriteria interface{}
    inputTable    string
    wantErr       error
  }

  tests := []test{
    {
      inputCriteria: User{Name: "Alice", Age: 32},
      inputTable:    userTable,
      wantErr:       nil,
    },
    {
      inputCriteria: "InvalidInput",
      inputTable:    userTable,
      wantErr:       errors.New("Invalid input"),
    },
    {
      inputCriteria: User{Name: "Bob", Age: 44},
      inputTable:    "nonExistentTable",
      wantErr:       errors.New("collection/table does not exist"),
    },
  }

  for _, tt := range tests {
    _, err := FindOne[User](tt.inputCriteria, tt.inputTable)
    if err != nil && err.Error() != tt.wantErr.Error() {
      t.Errorf("FindOne(%v, %v) = %v; want %v", tt.inputCriteria, tt.inputTable, err, tt.wantErr)
    }
  }
}

func TestUpdateOne(t *testing.T) {
  type args struct {
    criteria interface{}
    update   interface{}
    table    string
  }
  tests := []struct {
    name    string
    args    args
    wantErr bool
  }{
    {
      name: "Test valid case",
      args: args{
        criteria: Data{Id: 1},
        update:   Data{Name: "Jimmy"},
        table:    userTable,
      },
      wantErr: false,
    },
    {
      name: "Test ummatching criteria",
      args: args{
        criteria: Data{Id: -1},
        update:   Data{Name: "Antoine"},
        table:    userTable,
      },
      wantErr: true,
    },
    {
      name: "Test invalid table",
      args: args{
        criteria: Data{Id: -1},
        update:   Data{Name: "Antoine"},
        table:    "invalid_table",
      },
      wantErr: true,
    },
  }
  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      if err := UpdateOne[Data](tt.args.criteria, tt.args.update, tt.args.table); (err != nil) != tt.wantErr {
        t.Errorf("UpdateOne() error = %v, wantErr %v", err, tt.wantErr)
      }
    })
  }
}

func TestUpsertOne(t *testing.T) {
  type args struct {
    criteria interface{}
    update   interface{}
    table    string
  }

  tests := []struct {
    name    string
    args    args
    wantErr bool
  }{
    {
      name: "ValidUpsert",
      args: args{
        criteria: User{
          Id:    "123",
          Email: "test@test.com",
        },
        update: User{
          Id:    "123",
          Email: "updated@test.com",
        },
        table: "user",
      },
      wantErr: false,
    },
    {
      name: "InvalidTable",
      args: args{
        criteria: User{
          Id:    "123",
          Email: "test@Test.com",
        },
        update: User{
          Id:    "123",
          Email: "updated@test.com",
        },
        table: "invalid_table",
      },
      wantErr: true,
    },
    {
      name: "InvalidCriteria",
      args: args{
        criteria: User{
          Id:    "-1",
          Email: "test@Test.com",
        },
        update: User{
          Id:    "123",
          Email: "updated@test.com",
        },
        table: userTable,
      },
      wantErr: true,
    },
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      err := UpsertOne[User](tt.args.criteria, tt.args.update, tt.args.table)
      if (err != nil) != tt.wantErr {
        t.Errorf("UpsertOne() error = %v, wantErr %v", err, tt.wantErr)
        return
      }
    })
  }
}

func TestFindMany(t *testing.T) {
  tests := []struct {
    name     string
    criteria interface{}
    table    string
    wantErr  bool
  }{
    {
      name:     "valid input without error",
      criteria: "test",
      table:    "table1",
      wantErr:  false,
    },
    {
      name:     "empty criteria",
      criteria: "",
      table:    "table1",
      wantErr:  false,
    },
    {
      name:     "nonexistent table",
      criteria: "test",
      table:    "invalid_table",
      wantErr:  true,
    },
    {
      name:     "empty table and criteria",
      criteria: "",
      table:    "",
      wantErr:  true,
    },
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      result, err := FindMany[User](tt.criteria, tt.table)
      if (err != nil) != tt.wantErr {
        t.Errorf("FindMany() error = %v, want %v", err, tt.wantErr)
      }
      if err == nil && len(result) == 0 {
        t.Errorf("FindMany() got empty result, want non-empty result, err=%v", result)
      }
    })
  }
}
