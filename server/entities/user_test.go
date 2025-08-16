package entities

import (
	"testing"
)

func TestUserReportsField(t *testing.T) {
	// Test that User can hold reports array
	user := User{
		Id:          "test-id",
		DisplayName: "Test User",
		Email:       "test@example.com",
		PublisherId: "pub-123",
		Reports: []Report{
			{
				Id:        "report-1",
				MonthId:   "2024-01",
				Hours:     10,
				Active:    true,
				Submitted: false,
			},
			{
				Id:        "report-2", 
				MonthId:   "2024-02",
				Hours:     8,
				Active:    true,
				Submitted: true,
			},
		},
	}

	// Verify reports array is properly set
	if len(user.Reports) != 2 {
		t.Errorf("Expected 2 reports, got %d", len(user.Reports))
	}

	// Verify first report data
	if user.Reports[0].Id != "report-1" {
		t.Errorf("Expected report ID 'report-1', got '%s'", user.Reports[0].Id)
	}

	if user.Reports[0].Hours != 10 {
		t.Errorf("Expected 10 hours, got %d", user.Reports[0].Hours)
	}

	// Verify second report data
	if user.Reports[1].Submitted != true {
		t.Errorf("Expected report 2 to be submitted")
	}
}

func TestUserWithoutReports(t *testing.T) {
	// Test that User can exist without reports
	user := User{
		Id:          "test-id-2",
		DisplayName: "User Without Reports",
		Email:       "test2@example.com",
		PublisherId: "pub-456",
	}

	// Verify reports array is empty/nil
	if user.Reports != nil && len(user.Reports) > 0 {
		t.Errorf("Expected no reports, got %d", len(user.Reports))
	}
}