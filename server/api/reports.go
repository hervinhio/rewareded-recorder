package api

import (
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"io"
	"log"
	"net/http"
	"time"
)

func HandleDeleteReport(w http.ResponseWriter, r *http.Request) {
	publisherId := chi.URLParam(r, "id")
	id := persistence.StringToId(publisherId)

	if id == nil {
		log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
		return
	}

	reportId := chi.URLParam(r, "reportId")

	criteria := entities.Publisher{
		Id:      id,
		RealmId: r.Context().Value("realmId").(string),
	}
	
	// Legacy: Delete from publisher's reports array (DEPRECATED - kept for backward compatibility) 
	_, err := persistence.AllManagers.Publishers.DeleteOneReport(criteria, entities.Report{Id: reportId})
	if err != nil {
		log.Printf("api.HandleDeleteReport: Error deleting report %s: %s", reportId, err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to delete report: " + reportId + "\"}"))
		return
	}

	// New: Also delete from user's reports array for migration
	// Find user associated with this publisher
	userCriteria := entities.User{
		PublisherId: publisherId,
		RealmId:     r.Context().Value("realmId").(string),
	}
	_, err = persistence.AllManagers.Users.DeleteOneReport(userCriteria, entities.Report{Id: reportId})
	if err != nil {
		log.Printf("api.HandleDeleteReport: Warning - could not delete report from user's array: %s", err)
		// Don't fail the request - this is for migration purposes
	}

	w.WriteHeader(http.StatusNoContent)
}

func HandleUpdateReport(w http.ResponseWriter, r *http.Request) {
	publisherId := chi.URLParam(r, "id")
	id := persistence.StringToId(publisherId)

	if id == nil {
		log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
		return
	}

	reportId := chi.URLParam(r, "reportId")

	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleDeletePublisher: Error reading body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
		return
	}

	var report entities.Report
	err = json.Unmarshal(data, &report)
	if err != nil {
		log.Printf("api.HandleDeletePublisher: Error unmarshalling body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
		return
	}

	criteria := entities.Publisher{
		Id:      id,
		RealmId: r.Context().Value("realmId").(string),
	}
	
	// Legacy: Update in publisher's reports array (DEPRECATED - kept for backward compatibility)
	updated, err := persistence.AllManagers.Publishers.UpdateReport(criteria, reportId, report)
	if err != nil {
		log.Printf("api.HandleUpdateReport: Error updating report %s: %s", reportId, err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to update report: " + reportId + "\"}"))
		return
	}

	// New: Also update in user's reports array for migration
	// Find user associated with this publisher
	userCriteria := entities.User{
		PublisherId: publisherId,
		RealmId:     r.Context().Value("realmId").(string),
	}
	_, err = persistence.AllManagers.Users.UpdateReport(userCriteria, reportId, report)
	if err != nil {
		log.Printf("api.HandleUpdateReport: Warning - could not update report in user's array: %s", err)
		// Don't fail the request - this is for migration purposes
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(updated)
	_, _ = w.Write(jsonData)
}

func HandleCreateReport(w http.ResponseWriter, r *http.Request) {
	publisherId := chi.URLParam(r, "id")
	id := persistence.StringToId(publisherId)
	if id == nil {
		log.Printf("api.HandleCreatePublisher: Invalid user id: %s", publisherId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
		return
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleCreatePublisher: Error reading body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
		return
	}

	var report entities.Report
	err = json.Unmarshal(data, &report)
	if err != nil {
		log.Printf("api.HandleCreateReport: Error unmarshalling body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
		return
	}

	report.Id = uuid.New().String()
	report.Date = time.Now()
	criteria := entities.Publisher{
		Id:      id,
		RealmId: r.Context().Value("realmId").(string),
	}
	
	// Legacy: Save to publisher's reports array (DEPRECATED - kept for backward compatibility)
	updated, err := persistence.AllManagers.Publishers.InsertOneReport(criteria, report)
	if err != nil {
		log.Printf("api.HandleCreateReport: Error creating report in publisher")
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\":\"Error creating a report" + err.Error() + "\""))
		return
	}

	// New: Also save to user's reports array for migration
	// Find user associated with this publisher
	userCriteria := entities.User{
		PublisherId: publisherId,
		RealmId:     r.Context().Value("realmId").(string),
	}
	_, err = persistence.AllManagers.Users.InsertOneReport(userCriteria, report)
	if err != nil {
		log.Printf("api.HandleCreateReport: Warning - could not save report to user's array (user may not exist): %s", err)
		// Don't fail the request - this is for migration purposes
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(updated)
	_, _ = w.Write(jsonData)
}
