package auth

import (
	"github.com/hervinhio/rewarded-recorder/persistence"
	"log"
	"net/http"
)

func handleLogout(w http.ResponseWriter, r *http.Request) {
	jwt := r.Context().Value("jwt")
	if jwt == nil {
		log.Printf("Error while getting token from request header, impossible to logout")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	contextUser := r.Context().Value("user")
	if contextUser == nil {
		log.Printf("Failed to get user, err=[%v]", contextUser)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	jwtStr := jwt.(string)
	err := persistence.AllManagers.InvalidJWT.InvalidateToken(jwtStr)
	if err != nil {
		log.Printf("Error while storing invalidated token, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to logout user"}`))
		return
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}
