package api

import (
	"encoding/json"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"io"
	"log"
	"net/http"
)

func HandleGetSubmissions(w http.ResponseWriter, r *http.Request) {
	criteria := entities.Submission{
		RealmId: r.Context().Value("realmId").(string),
	}
	pg := r.Context().Value("pagination").(pagination.Pagination)
	submissions, err := persistence.AllManagers.Submissions.FindMany(criteria, pg)
	if err != nil {
		log.Printf("api.HandleGetSubmissions: persistence.FindMany(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to find submissions\"}"))
		return
	}

	submissionsJson, _ := json.Marshal(submissions)
	_, _ = w.Write(submissionsJson)
}

func HandleCreateSubmission(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleCreateSubmission: io.ReadAll(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to read request body\"}"))
		return
	}

	var submission entities.Submission
	err = json.Unmarshal(data, &submission)
	if err != nil {
		log.Printf("api.HandleCreateSubmission: json.Unmarshal(): %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to read request body\"}"))
		return
	}

	submission.RealmId = r.Context().Value("realmId").(string)
	createdSubmission, err := persistence.AllManagers.Submissions.InsertOne(submission)
	if err != nil {
		log.Printf("api.HandleCreateSubmission: persistence.InsertOne(): %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\" : \"Failed to insert submission\"}"))
		return
	}

	jsonData, _ := json.Marshal(createdSubmission)
	_, _ = w.Write(jsonData)
}
