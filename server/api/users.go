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

  count, err := db.DeleteOne(
    map[string]interface{}{
      db.GetIdField(): id,
      "realmId":       r.Context().Value("realmId"),
    },
    tableName,
  )
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

func HandleGetUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := db.StringToId(userId)

  user, err := db.FindOne[entities.User](
    map[string]interface{}{
      db.GetIdField(): id,
      "realmId":       r.Context().Value("realmId"),
    },
    tableName,
  )
  if err != nil {
    log.Printf("api.HandleGetUser: db.FindOne(): %v, %v", err, map[string]interface{}{
      db.GetIdField(): id,
      "realmId":       r.Context().Value("realmId"),
    })
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  userJson, _ := json.Marshal(user)
  _, _ = w.Write(userJson)
}

func HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
  userId := chi.URLParam(r, "id")
  id := db.StringToId(userId)
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

  err = db.UpdateOne[entities.User](
    map[string]interface{}{
      db.GetIdField(): id,
      "realmId":       r.Context().Value("realmId"),
    },
    user,
    tableName,
  )
  if err != nil {
    log.Printf("api.HandleUpdateUser: db.UpdateOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
