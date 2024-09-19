package persistence

import (
  "log"
  "os"
)

// Initialize initializes the connector and establishes a connection.
func Initialize(connector Connector) {
  if os.Getenv("DATABASE_SYSTEM") == "mongo" {

  }

  if connector != nil {
    conn = connector
  } else {
    conn = &mongo.Connector{}
  }

  conn.Connect()
}

func Close() {
  if conn != nil {
    return
  }

  if err := conn.Close(); err != nil {
    log.Printf("Error closing connection: err=[%v]", err)
  }
}
