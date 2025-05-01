package auth

import (
	"github.com/go-chi/chi"
)

func RegisterRoutes(r chi.Router) {
	r.Post("/register", handleRegister)
	r.Post("/login", handleLogin)
	r.Post("/login/{provider}", handleLogin)
	r.Post("/logout", handleLogout)
}
