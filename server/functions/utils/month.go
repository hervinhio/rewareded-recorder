package utils

import (
	"fmt"
	"strconv"
	"strings"
)

var LocaleMonthStrings = []string{
	"Janvier",
	"Février", 
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre",
}

type Month struct {
	Year  int `json:"year"`
	Month int `json:"month"`
}

func NewMonth(year, month int) Month {
	return Month{
		Year:  year,
		Month: month,
	}
}

func (m Month) ToLocaleFullMonth() string {
	if m.Month >= 0 && m.Month < len(LocaleMonthStrings) {
		return fmt.Sprintf("%s %d", LocaleMonthStrings[m.Month], m.Year)
	}
	return fmt.Sprintf("Month %d %d", m.Month+1, m.Year)
}

func (m Month) GetKey() string {
	return fmt.Sprintf("%d#%d", m.Year, m.Month)
}

func MonthFromKey(key string) (Month, error) {
	parts := strings.Split(key, "#")
	if len(parts) != 2 {
		return Month{}, fmt.Errorf("invalid month key format: %s", key)
	}

	year, err := strconv.Atoi(parts[0])
	if err != nil {
		return Month{}, fmt.Errorf("invalid year in month key: %s", parts[0])
	}

	month, err := strconv.Atoi(parts[1])
	if err != nil {
		return Month{}, fmt.Errorf("invalid month in month key: %s", parts[1])
	}

	return Month{Year: year, Month: month}, nil
}