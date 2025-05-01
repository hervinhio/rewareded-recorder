package auth

import (
	"log"
	"net/http"
)

func handleLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	providerKey := getProviderFromResquest(r)

	var provider AuthProvider
	var ok bool
	if provider, ok = providers[providerKey]; !ok {
		log.Printf("Invalid authorization provider: %s", providerKey)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Invalid authorization provider"}`))
		return
	}

	provider.HandleLogin(w, r)
}
