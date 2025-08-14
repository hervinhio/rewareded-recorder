package middlewares

import (
	"context"
	"net/http"
)

func PaginationMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		newRequest := r.WithContext(context.WithValue(r.Context(), "pagination", pg))
		next.ServeHTTP(w, newRequest)
	})
}
