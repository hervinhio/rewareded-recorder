package api

import (
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"io"
	"log"
	"net/http"
)

func HandleCreateAttendanceRecord(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleCreateAttendanceRecord: iol.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	var record entities.AttendanceRecord
	err = json.Unmarshal(data, &record)
	if err != nil {
		log.Printf("api.HandleCreateAttendanceRecord: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	record.RealmId = r.Context().Value("realmId").(string)
	createdRecord, err := persistence.AllManagers.Attendance.InsertOne(record)
	if err != nil {
		log.Printf("api.HandleCreateAttendanceRecord: persistence.InsertOne(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	jsonData, _ := json.Marshal(createdRecord)
	_, _ = w.Write(jsonData)
}

func HandleDeleteAttendanceRecord(w http.ResponseWriter, r *http.Request) {
	recordId := chi.URLParam(r, "id")
	id := persistence.StringToId(recordId)

	if id == nil {
		log.Printf("api.HandleDeleteAttendanceRecord: Invalid record id: %s", recordId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid record id: " + recordId + "\"}"))
		return
	}

	record := entities.AttendanceRecord{
		Id: id,
	}
	count, err := persistence.AllManagers.Attendance.DeleteOne(record)
	if err != nil {
		log.Printf("api.HandleDeleteAttendanceRecord: persistence.DeleteOne(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	if count == 0 {
		log.Printf("api.HandleDeleteAttendanceRecord: AttendanceRecord %s deleted", recordId)
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte("{ \"error\" : \"AttendanceRecord " + recordId + " not found\"}"))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func HandleGetAttendanceRecords(w http.ResponseWriter, r *http.Request) {
	criteria := entities.AttendanceRecord{
		RealmId: r.Context().Value("realmId").(string),
	}
	pg := r.Context().Value("pagination").(pagination.Pagination)
	records, err := persistence.AllManagers.Attendance.FindMany(criteria, pg)
	if err != nil {
		log.Printf("api.HandleGetAttendanceRecords: persistence.FindMany(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	jsonData, _ := json.Marshal(records)
	_, _ = w.Write(jsonData)
}

func HandleUpdateAttendanceRecord(w http.ResponseWriter, r *http.Request) {
	recordId := chi.URLParam(r, "id")
	id := persistence.StringToId(recordId)

	if id == nil {
		log.Printf("api.HandleUpdateAttendanceRecord: Invalid record id: %s", recordId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid record id: " + recordId + "\"}"))
		return
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleUpdateAttendanceRecord: iol.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	var record entities.AttendanceRecord
	err = json.Unmarshal(data, &record)
	if err != nil {
		log.Printf("api.HandleUpdateAttendanceRecord: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	criteria := entities.AttendanceRecord{
		RealmId: r.Context().Value("realmId").(string),
		Id:      id,
	}
	updated, err := persistence.AllManagers.Attendance.UpdateOne(criteria, record)
	if err != nil {
		log.Printf("api.HandleUpdateAttendanceRecord: persistence.InsertOne(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
		return
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(updated)
	_, _ = w.Write(jsonData)
}
