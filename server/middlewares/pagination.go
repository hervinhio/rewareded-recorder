package middlewares

import (
  "context"
  "net/http"
  "strconv"
)

const defaultPageSize = 50

func PaginationMiddleWare(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    takeStr := r.URL.Query().Get("take")
    skipStr := r.URL.Query().Get("skip")

    take, err := strconv.Atoi(takeStr)
    if err != nil {
      take = defaultPageSize
    }

    skip, err := strconv.Atoi(skipStr)
    if err != nil {
      skip = 0
    }

    newRequest := r.WithContext(context.WithValue(r.Context(), "take", take))
    newRequest = r.WithContext(context.WithValue(newRequest.Context(), "skip", skip))
    next.ServeHTTP(w, newRequest)
  })
}
