package api

import (
  "encoding/json"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "log"
  "net/http"
)

const tableName = "users"

func HandleGetUsers(w http.ResponseWriter, r *http.Request) {
  users, err := db.FindMany[entities.User](map[string]interface{}{}, tableName)
  if err != nil {
    log.Printf("api.HandleGetUsers: db.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  usersJson, _ := json.Marshal(users)
  _, _ = w.Write(usersJson)
}
