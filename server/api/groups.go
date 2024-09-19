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

const groupsTableName = "groups"

func HandleGetGroups(w http.ResponseWriter, r *http.Request) {
  criteria := entities.Group{
    RealmId: r.Context().Value("realmId").(string),
  }
  pg := r.Context().Value("pagination").(pagination.Pagination)

  groups, err := persistence.AllManagers.Groups.FindMany(criteria, pg)
  if err != nil {
    log.Printf("api.HandleGetGroups: persistence.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to find groups\"}"))
    return
  }

  groupsJson, _ := json.Marshal(groups)
  _, _ = w.Write(groupsJson)
}

func HandleGetGroup(w http.ResponseWriter, r *http.Request) {
  groupId := chi.URLParam(r, "id")
  criteria := entities.Group{
    RealmId: r.Context().Value("realmId").(string),
    GroupId: groupId,
  }

  group, err := persistence.AllManagers.Groups.FindOne(criteria)
  if err != nil {
    log.Printf("api.HandleGetGroup: persistence.DeleteOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to delete group\"}"))
    return
  }

  w.WriteHeader(http.StatusOK)
  groupJson, _ := json.Marshal(group)
  _, _ = w.Write(groupJson)
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
  createdGroup, err := persistence.AllManagers.Groups.InsertOne(group)
  if err != nil {
    log.Printf("api.HandleCreateGroup: persistence.InsertOne(): %v", err)
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

  criteria := entities.Group{
    RealmId: r.Context().Value("realmId").(string),
    GroupId: id,
  }
  count, err := persistence.AllManagers.Groups.DeleteOne(criteria)
  if err != nil {
    log.Printf("api.HandleDeleteGroup: persistence.DeleteOne(): %v", err)
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

  criteria := entities.Group{
    RealmId: r.Context().Value("realmId").(string),
    GroupId: id,
  }
  group, err = persistence.AllManagers.Groups.UpdateOne(criteria, group)
  if err != nil {
    log.Printf("api.HandleUpdateGroup: persistence.UpdateOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to update group\"}"))
    return
  }

  w.WriteHeader(http.StatusOK)
  groupJson, _ := json.Marshal(group)
  _, _ = w.Write(groupJson)
}
