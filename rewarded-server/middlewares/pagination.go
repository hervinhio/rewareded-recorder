package middlewares

import (
	"context"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
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
		pg := pagination.Pagination{
			Skip: skip,
			Take: take,
		}

		newRequest := r.WithContext(context.WithValue(r.Context(), "pagination", pg))
		next.ServeHTTP(w, newRequest)
	})
}
