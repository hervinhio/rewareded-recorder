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

const pubTablename = "publishers"

func HandleCreatePublisher(w http.ResponseWriter, r *http.Request) {
  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleCreatePublisher: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var publisher entities.Publisher
  err = json.Unmarshal(data, &publisher)
  if err != nil {
    log.Printf("api.HandleCreatePublisher: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  publisher.RealmId = r.Context().Value("realmId").(string)
  createdPublisher, err := db.InsertOne[entities.Publisher](publisher, pubTablename)
  if err != nil {
    log.Printf("api.HandleCreatePublisher: db.InsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  pubJson, _ := json.Marshal(createdPublisher)
  _, _ = w.Write(pubJson)
}

func HandleDeletePublisher(w http.ResponseWriter, r *http.Request) {
  publisherId := chi.URLParam(r, "id")
  id := db.StringToId(publisherId)

  if id == nil {
    log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
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
    log.Printf("api.HandleDeletePublisher: db.DeleteOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  if count == 0 {
    w.WriteHeader(http.StatusNotFound)
    _, _ = w.Write([]byte("{ \"error\" : \"Publisher not found\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}

func HandleGetPublishers(w http.ResponseWriter, r *http.Request) {
  publishers, err := db.FindMany[entities.Publisher](map[string]interface{}{}, pubTablename)
  if err != nil {
    log.Printf("api.HandleGetPublishers: db.FindMany(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{\"error\" : \"Failed to find publishers\"}"))
    return
  }

  pubJson, err := json.Marshal(publishers)
  if err != nil {
    log.Printf("api.HandleGetPublishers: json.Marshal(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed marshal publishers\"}"))
    return
  }

  _, _ = w.Write(pubJson)
}

func HandleGetPublisher(w http.ResponseWriter, r *http.Request) {
  publisherId := chi.URLParam(r, "id")
  id := db.StringToId(publisherId)

  if id == nil {
    log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
    return
  }

  publisher, err := db.FindOne[entities.Publisher](
    map[string]interface{}{"realmId": r.Context().Value("realmId"), db.GetIdField(): id},
    pubTablename,
  )
  if err != nil {
    if db.IsNotFoundError(err) {
      w.WriteHeader(http.StatusNotFound)
      _, _ = w.Write([]byte("{ \"error\" : \"Publisher not found\"}"))
      return
    }

    log.Printf("api.HandleGetPublisher: db.FindOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to find publisher\"}"))
    return
  }

  pubJson, err := json.Marshal(publisher)
  if err != nil {
    log.Printf("api.HandleGetPublisher: json.Marshal(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed marshal publisher\"}"))
    return
  }

  _, _ = w.Write(pubJson)
}

func HandleUpdatePublisher(w http.ResponseWriter, r *http.Request) {
  publisherId := chi.URLParam(r, "id")
  id := db.StringToId(publisherId)

  if id == nil {
    log.Printf("api.HandleDeletePublisher: Invalid user id: %s", publisherId)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + publisherId + "\"}"))
    return
  }

  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleUpdatePublisher: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var publisher entities.Publisher
  err = json.Unmarshal(data, &publisher)
  if err != nil {
    log.Printf("api.HandleUpdatePublisher: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  err = db.UpdateOne[entities.Publisher](
    map[string]interface{}{db.GetIdField(): id, "realmId": r.Context().Value("realmId")},
    publisher,
    pubTablename,
  )
  if err != nil {
    log.Printf("api.HandleUpdatePublisher: db.UpdateOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"Failed to update publisher\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
