package triggers

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/functions/utils"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NotificationType int

const (
	ReportCreated NotificationType = iota
	ReportUpdated
	ReportDeleted
	ReportsSubmitted
)

// PublisherActivityStatus represents the activity status of a publisher
type PublisherActivityStatus int

const (
	Active PublisherActivityStatus = iota
	Irregular
	Inactive
)

// ReportTriggerData represents the data structure for report trigger events
type ReportTriggerData struct {
	PublisherID string             `json:"publisherId"`
	AuthorID    string             `json:"authorId"`
	Report      entities.Report    `json:"report"`
	Type        NotificationType   `json:"type"`
}

// OnCreateReport handles report creation events
func OnCreateReport(ctx context.Context, data ReportTriggerData) error {
	log.Printf("Processing report creation for publisher %s", data.PublisherID)

	// Generate notification
	if err := generateNotificationFromChange(ctx, data); err != nil {
		log.Printf("Error generating notification: %v", err)
	}

	// Update publisher active state
	if err := updatePublisherActiveState(ctx, data.PublisherID); err != nil {
		log.Printf("Error updating publisher active state: %v", err)
	}

	// Update auxiliary pioneer status
	if err := updateAuxiliaryPioneerForPublisher(ctx, data.PublisherID, data.Report); err != nil {
		log.Printf("Error updating auxiliary pioneer status: %v", err)
	}

	return nil
}

// OnUpdateReport handles report update events
func OnUpdateReport(ctx context.Context, data ReportTriggerData) error {
	log.Printf("Processing report update for publisher %s", data.PublisherID)

	// Generate notification
	if err := generateNotificationFromChange(ctx, data); err != nil {
		log.Printf("Error generating notification: %v", err)
	}

	// Update publisher active state
	if err := updatePublisherActiveState(ctx, data.PublisherID); err != nil {
		log.Printf("Error updating publisher active state: %v", err)
	}

	// Update auxiliary pioneer status
	if err := updateAuxiliaryPioneerForPublisher(ctx, data.PublisherID, data.Report); err != nil {
		log.Printf("Error updating auxiliary pioneer status: %v", err)
	}

	return nil
}

// OnDeleteReport handles report deletion events
func OnDeleteReport(ctx context.Context, data ReportTriggerData) error {
	log.Printf("Processing report deletion for publisher %s", data.PublisherID)

	// Generate notification
	if err := generateNotificationFromChange(ctx, data); err != nil {
		log.Printf("Error generating notification: %v", err)
	}

	// Update publisher active state
	if err := updatePublisherActiveState(ctx, data.PublisherID); err != nil {
		log.Printf("Error updating publisher active state: %v", err)
	}

	// Update auxiliary pioneer status
	if err := updateAuxiliaryPioneerForPublisher(ctx, data.PublisherID, data.Report); err != nil {
		log.Printf("Error updating auxiliary pioneer status: %v", err)
	}

	return nil
}

// UpdatePublisherActiveState is a public wrapper for updatePublisherActiveState
func UpdatePublisherActiveState(ctx context.Context, publisherID string) error {
	return updatePublisherActiveState(ctx, publisherID)
}

// updatePublisherActiveState updates the active status of a publisher based on recent reports
func updatePublisherActiveState(ctx context.Context, publisherID string) error {
	// Get the last six months
	months := utils.GetLastSixMonths(nil, nil, nil)
	monthKeys := make([]string, len(months))
	for i, month := range months {
		monthKeys[i] = month.GetKey()
	}

	// Get publisher using persistence manager
	objID := persistence.StringToId(publisherID)
	if objID == nil {
		return fmt.Errorf("invalid publisher ID: %s", publisherID)
	}

	criteria := entities.Publisher{Id: objID}
	publisher, err := persistence.AllManagers.Publishers.FindOne(criteria)
	if err != nil {
		return fmt.Errorf("failed to get publisher: %v", err)
	}

	// Filter active reports
	var activeReports []entities.Report
	var hasFirstReport bool

	for _, report := range publisher.Reports {
		// Check if report is in the last 6 months
		for _, monthKey := range monthKeys {
			if report.MonthId == monthKey {
				if report.Active || report.Hours >= 1 {
					activeReports = append(activeReports, report)
				}
				if report.IsFirstReport {
					hasFirstReport = true
				}
				break
			}
		}
	}

	// Determine activity status
	var activityStatus PublisherActivityStatus
	if len(activeReports) == 0 {
		activityStatus = Inactive
	} else if len(activeReports) < 6 && !hasFirstReport {
		activityStatus = Irregular
	} else {
		activityStatus = Active
	}

	// Update publisher activity status
	updatePublisher := entities.Publisher{
		Id:             objID,
		ActivityStatus: int(activityStatus),
	}

	_, err = persistence.AllManagers.Publishers.UpdateOne(criteria, updatePublisher)
	return err
}

// updateAuxiliaryPioneerForPublisher updates auxiliary pioneer status for a publisher
func updateAuxiliaryPioneerForPublisher(ctx context.Context, publisherID string, report entities.Report) error {
	// Get the current month
	months := utils.GetLastSixMonths(nil, nil, nil)
	if len(months) == 0 {
		return fmt.Errorf("no months available")
	}
	currentMonth := months[0]

	// Get publisher to check permanent AP status
	objID := persistence.StringToId(publisherID)
	if objID == nil {
		return fmt.Errorf("invalid publisher ID: %s", publisherID)
	}

	criteria := entities.Publisher{Id: objID}
	publisher, err := persistence.AllManagers.Publishers.FindOne(criteria)
	if err != nil {
		return fmt.Errorf("failed to get publisher: %v", err)
	}

	// Check if this should be added to auxiliary months
	if report.IsAPReport || publisher.IsPermanentAP {
		return addMonthToAuxiliaryMonthsArray(ctx, currentMonth.GetKey(), publisherID)
	}

	return nil
}

// addMonthToAuxiliaryMonthsArray adds a month to the auxiliary pioneer months array
func addMonthToAuxiliaryMonthsArray(ctx context.Context, monthID, publisherID string) error {
	objID := persistence.StringToId(publisherID)
	if objID == nil {
		return fmt.Errorf("invalid publisher ID: %s", publisherID)
	}

	criteria := entities.Publisher{Id: objID}
	publisher, err := persistence.AllManagers.Publishers.FindOne(criteria)
	if err != nil {
		return fmt.Errorf("failed to get publisher: %v", err)
	}

	// Check if month is already in the array
	for _, month := range publisher.ApMonths {
		if month == monthID {
			return nil // Already exists
		}
	}

	// Add month to array
	updatedMonths := append(publisher.ApMonths, monthID)
	updatePublisher := entities.Publisher{
		Id:       objID,
		ApMonths: updatedMonths,
	}

	_, err = persistence.AllManagers.Publishers.UpdateOne(criteria, updatePublisher)
	return err
}

// generateNotificationFromChange generates and saves notifications for report changes
func generateNotificationFromChange(ctx context.Context, data ReportTriggerData) error {
	// Get the author (user who made the change)
	authorObjID := persistence.StringToId(data.AuthorID)
	if authorObjID == nil {
		return fmt.Errorf("invalid author ID: %s", data.AuthorID)
	}

	authorCriteria := entities.User{Id: authorObjID}
	author, err := persistence.AllManagers.Users.FindOne(authorCriteria)
	if err != nil {
		log.Printf("Failed to get author user: %v", err)
		return err
	}

	// Get the publisher
	publisherObjID := persistence.StringToId(data.PublisherID)
	if publisherObjID == nil {
		return fmt.Errorf("invalid publisher ID: %s", data.PublisherID)
	}

	publisherCriteria := entities.Publisher{Id: publisherObjID}
	publisher, err := persistence.AllManagers.Publishers.FindOne(publisherCriteria)
	if err != nil {
		log.Printf("Failed to get publisher: %v", err)
		return err
	}

	// Create the notification
	notification := entities.Notification{
		Id:          primitive.NewObjectID(),
		SubjectId:   data.PublisherID,
		Subject:     publisher,
		SubjectType: "publisher",
		AuthorId:    data.AuthorID,
		Author:      author,
		Date:        time.Now(),
		Type:        int(data.Type),
		Unread:      true,
		RealmId:     author.RealmId,
	}

	// Insert notification to all users in the same realm (except the author)
	// Using the InsertOneNotification method which should handle bulk insertion
	return persistence.AllManagers.Users.InsertOneNotification(author.RealmId, notification)
}

// GetPublisherName returns the formatted name of a publisher
func GetPublisherName(publisher *entities.Publisher) string {
	if publisher == nil {
		return ""
	}

	name := fmt.Sprintf("%s %s %s", publisher.Name, publisher.LastName, publisher.FirstName)
	return strings.TrimSpace(name)
}