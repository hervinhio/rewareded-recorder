package jwt

import (
	"net/http"
	"strings"
)

func IsHttpRequest(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	return strings.HasPrefix("https", origin)
}
