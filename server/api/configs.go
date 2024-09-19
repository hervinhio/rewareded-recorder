package api

import (
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"io"
	"log"
	"net/http"
)

func HandleUpdateConfig(w http.ResponseWriter, r *http.Request) {
	userId := chi.URLParam(r, "userId")
	id := persistence.StringToId(userId)

	if id == nil {
		log.Printf("api.HandleUpdateConfig: Invalid user id: %s", userId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + userId + "\"}"))
		return
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("api.HandleUpdateConfig: Error reading body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Error reading body\"}"))
		return
	}

	var config entities.Config
	err = json.Unmarshal(data, &config)
	if err != nil {
		log.Printf("api.HandleUpdateConfig: Error unmarshalling body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Error unmarshalling body\"}"))
		return
	}

	criteria := entities.Config{
		UserId: userId,
		Realm:  r.Context().Value("realmId").(string),
	}
	updated, err := persistence.AllManagers.Config.UpdateOne(criteria, config)
	if err != nil {
		log.Printf("api.HandleUpdateConfig: Error updating config: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Error updating config\"}"))
		return
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(updated)
	_, _ = w.Write(jsonData)
}

func HandleGetConfig(w http.ResponseWriter, r *http.Request) {
	userId := chi.URLParam(r, "userId")
	id := persistence.StringToId(userId)
	if id == nil {
		log.Printf("api.HandleGetPublisher: Invalid user id: %s", userId)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Invalid user id: " + userId + "\"}"))
		return
	}

	criteria := entities.Config{
		UserId: userId,
		Realm:  r.Context().Value("realmId").(string),
	}
	config, err := persistence.AllManagers.Config.FindOne(criteria)
	if err != nil {
		log.Printf("api.HandleGetPublisher: Error getting config: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("{ \"error\" : \"Error getting config\"}"))
		return
	}

	jsonData, _ := json.Marshal(config)
	_, _ = w.Write(jsonData)
}
