package api

import (
  "encoding/json"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "io"
  "log"
  "net/http"
)

const submissionsTableName = "submissions"

func HandleGetSubmissions(w http.ResponseWriter, r *http.Request) {
  submissions, err := db.FindMany[entities.Submission](map[string]interface{}{"realmId": r.Context().Value("realmId").(string)}, submissionsTableName)
  if err != nil {
    log.Printf("api.HandleGetSubmissions: db.FindMany(): %v", err)
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
  createdSubmission, err := db.InsertOne[entities.Submission](submission, submissionsTableName)
  if err != nil {
    log.Printf("api.HandleCreateSubmission: db.InsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to insert submission\"}"))
    return
  }

  jsonData, _ := json.Marshal(createdSubmission)
  _, _ = w.Write(jsonData)
}
