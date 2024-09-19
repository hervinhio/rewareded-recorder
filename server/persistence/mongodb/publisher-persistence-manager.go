package mongodb

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PublisherPersistenceManager struct{}

func (m PublisherPersistenceManager) UpdateOne(criteria entities.Publisher, update entities.Publisher) (entities.Publisher, error) {
	return updateOne(collectionPublishers, criteria, update)
}

func (m PublisherPersistenceManager) DeleteOne(criteria entities.Publisher) (int64, error) {
	return deleteOne(collectionPublishers, criteria)
}

func (m PublisherPersistenceManager) InsertOne(publisher entities.Publisher) (entities.Publisher, error) {
	id, err := insertOne(collectionPublishers, publisher)
	publisher.Id = id
	return publisher, err
}

func (m PublisherPersistenceManager) FindOne(criteria entities.Publisher) (entities.Publisher, error) {
	return findOne(collectionPublishers, criteria)
}

func (m PublisherPersistenceManager) FindMany(criteria entities.Publisher, pagination pagination.Pagination) ([]entities.Publisher, error) {
	return findMany(collectionPublishers, criteria, pagination)
}

func (m PublisherPersistenceManager) UpdateReport(criteria entities.Publisher, report entities.Report) (entities.Publisher, error) {
	id, err := primitive.ObjectIDFromHex(criteria.Id)
	if err != nil {
		return entities.Publisher{}, err
	}

	reportId, err := primitive.ObjectIDFromHex(report.Id)
	if err != nil {
		return entities.Publisher{}, err
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	result := m.getCollection().FindOneAndUpdate(
		ctx,
		bson.M{"_id": id, "reports._id": reportId},
		bson.M{
			"$set": report,
		},
		opts,
	)
	if result.Err() != nil {
		return entities.Publisher{}, result.Err()
	}

	var publisher entities.Publisher
	err = result.Decode(&publisher)
	if err != nil {
		return publisher, err
	}

	return publisher, nil
}

func (m PublisherPersistenceManager) getCollection() *mongo.Collection {
	return db.Collection(collectionPublishers)
}

func (m PublisherPersistenceManager) InsertOneReport(criteria entities.Publisher, report entities.Report) (entities.Publisher, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	result := m.getCollection().FindOneAndUpdate(
		ctx,
		criteria,
		bson.M{"$push": bson.M{"reports": report}}, /// TODO set the report id here
		opts,
	)
	if result.Err() != nil {
		return entities.Publisher{}, result.Err()
	}

	var publisher entities.Publisher
	err := result.Decode(&publisher)
	if err != nil {
		return entities.Publisher{}, err
	}

	return publisher, nil
}

func (m PublisherPersistenceManager) DeleteOneReport(criteria entities.Publisher, reportCriteria entities.Report) (entities.Publisher, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	result := m.getCollection().FindOneAndUpdate(
		ctx,
		criteria,
		bson.M{"$pull": bson.M{"reports": reportCriteria}},
		opts,
	)
	if result.Err() != nil {
		return entities.Publisher{}, result.Err()
	}

	var publisher entities.Publisher
	err := result.Decode(&publisher)
	if err != nil {
		return entities.Publisher{}, err
	}

	return publisher, nil
}
