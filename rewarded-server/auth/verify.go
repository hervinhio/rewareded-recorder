package auth

import (
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"log"
	"net/http"
)

func handleVerify(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value("userId") == nil {
		log.Printf("handleVerify() > User provided a JWT that doesn't contain a userId")
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"ok": false, "action": "error", message": "Can't find user id in provided token'"`))
		return
	}

	userId := r.Context().Value("userId").(string)
	user, err := persistence.AllManagers.Users.FindOne(entities.User{Email: userId})
	if err != nil {

		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "action": "error", message": "Cannot find user"`))
		return
	}

	if !user.Validated {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok": true, "action": "stop", "message": "User is not verified"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"ok": true, "action": "continue", "message": "User is verified"}`))
}
