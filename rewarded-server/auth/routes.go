package auth

import (
	"github.com/go-chi/chi"
)

func RegisterRoutes(r chi.Router) {
	r.Post("/auth/register", handleRegister)
	r.Post("/auth/login", handleLogin)
	r.Post("/auth/login/{provider}", handleLogin)
	r.Post("/auth/logout", handleLogout)
	r.Post("/auth/verify", handleVerify)
}
