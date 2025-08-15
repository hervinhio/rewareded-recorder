package utils

import "time"

const (
	DefaultNMonthsToGet = 5
	LastMonthOfYear     = 11
)

// GetLastSixMonths returns the last 6 months including current month,
// matching the Firebase function behavior
func GetLastSixMonths(year, month *int, monthsToGet *int) []Month {
	var currentYear, currentMonth, numberOfMonthsToGet int

	if year != nil {
		currentYear = *year
	} else {
		currentYear = getCurrentYear()
	}

	if month != nil {
		currentMonth = *month
	} else {
		currentMonth = getCurrentMonth()
	}

	if monthsToGet != nil {
		numberOfMonthsToGet = *monthsToGet
	} else {
		numberOfMonthsToGet = DefaultNMonthsToGet
	}

	if currentMonth < numberOfMonthsToGet {
		monthsCountInPreviousYear := numberOfMonthsToGet - currentMonth
		previousYear := currentYear - 1
		monthsCountInCurrentYear := numberOfMonthsToGet - monthsCountInPreviousYear + 1

		currentYearMonths := getLastNMonths(monthsCountInCurrentYear, currentMonth, currentYear)
		previousYearMonths := getLastNMonths(monthsCountInPreviousYear, LastMonthOfYear, previousYear)

		// Combine the months
		result := make([]Month, 0, len(currentYearMonths)+len(previousYearMonths))
		result = append(result, currentYearMonths...)
		result = append(result, previousYearMonths...)
		return result
	}

	return getLastNMonths(numberOfMonthsToGet+1, currentMonth, currentYear)
}

// GetLastTwelveMonths returns the last 12 months, matching Firebase function behavior
func GetLastTwelveMonths() []Month {
	date := time.Now()
	date = date.AddDate(0, 4, 0) // Add 4 months
	year := date.Year()
	month := int(date.Month()) - 1 // Convert to 0-based indexing
	monthsToGet := 8
	return GetLastSixMonths(&year, &month, &monthsToGet)
}

func getLastNMonths(n, currentMonth, currentYear int) []Month {
	months := make([]Month, 0, n)

	for i := 0; i < n; i++ {
		months = append(months, NewMonth(currentYear, currentMonth-i))
	}

	return months
}

func getCurrentMonth() int {
	date := getDateOnPreviousMonth()
	return int(date.Month()) - 1 // Convert to 0-based indexing to match JavaScript
}

func getDateOnPreviousMonth() time.Time {
	now := time.Now()
	return now.AddDate(0, -1, 0) // Go back one month
}

func getCurrentYear() int {
	date := getDateOnPreviousMonth()
	return date.Year()
}