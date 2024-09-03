package api

import (
  "encoding/json"
  "github.com/go-chi/chi"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "io"
  "log"
  "net/http"
)

func HandleDeleteReport(w http.ResponseWriter, r *http.Request) {
  publisherId := chi.URLParam(r, "id")
  id := db.StringToId(publisherId)

  if id == nil {
    log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
    return
  }

  reportId := chi.URLParam(r, "reportId")
  objReportId := db.StringToId(reportId)
  if objReportId == nil {
    log.Printf("api.HandleDeletePublisher: Invalid report id: %s", reportId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid report id: " + reportId + "\"}"))
    return
  }

  _, err := db.DeleteChild[entities.Publisher](
    []interface{}{id, objReportId},
    []string{"reports"},
    pubTablename,
  )
  if err != nil {
    log.Printf("api.HandleDeletePublisher: Error deleting report %s: %s", reportId, err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to delete report: " + reportId + "\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}

func HandleUpdateReport(w http.ResponseWriter, r *http.Request) {
  publisherId := chi.URLParam(r, "id")
  id := db.StringToId(publisherId)

  if id == nil {
    log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
    return
  }

  reportId := chi.URLParam(r, "reportId")
  objReportId := db.StringToId(reportId)
  if objReportId == nil {
    log.Printf("api.HandleDeletePublisher: Invalid report id: %s", reportId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid report id: " + reportId + "\"}"))
    return
  }

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

  err = db.UpdateChild[entities.Publisher](
    map[string]interface{}{db.GetIdField(): id, "realmId": r.Context().Value("realmId").(string)},
    "reports",
    report,
    pubTablename,
  )
  if err != nil {
    log.Printf("api.HandleDeletePublisher: Error updating report %s: %s", reportId, err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to update report: " + reportId + "\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
