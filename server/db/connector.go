package db

// Connector is an interface that provides methods for connecting to a database and performing various operations on it.
// The methods defined in this interface allow for inserting, deleting, finding, updating, and upserting records in the database.
// It also includes a method for connecting to the database.
//
// Methods:
// - Connect: Connects to the database.
// - InsertOne: Inserts a record into the specified table in the database.
// - DeleteOne: Deletes a record from the specified table in the database based on the given criteria.
// - FindOne: Finds a single record from the specified table in the database based on the given criteria.
// - UpdateOne: Updates a record in the specified table in the database based on the given criteria and update data.
// - FindMany: Finds multiple records from the specified table in the database based on the given criteria.
// - UpsertOne: Upserts a record into the specified table in the database based on the given criteria and update data.
type Connector interface {
  Connect()

  InsertOne(record interface{}, table string) (map[string]interface{}, error)

  DeleteOne(criteria interface{}, table string) (int64, error)

  FindOne(criteria interface{}, table string) (map[string]interface{}, error)

  UpdateOne(criteria interface{}, update interface{}, table string) error

  FindMany(criteria interface{}, table string) ([]map[string]interface{}, error)

  UpsertOne(criteria interface{}, update interface{}, table string) error

  AppendChild(criteria interface{}, relationship string, update interface{}, table string) error

  UpdateChild(criteria interface{}, relationship string, update interface{}, table string) error

  DeleteChild(ids []interface{}, fieldsTree []string, collection string) (map[string]interface{}, error)

  GetChild(parentId interface{}, childId interface{}, relationship string, childIdField string, table string) (map[string]interface{}, error)

  Ping() bool

  Close() error

  GetIdField() string

  StringToId(str string) interface{}

  IsNotFoundError(err error) bool
}

var conn Connector

// InsertOne inserts a record into the specified table. It takes the record data and table name as arguments.
// It returns the inserted record along with an error if encountered.
//
// record: the data of the record to be inserted.
// table: the name of the table where the record should be inserted.
//
// Example:
//
//	insertedRecord, err := InsertOne[User](record, "users")
//	if err != nil {
//	    log.Println("Error inserting record:", err)
//	}
func InsertOne[T any](record T, table string) (T, error) {
  result, err := conn.InsertOne(record, table)
  if err != nil {
    return record, err
  }

  return InterfaceToModel[T](result), nil
}

// DeleteOne deletes a record from the specified table based on the provided criteria. It takes the criteria and table name as arguments.
// It returns the number of deleted records along with an error if encountered.
//
// criteria: the criteria used to identify the record(s) to be deleted.
// table: the name of the table from which the record(s) should be deleted.
//
// Example:
//
//	deletedCount, err := DeleteOne(criteria, "users")
//	if err != nil {
//	    log.Println("Error deleting record:", err)
//	}
func DeleteOne[T any](criteria T, table string) (int64, error) {
  return conn.DeleteOne(criteria, table)
}

// FindOne retrieves a single record from the specified table based on the given criteria.
// It takes the criteria and table name as arguments.
// It returns the retrieved record of type T along with an error if encountered.
//
// criteria: the criteria to filter the records in the table.
// table: the name of the table to search for the record.
//
// Example:
//
//	retrievedRecord, err := FindOne[User](criteria, "users")
//	if err != nil {
//	  log.Println("Error finding record:", err)
//	}
func FindOne[T any](criteria interface{}, table string) (T, error) {
  result, err := conn.FindOne(criteria, table)
  return InterfaceToModel[T](result), err
}

// UpdateOne updates a record in the specified table based on the provided criteria and update data.
// It returns an error if encountered.
//
// conn: a connector instance that provides the UpdateOne method.
// criteria: the criteria used to identify the record(s) to be updated.
// update: the data used to update the identified record(s).
// table: the name of the table where the record(s) should be updated.
//
// Example:
//
//	err := UpdateOne[User](criteria, update, "users")
//	if err != nil {
//	    log.Println("Error updating record:", err)
//	}
//
// Note:
// The conn variable must be initialized with a suitable implementation
// of the connector interface, providing the necessary database connection and the UpdateOne method.
func UpdateOne[T any](criteria interface{}, update interface{}, table string) error {
  return conn.UpdateOne(criteria, update, table)
}

// FindMany retrieves and returns multiple records from the specified table based on the given criteria.
// It takes the criteria and table name as arguments.
// It returns a slice of records and an error if encountered.
// criteria: the criteria to filter the records.
// table: the name of the table to fetch the records from.
// Example:
//
//	records, err := FindMany[User](criteria, "users")
//	if err != nil {
//	    log.Println("Error fetching records:", err)
//	}
func FindMany[T any](criteria interface{}, table string) ([]T, error) {
  var output []T = make([]T, 0)
  result, err := conn.FindMany(criteria, table)

  if err != nil {
    return output, err
  }

  for _, row := range result {
    output = append(output, InterfaceToModel[T](row))
  }

  return output, err
}

// UpsertOne upserts a record into the specified table. It takes the criteria, update data, and table name as arguments.
//
// criteria: the filter criteria to match the record to be updated or inserted.
// update: the data to be updated in the record or inserted as a new record if no matching record is found.
// table: the name of the table where the record should be updated or inserted.
//
// Example:
// err := UpsertOne[User](criteria, update, "users")
//
//	if err != nil {
//	    log.Println("Error upserting record:", err)
//	}
func UpsertOne[T any](criteria interface{}, update interface{}, table string) error {
  return conn.UpsertOne(criteria, update, table)
}

func AppendChild[T any](criteria interface{}, relationship string, update interface{}, table string) error {
  return conn.AppendChild(criteria, relationship, update, table)
}

func GetChild[T any](parentId interface{}, childId interface{}, relationship string, childIdField string, table string) (T, error) {
  result, err := conn.GetChild(parentId, childId, relationship, childIdField, table)
  return InterfaceToModel[T](result), err
}

func UpdateChild[T any](criteria interface{}, relationship string, update interface{}, table string) error {
  return conn.UpdateChild(criteria, relationship, update, table)
}

func DeleteChild[T any](ids []interface{}, fieldsTree []string, collection string) (T, error) {
  result, err := conn.DeleteChild(ids, fieldsTree, collection)
  return InterfaceToModel[T](result), err
}

func GetIdField() string {
  return conn.GetIdField()
}

func StringToId(str string) interface{} {
  return conn.StringToId(str)
}

func IsNotFoundError(err error) bool {
  return conn.IsNotFoundError(err)
}
