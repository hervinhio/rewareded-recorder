package http

import (
	"context"
	"log"

	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/functions/triggers"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RecalculatePublishersActiveStatus recalculates the active status for all publishers
// Equivalent to Firebase function recalculatePublishersActiveStatus
func RecalculatePublishersActiveStatus(ctx context.Context, realmId string) error {
	log.Println("Starting publisher active status recalculation")

	// Get all publishers in the realm
	publisherCriteria := entities.Publisher{RealmId: realmId}
	publisherPagination := pagination.Pagination{Take: 1000, Skip: 0} // Large limit to get all publishers

	publishers, err := persistence.AllManagers.Publishers.FindMany(publisherCriteria, publisherPagination)
	if err != nil {
		log.Printf("Failed to get publishers: %v", err)
		return err
	}

	successCount := 0
	errorCount := 0

	for _, publisher := range publishers {
		// Extract publisher ID as string
		var publisherIDStr string
		if objID, ok := publisher.Id.(primitive.ObjectID); ok {
			publisherIDStr = objID.Hex()
		} else if str, ok := publisher.Id.(string); ok {
			publisherIDStr = str
		} else {
			log.Printf("Invalid publisher ID type for publisher: %v", publisher.Id)
			errorCount++
			continue
		}

		// Use the trigger function to update publisher active state
		if err := triggers.UpdatePublisherActiveState(ctx, publisherIDStr); err != nil {
			log.Printf("Failed to update active state for publisher %s: %v", publisherIDStr, err)
			errorCount++
		} else {
			successCount++
		}
	}

	log.Printf("Publisher active status recalculation completed. Success: %d, Errors: %d", successCount, errorCount)
	return nil
}