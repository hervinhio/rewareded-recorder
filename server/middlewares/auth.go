package middlewares

import (
  "context"
  "github.com/hervinhio/rewarded-recorder/entities"
  "github.com/hervinhio/rewarded-recorder/persistence"
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

    realmId := r.Header.Get("X-Realm")
    userId := r.Header.Get("X-User-Id")

    user, err := persistence.FindOne[entities.User](map[string]interface{}{persistence.GetIdField(): persistence.StringToId(userId)}, tableName)
    if err != nil {
      log.Printf("Error finding user: %v, %v", err, map[string]interface{}{persistence.GetIdField(): persistence.StringToId(userId)})
      w.WriteHeader(http.StatusUnauthorized)
      _, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
      return
    }

    if user.RealmId != realmId && !user.IsSuperUser {
      w.WriteHeader(http.StatusUnauthorized)
      _, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
      return
    }

    rWithContext := r.WithContext(context.WithValue(r.Context(), "realmId", realmId))
    next.ServeHTTP(w, rWithContext)
  })
}
