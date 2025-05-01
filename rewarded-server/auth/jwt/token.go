package jwt

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/hervinhio/rewarded-recorder/entities"
	"net/http"
	"os"
	"time"
)

func GenerateJWT(user entities.User) (tokenString string, err error) {
	expirationTime := time.Now().Add(720 * time.Hour)
	claims := jwt.MapClaims{
		"exp": expirationTime.Unix(),
		"iat": time.Now().Unix(),
		"aud": user.Email,
		"iss": os.Getenv("JWT_ISSUER"),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString([]byte(os.Getenv("JWT_KEY")))
	return
}

func SetAuthenticationCookie(token string, w http.ResponseWriter, secure bool) {
	cookie := http.Cookie{
		Name:    "jwt",
		Value:   token,
		Expires: time.Now().Add(720 * time.Hour),
		// HttpOnly: !secure,
		// Secure: secure,
	}

	http.SetCookie(w, &cookie)
}
