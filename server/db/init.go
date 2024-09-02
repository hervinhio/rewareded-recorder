package db

import (
	"github.com/hervinhio/rewarded-recorder/db/mongo"
	"log"
)

// Initialize initializes the connector and establishes a connection.
func Initialize(connector Connector) {
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
