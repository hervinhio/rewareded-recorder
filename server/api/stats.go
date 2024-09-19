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

  err = persistence.UpsertOne[entities.Stats](map[string]interface{}{"realmId": r.Context().Value("realmId").(string)}, stats, "stats")
  if err != nil {
    log.Printf("api.HandleUpdateStats: persistence.UpsertOne(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
