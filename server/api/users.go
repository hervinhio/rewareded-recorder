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

func HandleGetUsers(w http.ResponseWriter, r *http.Request) {
  criteria := entities.User{
    RealmId: r.Context().Value("realmId").(string),
  }
  pg := r.Context().Value("pagination").(pagination.Pagination)
  users, err := persistence.AllManagers.Users.FindMany(criteria, pg)
  if err != nil {
    log.Printf("api.HandleGetUsers: persistence.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

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

  user.RealmId = r.Context().Value("realmId").(string)
  createUser, err := persistence.AllManagers.Users.InsertOne(user)
  if err != nil {
    log.Printf("api.HandleCreateUser: persistence.InsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  userJson, _ := json.Marshal(createUser)
  _, _ = w.Write(userJson)
}

func HandleDeleteUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := persistence.StringToId(userId)

  if id == nil {
    log.Printf("api.HandleDeleteUser: Invalid user id: %s", userId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + userId + "\"}"))
    return
  }

  criteria := entities.User{
    RealmId: r.Context().Value("realmId").(string),
    Id:      id,
  }
  count, err := persistence.AllManagers.Users.DeleteOne(criteria)
  if err != nil {
    log.Printf("api.HandleDeleteUser: persistence.DeleteOne(): %v", err)
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

func HandleGetUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := persistence.StringToId(userId)

  if id == nil {
    log.Printf("api.HandleGetUser: Invalid user id: %s", userId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + userId + "\"}"))
    return
  }

  criteria := entities.User{
    RealmId: r.Context().Value("realmId").(string),
    Id:      id,
  }
  user, err := persistence.AllManagers.Users.FindOne(criteria)
  if err != nil {
    log.Printf("api.HandleGetUser: persistence.FindOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  userJson, _ := json.Marshal(user)
  _, _ = w.Write(userJson)
}

func HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := persistence.StringToId(userId)

  if id == nil {
    log.Printf("api.HandleUpdateUser: Invalid user id: %s", userId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + userId + "\"}"))
    return
  }

  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleUpdateUser: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var user entities.User
  err = json.Unmarshal(data, &user)
  if err != nil {
    log.Printf("api.HandleUpdateUser: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  criteria := entities.User{
    RealmId: r.Context().Value("realmId").(string),
    Id:      id,
  }
  udpated, err := persistence.AllManagers.Users.UpdateOne(criteria, user)
  if err != nil {
    log.Printf("api.HandleUpdateUser: persistence.UpdateOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  w.WriteHeader(http.StatusOK)
  jsonData, _ := json.Marshal(udpated)
  _, _ = w.Write(jsonData)
}
