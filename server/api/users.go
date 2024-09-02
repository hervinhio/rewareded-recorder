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

const tableName = "users"

func HandleGetUsers(w http.ResponseWriter, r *http.Request) {
  users, err := db.FindMany[entities.User](map[string]interface{}{"realmId": r.Context().Value("realmId")}, tableName)
  if err != nil {
    log.Printf("api.HandleGetUsers: db.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  log.Printf("Getting useres with %v", map[string]interface{}{"realmId": r.Context().Value("realmId")})
  usersJson, _ := json.Marshal(users)
  _, _ = w.Write(usersJson)
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleCreateUser: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var user entities.User
  err = json.Unmarshal(data, &user)
  if err != nil {
    log.Printf("api.HandleCreateUser: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  createUser, err := db.InsertOne[entities.User](user, tableName)
  if err != nil {
    log.Printf("api.HandleCreateUser: db.InsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  userJson, _ := json.Marshal(createUser)
  _, _ = w.Write(userJson)
}

func HandleDeleteUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := db.StringToId(userId)

  count, err := db.DeleteOne(map[string]interface{}{db.GetIdField(): id}, tableName)
  if err != nil {
    log.Printf("api.HandleDeleteUser: db.DeleteOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  if count == 0 {
    w.WriteHeader(http.StatusNotFound)
    _, _ = w.Write([]byte("{ \"error\" : \"User not found\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
