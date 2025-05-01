package auth

import (
	"log"
	"net/http"
)

func handleRegister(w http.ResponseWriter, r *http.Request) {
	providerKey := getProviderFromResquest(r)
	provider := providers[providerKey]
	if provider == nil {
		log.Printf("Invalid authorization provider: %s", providerKey)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Invalid authorization provider"}`))
		return
	}

	provider.HandleRegister(w, r)
}
