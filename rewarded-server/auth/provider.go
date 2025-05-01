package auth

import (
	"net/http"

	"github.com/gorilla/mux"
)

type AuthProvider interface {
	HandleLogin(w http.ResponseWriter, r *http.Request)
	HandleRegister(w http.ResponseWriter, r *http.Request)
	Init()
}

func getProviderFromResquest(r *http.Request) string {
	providerKey := r.Header.Get("X-Authorization-Provider")
	if providerKey == "" {
		providerKey = r.URL.Query().Get("provider")
	}
	if providerKey == "" {
		providerKey = mux.Vars(r)["provider"]
	}

	return providerKey
}
