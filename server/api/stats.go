package api

import (
  "encoding/json"
  "github.com/hervinhio/rewarded-recorder/entities"
  "github.com/hervinhio/rewarded-recorder/persistence"
  "io"
  "log"
  "net/http"
)

func HandleUpdateStats(w http.ResponseWriter, r *http.Request) {
  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleUpdateStats: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var stats entities.Stats
  err = json.Unmarshal(data, &stats)
  if err != nil {
    log.Printf("api.HandleUpdateStats: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  criteria := entities.Stats{
    RealmId: r.Context().Value("realmId").(string),
  }
  updated, err := persistence.AllManagers.Stats.UpdateOne(criteria, stats)
  if err != nil {
    log.Printf("api.HandleUpdateStats: persistence.UpsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  w.WriteHeader(http.StatusOK)
  jsonData, err := json.Marshal(updated)
  if err != nil {
    log.Printf("api.HandleUpdateStats: json.Marshal(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  _, _ = w.Write(jsonData)
}
