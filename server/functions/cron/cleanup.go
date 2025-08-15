package cron

import (
	"context"
	"log"
	"time"

	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
)

// DeleteNotificationsCron deletes old notifications that are not unread and older than 30 days
// Equivalent to Firebase function deleteNotificationsCron
func DeleteNotificationsCron(ctx context.Context) error {
	log.Println("Running notification cleanup cron job")

	// Get all users
	userCriteria := entities.User{}
	userPagination := pagination.Pagination{Take: 1000, Skip: 0} // Large limit to get all users

	users, err := persistence.AllManagers.Users.FindMany(userCriteria, userPagination)
	if err != nil {
		log.Printf("Failed to get users for notification cleanup: %v", err)
		return err
	}

	cutoffDate := time.Now().AddDate(0, 0, -30) // 30 days ago

	for _, user := range users {
		// Filter notifications to keep only those that are unread OR newer than 30 days
		var filteredNotifications []entities.Notification
		var removedCount int

		for _, notification := range user.Notifications {
			if notification.Unread || notification.Date.After(cutoffDate) {
				filteredNotifications = append(filteredNotifications, notification)
			} else {
				removedCount++
			}
		}

		// Update user with filtered notifications if any were removed
		if removedCount > 0 {
			updateUser := entities.User{
				Id:            user.Id,
				Notifications: filteredNotifications,
			}

			criteria := entities.User{Id: user.Id, RealmId: user.RealmId}
			_, err := persistence.AllManagers.Users.UpdateOne(criteria, updateUser)
			if err != nil {
				log.Printf("Failed to update notifications for user %v: %v", user.Id, err)
				continue
			}

			log.Printf("Removed %d old notifications for user %v", removedCount, user.Id)
		}
	}

	log.Println("Notification cleanup cron job completed")
	return nil
}

// DeleteOldReportsCron deletes reports older than 2 years
// Equivalent to Firebase function deleteOldReportsCron
func DeleteOldReportsCron(ctx context.Context) error {
	log.Println("Running old reports cleanup cron job")

	// Calculate cutoff date (2 years ago)
	cutoffDate := time.Now().AddDate(-2, 0, 0)

	// Get all publishers
	publisherCriteria := entities.Publisher{}
	publisherPagination := pagination.Pagination{Take: 1000, Skip: 0} // Large limit to get all publishers

	publishers, err := persistence.AllManagers.Publishers.FindMany(publisherCriteria, publisherPagination)
	if err != nil {
		log.Printf("Failed to get publishers for report cleanup: %v", err)
		return err
	}

	totalReportsRemoved := 0

	for _, publisher := range publishers {
		// Filter reports to keep only those newer than 2 years
		var filteredReports []entities.Report
		var removedCount int

		for _, report := range publisher.Reports {
			if report.Date.After(cutoffDate) {
				filteredReports = append(filteredReports, report)
			} else {
				removedCount++
			}
		}

		// Update publisher with filtered reports if any were removed
		if removedCount > 0 {
			updatePublisher := entities.Publisher{
				Id:      publisher.Id,
				Reports: filteredReports,
			}

			criteria := entities.Publisher{Id: publisher.Id, RealmId: publisher.RealmId}
			_, err := persistence.AllManagers.Publishers.UpdateOne(criteria, updatePublisher)
			if err != nil {
				log.Printf("Failed to update reports for publisher %v: %v", publisher.Id, err)
				continue
			}

			totalReportsRemoved += removedCount
			log.Printf("Removed %d old reports for publisher %v", removedCount, publisher.Id)
		}
	}

	log.Printf("Old reports cleanup cron job completed. Total reports removed: %d", totalReportsRemoved)
	return nil
}