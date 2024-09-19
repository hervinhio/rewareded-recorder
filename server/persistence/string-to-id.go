package persistence

import (
	"github.com/hervinhio/rewarded-recorder/persistence/mongodb"
	"log"
	"os"
)

func StringToId(str string) (interface{}, error) {
	if os.Getenv("DATABASE_SYSTEM") == "mongodb" {
		return mongodb.StringToId(str)
	}

	log.Fatalf("Database system is not supported")
	return nil, nil
}
