package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/hervinhio/rewarded-recorder/functions/cron"
	functionhttp "github.com/hervinhio/rewarded-recorder/functions/http"
	"github.com/hervinhio/rewarded-recorder/functions/triggers"
)

// HandleTriggerReportCreated handles report creation trigger events
func HandleTriggerReportCreated(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleTriggerReportCreated: io.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	var triggerData triggers.ReportTriggerData
	err = json.Unmarshal(data, &triggerData)
	if err != nil {
		log.Printf("api.HandleTriggerReportCreated: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	triggerData.Type = triggers.ReportCreated

	if err := triggers.OnCreateReport(r.Context(), triggerData); err != nil {
		log.Printf("api.HandleTriggerReportCreated: triggers.OnCreateReport(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}

// HandleTriggerReportUpdated handles report update trigger events
func HandleTriggerReportUpdated(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleTriggerReportUpdated: io.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	var triggerData triggers.ReportTriggerData
	err = json.Unmarshal(data, &triggerData)
	if err != nil {
		log.Printf("api.HandleTriggerReportUpdated: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	triggerData.Type = triggers.ReportUpdated

	if err := triggers.OnUpdateReport(r.Context(), triggerData); err != nil {
		log.Printf("api.HandleTriggerReportUpdated: triggers.OnUpdateReport(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}

// HandleTriggerReportDeleted handles report deletion trigger events
func HandleTriggerReportDeleted(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleTriggerReportDeleted: io.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	var triggerData triggers.ReportTriggerData
	err = json.Unmarshal(data, &triggerData)
	if err != nil {
		log.Printf("api.HandleTriggerReportDeleted: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	triggerData.Type = triggers.ReportDeleted

	if err := triggers.OnDeleteReport(r.Context(), triggerData); err != nil {
		log.Printf("api.HandleTriggerReportDeleted: triggers.OnDeleteReport(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}

// HandleCronCleanupNotifications handles notification cleanup cron job
func HandleCronCleanupNotifications(w http.ResponseWriter, r *http.Request) {
	if err := cron.DeleteNotificationsCron(r.Context()); err != nil {
		log.Printf("api.HandleCronCleanupNotifications: cron.DeleteNotificationsCron(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}

// HandleCronCleanupOldReports handles old reports cleanup cron job
func HandleCronCleanupOldReports(w http.ResponseWriter, r *http.Request) {
	if err := cron.DeleteOldReportsCron(r.Context()); err != nil {
		log.Printf("api.HandleCronCleanupOldReports: cron.DeleteOldReportsCron(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}

// HandleRecalculatePublishersStatus handles publisher status recalculation
func HandleRecalculatePublishersStatus(w http.ResponseWriter, r *http.Request) {
	realmId := r.Context().Value("realmId")
	if realmId == nil {
		log.Printf("api.HandleRecalculatePublishersStatus: realmId not found in context")
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "realmId required"}`))
		return
	}

	realmIdStr, ok := realmId.(string)
	if !ok {
		log.Printf("api.HandleRecalculatePublishersStatus: realmId is not a string")
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error": "invalid realmId"}`))
		return
	}

	if err := functionhttp.RecalculatePublishersActiveStatus(r.Context(), realmIdStr); err != nil {
		log.Printf("api.HandleRecalculatePublishersStatus: functionhttp.RecalculatePublishersActiveStatus(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "` + err.Error() + `"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success": true}`))
}