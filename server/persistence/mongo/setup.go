package persistence

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"os"
)

var ctx context.Context
var client *mongo.Client
var db *mongo.Database

func Setup() {
	var err error
	dbUrl := os.Getenv("DATABASE_URL")
	dbName := os.Getenv("DATABASE_NAME")

	if dbUrl == "" {
		log.Fatal("The variable DATABASE_URL is not defined. Please define it.")
	}

	ctx = context.TODO()
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(dbUrl))
	if err != nil {
		log.Fatalf("Cannot connect to the database [%s], err=[%v]", dbUrl, err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Database is unavailable, err=[%v]", err)
	}

	db = client.Database(dbName)
}
