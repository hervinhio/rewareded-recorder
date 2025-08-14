package middlewares

import (
	"context"
	"net/http"
	"github.com/hervinhio/rewarded-recorder/entities"
)

// RequirePermission is a middleware that checks if the current user has the required permission
func RequirePermission(permission entities.Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user from context (should be set by AuthMiddleWare)
			user := getUserFromContext(r.Context())
			if user == nil {
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte("{\"error\": \"Authentication required\"}"))
				return
			}

			// Check if user has the required permission
			if !user.HasPermission(permission) {
				w.WriteHeader(http.StatusForbidden)
				_, _ = w.Write([]byte("{\"error\": \"Insufficient permissions\"}"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireAnyPermission is a middleware that checks if the current user has any of the required permissions
func RequireAnyPermission(permissions ...entities.Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user from context (should be set by AuthMiddleWare)
			user := getUserFromContext(r.Context())
			if user == nil {
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte("{\"error\": \"Authentication required\"}"))
				return
			}

			// Check if user has any of the required permissions
			hasPermission := false
			for _, permission := range permissions {
				if user.HasPermission(permission) {
					hasPermission = true
					break
				}
			}

			if !hasPermission {
				w.WriteHeader(http.StatusForbidden)
				_, _ = w.Write([]byte("{\"error\": \"Insufficient permissions\"}"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireRole is a middleware that checks if the current user has the required role
func RequireRole(role entities.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user from context (should be set by AuthMiddleWare)
			user := getUserFromContext(r.Context())
			if user == nil {
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte("{\"error\": \"Authentication required\"}"))
				return
			}

			// Check if user has the required role or higher
			if user.GetEffectiveRole() != role && user.GetEffectiveRole() != entities.RoleRoot {
				w.WriteHeader(http.StatusForbidden)
				_, _ = w.Write([]byte("{\"error\": \"Insufficient role permissions\"}"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// getUserFromContext retrieves the user from the request context
func getUserFromContext(ctx context.Context) *entities.User {
	user, ok := ctx.Value("user").(*entities.User)
	if !ok {
		return nil
	}
	return user
}