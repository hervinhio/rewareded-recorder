package api

import (
  "encoding/json"
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
