package middlewares

import (
	"context"
	"github.com/golang-jwt/jwt/v5"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"log"
	"net/http"
	"os"
	"strings"
)

const tableName = "users"

func AuthMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.Path, "/api") {
			next.ServeHTTP(w, r)
			return
		}

		token := strings.TrimLeft("Bearer ", r.Header.Get("Authorization"))
		if token == "" && !isWhiteListedEndpoint(r.URL.Path) {
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
		}

		isValidToken, parsedToken := isTokenValid(token)
		if !isValidToken {
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
		}

		userIdClaims, err := parsedToken.Claims.GetAudience()
		if err != nil {
			log.Printf("Error getting audience: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
		}

		userIdBytes, err := userIdClaims.MarshalJSON()
		if err != nil {
			log.Printf("Error marshalling audience: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
		}

		userId := string(userIdBytes)
		if userId == "" {
			userId = r.Header.Get("X-User-Id")
		}

		realmId := r.Header.Get("X-Realm")
		primitiveUserId := persistence.StringToId(userId)

		if primitiveUserId == nil {
			w.WriteHeader(http.StatusForbidden)
			_, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
			return
		}

		criteria := entities.User{
			RealmId: realmId,
			Id:      primitiveUserId,
		}
		user, err := persistence.AllManagers.Users.FindOne(criteria)
		if err != nil {
			log.Printf("Error finding user: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
			return
		}

		if user.RealmId != realmId && !user.IsSuperUser {
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
			return
		}

		rWithContext := r.WithContext(context.WithValue(r.Context(), "realmId", realmId))
		next.ServeHTTP(w, rWithContext)
	})
}

func isWhiteListedEndpoint(path string) bool {
	return strings.Contains(path, "/health") || strings.Contains(path, "/login")
}

func isTokenValid(token string) (bool, *jwt.Token) {
	if !isTokenNotInvalidated(token) {
		return false, nil
	}

	parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return os.Getenv("JWT_KEY"), nil
	})

	if err != nil {
		log.Printf("Error parsing token: %v", err)
		return false, nil
	}

	return parsed.Valid, parsed
}

func isTokenNotInvalidated(jwt string) bool {
	if ok, err := persistence.AllManagers.InvalidJWT.IsInvalidated(jwt); !ok {
		if err != nil {
			log.Printf("Error checking if token is invalidated: %v", err)
			return false
		}
	}

	return true
}
