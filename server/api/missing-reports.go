package api

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"github.com/xuri/excelize/v2"
)

// HandleDownloadMissingReports generates and downloads an XLSX file containing missing reports
func HandleDownloadMissingReports(w http.ResponseWriter, r *http.Request) {
	realmId := r.Context().Value("realmId").(string)

	// Get publishers and groups
	publishers, err := getPublishers(realmId)
	if err != nil {
		log.Printf("api.HandleDownloadMissingReports: Error getting publishers: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to get publishers\"}"))
		return
	}

	groups, err := getGroups(realmId)
	if err != nil {
		log.Printf("api.HandleDownloadMissingReports: Error getting groups: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to get groups\"}"))
		return
	}

	// Generate XLSX file
	file, err := generateMissingReportsXLSX(publishers, groups, realmId)
	if err != nil {
		log.Printf("api.HandleDownloadMissingReports: Error generating XLSX: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to generate XLSX file\"}"))
		return
	}
	defer file.Close()

	// Set headers for file download
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", "attachment; filename=\"41939 - Rapports Manquants - 6 derniers mois.xlsx\"")

	// Write file to response
	if err := file.Write(w); err != nil {
		log.Printf("api.HandleDownloadMissingReports: Error writing file: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func getPublishers(realmId string) ([]entities.Publisher, error) {
	criteria := entities.Publisher{RealmId: realmId}
	pg := pagination.Pagination{
		Take: 1000, // Get all publishers
		Skip: 0,
	}
	return persistence.AllManagers.Publishers.FindMany(criteria, pg)
}

func getGroups(realmId string) ([]entities.Group, error) {
	criteria := entities.Group{RealmId: realmId}
	pg := pagination.Pagination{
		Take: 1000, // Get all groups
		Skip: 0,
	}
	return persistence.AllManagers.Groups.FindMany(criteria, pg)
}

func generateMissingReportsXLSX(publishers []entities.Publisher, groups []entities.Group, realmId string) (*excelize.File, error) {
	file := excelize.NewFile()
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Error closing excel file: %v", err)
		}
	}()

	// Get last 6 months
	lastSixMonths := getLastSixMonths()
	
	// Create a map for quick group lookup
	groupMap := make(map[string]string)
	for _, group := range groups {
		groupMap[group.GroupId] = group.Name
	}

	// Group missing reports by group
	reportsData := make(map[string][][]string)
	
	for _, group := range groups {
		groupData := [][]string{}
		
		for _, publisher := range publishers {
			if publisher.GroupId != group.GroupId {
				continue
			}
			
			// Get publisher's reports for the last 6 months - match frontend logic
			publisherReportsInPeriod := getPublisherReportsForMonths(publisher, lastSixMonths)
			
			// Only include publishers with less than 6 reports (missing reports)
			if len(publisherReportsInPeriod) < 6 {
				missingMonths := findMissingMonths(publisherReportsInPeriod, lastSixMonths)
				
				// Only include if there are actually missing months
				if len(missingMonths) > 0 {
					for i, month := range missingMonths {
						publisherName := ""
						if i == 0 {
							publisherName = getPublisherName(publisher)
						}
						groupName := groupMap[publisher.GroupId]
						if groupName == "" {
							groupName = "Non affilié"
						}
						
						row := []string{
							publisherName,
							groupName,
							month,
							"", // Heures
							"", // Cours
						}
						groupData = append(groupData, row)
					}
				}
			}
		}
		
		if len(groupData) > 0 {
			reportsData[group.Name] = groupData
		}
	}

	// Handle unaffiliated publishers
	unaffiliatedData := [][]string{}
	for _, publisher := range publishers {
		if publisher.GroupId == "" || publisher.GroupId == "unafiliated" {
			publisherReportsInPeriod := getPublisherReportsForMonths(publisher, lastSixMonths)
			
			// Only include publishers with less than 6 reports (missing reports)
			if len(publisherReportsInPeriod) < 6 {
				missingMonths := findMissingMonths(publisherReportsInPeriod, lastSixMonths)
				
				if len(missingMonths) > 0 {
					for i, month := range missingMonths {
						publisherName := ""
						if i == 0 {
							publisherName = getPublisherName(publisher)
						}
						
						row := []string{
							publisherName,
							"Non affilié",
							month,
							"", // Heures
							"", // Cours
						}
						unaffiliatedData = append(unaffiliatedData, row)
					}
				}
			}
		}
	}
	
	if len(unaffiliatedData) > 0 {
		reportsData["Non affilié"] = unaffiliatedData
	}

	// Remove default sheet
	if err := file.DeleteSheet("Sheet1"); err != nil {
		log.Printf("Warning: Could not delete default sheet: %v", err)
	}

	// Create sheets for each group with missing reports
	sheetIndex := 0
	for groupName, data := range reportsData {
		sheetName := groupName
		if sheetName == "" {
			sheetName = "Groupe " + strconv.Itoa(sheetIndex+1)
		}
		
		// Create sheet
		if sheetIndex == 0 {
			file.NewSheet(sheetName)
		} else {
			file.NewSheet(sheetName)
		}

		// Add headers
		headers := []string{"Proclamateur", "Groupe", "Mois", "Heures", "Cours"}
		for i, header := range headers {
			cell := string(rune('A'+i)) + "1"
			file.SetCellValue(sheetName, cell, header)
		}

		// Add data
		for rowIndex, row := range data {
			for colIndex, value := range row {
				cell := string(rune('A'+colIndex)) + strconv.Itoa(rowIndex+2)
				file.SetCellValue(sheetName, cell, value)
			}
		}
		
		sheetIndex++
	}

	// If no sheets were created, create one with a message
	if sheetIndex == 0 {
		file.NewSheet("Aucun rapport manquant")
		file.SetCellValue("Aucun rapport manquant", "A1", "Aucun rapport manquant pour les 6 derniers mois")
	}

	return file, nil
}

func getLastSixMonths() []string {
	months := make([]string, 6)
	now := time.Now()
	
	for i := 0; i < 6; i++ {
		month := now.AddDate(0, -i, 0)
		// Use the same format as frontend: year#month (0-indexed)
		months[i] = fmt.Sprintf("%d#%d", month.Year(), int(month.Month())-1)
	}
	
	return months
}

func getPublisherName(publisher entities.Publisher) string {
	if publisher.Name != "" {
		return publisher.Name
	}
	return strings.TrimSpace(publisher.FirstName + " " + publisher.LastName)
}

func getPublisherReportsForMonths(publisher entities.Publisher, months []string) []entities.Report {
	reports := []entities.Report{}
	for _, report := range publisher.Reports {
		for _, month := range months {
			if report.MonthId == month {
				reports = append(reports, report)
				break
			}
		}
	}
	return reports
}

func findMissingMonths(reports []entities.Report, allMonths []string) []string {
	reportMonths := make(map[string]bool)
	for _, report := range reports {
		reportMonths[report.MonthId] = true
	}
	
	missing := []string{}
	for _, month := range allMonths {
		if !reportMonths[month] {
			missing = append(missing, formatMonthForDisplay(month))
		}
	}
	
	return missing
}

func formatMonthForDisplay(monthId string) string {
	parts := strings.Split(monthId, "#")
	if len(parts) != 2 {
		return monthId
	}
	
	year := parts[0]
	monthNum, err := strconv.Atoi(parts[1])
	if err != nil {
		return monthId
	}
	
	monthNames := []string{
		"Janvier", "Février", "Mars", "Avril",
		"Mai", "Juin", "Juillet", "Août",
		"Septembre", "Octobre", "Novembre", "Décembre",
	}
	
	if monthNum >= 0 && monthNum < len(monthNames) {
		return monthNames[monthNum] + " " + year
	}
	
	return monthId
}