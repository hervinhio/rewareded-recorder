package middlewares

import (
	"github.com/go-chi/chi"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "log"
  "net/http"
)

func AuthMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		realmId := chi.URLParam(r, "realm")
		userId := r.Header.Get("X-User-Id")

		user, err := db.FindOne[entities.User](map[string]{db.GetIdField(): db.StringToId(userId)})
    if err != nil {
      log.Printf("Error finding user: %v", err)
      w.WriteHeader(http.StatusUnauthorized)
      _, _ = w.Write([]byte("{error: \"You are not authorized to access this resource\""))
      return
    }

    if user.RealmId != realmId {
      w.WriteHeader(http.StatusUnauthorized)
      _, _ = w.Write([]byte("{error: \"You are not authorized to access this resource\""))
      return
    }

    next.ServeHTTP(w, r)
	})
}
