package api

import (
  "encoding/json"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "io"
  "log"
  "net/http"
)

const notificationsTableName = "notifications"

func HandleCreateNotification(w http.ResponseWriter, r *http.Request) {
  data, err := io.ReadAll(r.Body)
  if err != nil {
    log.Printf("api.HandleCreateNotification: ioutil.ReadAll(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  var notification entities.Notification
  err = json.Unmarshal(data, &notification)
  if err != nil {
    log.Printf("api.HandleCreateNotification: json.Unmarshal(): %v", err)
    w.WriteHeader(http.StatusBadRequest)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  err = db.AppendChild[entities.User](
    map[string]interface{}{"realmId": r.Context().Value("realmId").(string)},
    "notifications",
    notification,
    notificationsTableName,
  )
  if err != nil {
    log.Printf("api.HandleCreateNotification: db.AppendChild(): %v", err)
    w.WriteHeader(http.StatusInternalServerError)
    _, _ = w.Write([]byte("{ \"error\" : \"" + err.Error() + "\"}"))
    return
  }

  w.WriteHeader(http.StatusNoContent)
}
