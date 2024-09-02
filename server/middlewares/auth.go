package middlewares

import (
  "github.com/go-chi/chi"
  "github.com/hervinhio/rewarded-recorder/db"
  "github.com/hervinhio/rewarded-recorder/entities"
  "log"
  "net/http"
  "strings"
)

const tableName = "users"

func AuthMiddleWare(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if !strings.Contains(r.URL.Path, "/api") {
      next.ServeHTTP(w, r)
      return
    }

    realmId := chi.URLParam(r, "realm")
    userId := r.Header.Get("X-User-Id")

    user, err := db.FindOne[entities.User](map[string]interface{}{db.GetIdField(): db.StringToId(userId)}, tableName)
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
