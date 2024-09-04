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

const groupsTableName = "groups"

func HandleGetGroups(w http.ResponseWriter, r *http.Request) {
  groups, err := db.FindMany[entities.Group](map[string]interface{}{}, groupsTableName)
  if err != nil {
    log.Printf("api.HandleGetGroups: db.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to find groups\"}"))
    return
  }

  groupsJson, _ := json.Marshal(groups)
  _, _ = w.Write(groupsJson)
}

func HandleGetGroup(w http.ResponseWriter, r *http.Request) {
  groupId := chi.URLParam(r, "id")
  id := db.StringToId(groupId)

  if id == nil {
    log.Printf("api.HandleGetGroup: Invalid group id: %s", groupId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid group id: " + groupId + "\"}"))
    return
  }

  count, err := db.DeleteOne(
    map[string]interface{}{
      db.GetIdField(): id,
      "realmId":       r.Context().Value("realmId"),
    },
    pubTablename,
  )
  if err != nil {
    log.Printf("api.HandleGetGroup: db.DeleteOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to delete group\"}"))
    return
  }

  if count == 0 {
    w.WriteHeader(http.StatusNotFound)
    _, _ = w.Write([]byte("{ \"error\" : \"Group not found\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}

func HandleCreateGroup(w http.ResponseWriter, r *http.Request) {
  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleCreateGroup: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
    return
  }

  var group entities.Group
  err = json.Unmarshal(data, &group)
  if err != nil {
    log.Printf("api.HandleCreateGroup: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
    return
  }

  group.RealmId = r.Context().Value("realmId").(string)
  createdGroup, err := db.InsertOne[entities.Group](group, groupsTableName)
  if err != nil {
    log.Printf("api.HandleCreateGroup: db.InsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to insert group\"}"))
    return
  }

  groupJson, _ := json.Marshal(createdGroup)
  _, _ = w.Write(groupJson)
}

func HandleDeleteGroup(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  if id == "" {
    log.Printf("api.HandleDeleteGroup: Invalid group id: %s", id)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid group id: " + id + "\"}"))
    return
  }

  count, err := db.DeleteOne(map[string]interface{}{"groupId": id, "realmId": r.Context().Value("realmId")}, groupsTableName)
  if err != nil {
    log.Printf("api.HandleDeleteGroup: db.DeleteOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to delete group\"}"))
    return
  }
  if count == 0 {
    w.WriteHeader(http.StatusNotFound)
    _, _ = w.Write([]byte("{ \"error\" : \"Group not found\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}

func HandleUpdateGroup(w http.ResponseWriter, r *http.Request) {
  id := chi.URLParam(r, "id")
  if id == "" {
    log.Printf("api.HandleUpdateGroup: Invalid group id: %s", id)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid group id: " + id + "\"}"))
    return
  }

  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleUpdateGroup: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
    return
  }

  var group entities.Group
  err = json.Unmarshal(data, &group)
  if err != nil {
    log.Printf("api.HandleUpdateGroup: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to read body\"}"))
    return
  }

  err = db.UpdateOne[entities.Group](
    map[string]interface{}{"groupId": id, "realmId": r.Context().Value("realmId").(string)},
    group,
    groupsTableName,
  )
  if err != nil {
    log.Printf("api.HandleUpdateGroup: db.UpdateOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to update group\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
