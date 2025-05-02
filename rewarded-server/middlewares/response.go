package middlewares

import (
  "net/http"
  "strings"
)

func ResponseMiddleWare(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if strings.Contains(r.URL.Path, "/api") ||
      strings.Contains(r.URL.Path, "/health") ||
      strings.Contains(r.URL.Path, "/auth") {
      w.Header().Add("Content-Type", "application/json; charset=utf-8")
    }

    next.ServeHTTP(w, r)
  })
}
