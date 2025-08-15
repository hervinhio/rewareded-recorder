package utils

import (
	"testing"
	"time"
)

func TestMonthOperations(t *testing.T) {
	// Test creating a month
	month := NewMonth(2024, 5)
	if month.Year != 2024 || month.Month != 5 {
		t.Errorf("Expected month to be (2024, 5), got (%d, %d)", month.Year, month.Month)
	}

	// Test GetKey
	key := month.GetKey()
	expectedKey := "2024#5"
	if key != expectedKey {
		t.Errorf("Expected key %s, got %s", expectedKey, key)
	}

	// Test MonthFromKey
	parsedMonth, err := MonthFromKey(key)
	if err != nil {
		t.Errorf("Failed to parse month from key: %v", err)
	}
	if parsedMonth.Year != month.Year || parsedMonth.Month != month.Month {
		t.Errorf("Parsed month doesn't match original: expected (%d, %d), got (%d, %d)",
			month.Year, month.Month, parsedMonth.Year, parsedMonth.Month)
	}

	// Test ToLocaleFullMonth
	localeName := month.ToLocaleFullMonth()
	expectedName := "Juin 2024" // Month 5 is "Juin" (June in French)
	if localeName != expectedName {
		t.Errorf("Expected locale name %s, got %s", expectedName, localeName)
	}
}

func TestGetLastSixMonths(t *testing.T) {
	// Test with default parameters
	months := GetLastSixMonths(nil, nil, nil)
	if len(months) != 6 { // DefaultNMonthsToGet + 1
		t.Errorf("Expected 6 months, got %d", len(months))
	}

	// Test with specific year and month
	year := 2024
	month := 5 // June (0-based)
	monthsToGet := 3
	months = GetLastSixMonths(&year, &month, &monthsToGet)
	if len(months) != 4 { // monthsToGet + 1
		t.Errorf("Expected 4 months, got %d", len(months))
	}

	// Verify the months are in descending order
	for i := 0; i < len(months)-1; i++ {
		current := months[i]
		next := months[i+1]
		
		// Current month should be more recent than next
		if current.Year < next.Year || (current.Year == next.Year && current.Month < next.Month) {
			t.Errorf("Months not in descending order: %v should come before %v", current, next)
		}
	}
}

func TestGetCurrentMonth(t *testing.T) {
	// Test that getCurrentMonth returns previous month (0-based)
	currentMonth := getCurrentMonth()
	expectedMonth := int(time.Now().AddDate(0, -1, 0).Month()) - 1
	
	if currentMonth != expectedMonth {
		t.Errorf("Expected current month %d, got %d", expectedMonth, currentMonth)
	}
}

func TestGetCurrentYear(t *testing.T) {
	// Test that getCurrentYear returns the year of previous month
	currentYear := getCurrentYear()
	expectedYear := time.Now().AddDate(0, -1, 0).Year()
	
	if currentYear != expectedYear {
		t.Errorf("Expected current year %d, got %d", expectedYear, currentYear)
	}
}