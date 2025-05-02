package middlewares

import (
	"context"
	"encoding/json"
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
		if !strings.Contains(r.URL.Path, "/api") && !strings.Contains(r.URL.Path, "/verify") {
			next.ServeHTTP(w, r)
			return
		}

		token := strings.TrimLeft(r.Header.Get("Authorization"), "Bearer")
		token = strings.TrimSpace(token)
		if token == "" && !isWhiteListedEndpoint(r.URL.Path) {
			log.Printf("AuthMiddleware() > User tried a protected route while not speciying the Authorization header")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
		}

		isValidToken, parsedToken := isTokenValid(token)
		if !isValidToken {
			log.Printf("AuthMiddleware() > User tried a protected route with an invalid token")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
		}

		if parsedToken == nil {
			log.Printf("AuthMiddleware() > User tried a protected route with an invalid token. The token failed to parse")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
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

		var userIds []string
		if err = json.Unmarshal(userIdBytes, &userIds); err != nil || len(userIds) == 0 {
			log.Printf("AuthMiddleware() > Unble to parse token audience for user id, error=%v", err)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"ok": false, "error": {"details": "You are not authorized to access this resource"} }`))
			return
		}
		userId := userIds[0]
		if userId == "" {
			userId = r.Header.Get("X-User-Id")
		}

		realmId := r.Header.Get("X-Realm")
		criteria := entities.User{
			Email: userId,
		}
		user, err := persistence.AllManagers.Users.FindOne(criteria)
		if err != nil {
			log.Printf("AuthMiddleware() > Error finding user: error=%v, userId=%s", err, userId)
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
			return
		}

		if user.RealmId != realmId && !user.IsSuperUser {
			log.Printf("AuthMiddleware() > User tried a protected route while not being a super user and not having a specific realm")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("{\"error\": \"You are not authorized to access this resource\"}"))
			return
		}

		ctx := context.WithValue(r.Context(), "userId", userId)
		ctx = context.WithValue(ctx, "realmId", realmId)
		rWithContext := r.WithContext(ctx)
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
		return []byte(os.Getenv("JWT_KEY")), nil
	})

	if err != nil {
		log.Printf("Error parsing token: error=%v, token=%s", err, token)
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
