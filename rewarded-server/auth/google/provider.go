package google

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hervinhio/rewarded-recorder/auth/jwt"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"go.mongodb.org/mongo-driver/mongo"
	"io"
	"log"
	"math/rand/v2"
	"net/http"
	"os"
	"strings"
)

type auth_response struct {
	Access_token string `json:"access_token"`
	Token_type   string `json:"token_type"`
	Expires_in   int64  `json:"expires_in"`
	Id_token     string `json:"id_token"`
}

type gt_pyload struct {
	Gt string `json:"gt"`
}

type userinfo struct {
	Sub            string `json:"sub"`
	Name           string `json:"name"`
	Given_name     string `json:"given_name"`
	Family_name    string `json:"family_name"`
	Picture        string `json:"picture"`
	Email          string `json:"email"`
	Email_verified bool   `json:"email_verified"`
	Locale         string `json:"locale"`
	Hd             string `json:"hd"`
}

type GoogleAuthProvider struct {
}

func (p GoogleAuthProvider) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Has("code") {
		p.handleMakeIdTokenRequest(w, r)
		return
	}

	p.handleMakeCodeRequest(w, r)
}

func (p GoogleAuthProvider) handleMakeCodeRequest(w http.ResponseWriter, r *http.Request) {
	baseURL := fmt.Sprintf("%s/sec/login/google", os.Getenv("HOSTNAME")) // Current URL
	if os.Getenv("MODE") == "development" {
		baseURL = os.Getenv("DEV_HOSTNAME")
	}
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")   // Replace with your client ID"
	authorizeURL := os.Getenv("GOOGLE_AUTHORIZE_URL") // "https://accounts.google.com/o/oauth2/auth";
	state := generateRandomString(32)
	params := map[string]string{
		"client_id":     googleClientID,
		"redirect_uri":  baseURL,
		"state":         state,
		"response_type": "code",
		"scope":         "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
	}

	w.Header().Set("Access-Control-Allow-Origin", "https://accounts.google.com")
	w.Write([]byte(`{"ok": true, "message": "Redirecting to Google for authentication", "url": "` + getGoogleAuthURL(authorizeURL, params) + `"}`))
}

func generateRandomString(length int) string {
	characters := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	charactersLength := len(characters)
	result := make([]byte, 0, length)

	for i := 0; i < length; i++ {
		result = append(result, characters[rand.IntN(charactersLength)])
	}
	return string(result)
}

func getGoogleAuthURL(authorizeURL string, params map[string]string) string {
	queryString := ""
	for key, value := range params {
		queryString += fmt.Sprintf("%s=%s&", key, value)
	}

	return fmt.Sprintf("%s?%s", authorizeURL, queryString)
}

func (p GoogleAuthProvider) Init() {
	if os.Getenv("GOOGLE_CLIENT_ID") == "" {
		log.Fatalf("GOOGLE_CLIENT_ID is not set")
	}

	if os.Getenv("GOOGLE_CLIENT_SECRET") == "" {
		log.Fatalf("GOOGLE_CLIENT_SECRET is not set")
	}

	if os.Getenv("GOOGLE_AUTHORIZE_URL") == "" {
		log.Fatalf("GOOGLE_AUTHORIZE_URL is not set")
	}
}

func (p GoogleAuthProvider) handleMakeIdTokenRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	code := r.URL.Query().Get("code")
	baseURL := fmt.Sprintf("%s/sec/login/google", os.Getenv("HOSTNAME")) // Current URL
	if os.Getenv("MODE") == "development" {
		baseURL = os.Getenv("DEV_HOSTNAME")
	}
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")         // Replace with your client ID"
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET") // Replace with your client secret"

	params := map[string]string{
		"grant_type":    "authorization_code",
		"client_id":     googleClientID,
		"client_secret": googleClientSecret,
		"redirect_uri":  baseURL,
		"code":          code,
	}

	client := http.Client{}
	body, _ := json.Marshal(params)
	req, err := http.NewRequest(http.MethodPost, "https://oauth2.googleapis.com/token", bytes.NewReader(body))
	if err != nil {
		log.Printf("Failed to create request, err=[%v]", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to make request, err=[%v]", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(resp.StatusCode)

		authResponse, err := io.ReadAll(resp.Body)
		if err == nil {
			log.Printf("Failed to authenticate, status=[%d], err=[%s]", resp.StatusCode, authResponse)
		} else {
			log.Printf("Failed to authenticate, status=[%d]", resp.StatusCode)
		}

		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	var response auth_response
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		log.Printf("Failed to decode response, err=[%v]", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	// 1. Vérifier s'il existe un utilisateur avec l'addresse email indiquée dans la base de données
	user, err := decodeIdTokenAndFindUser(response)
	if err != nil {
		log.Printf("Error while finding user by email address, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to parse Google auth token"}`))
		return
	}

	// 	1.1 S'il n'existe pas, créer un utilisateur avec l'addresse email et le nom complet. Le nom complet doit être pris depuis les serveurs de Google
	// 		Voir https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/
	if user.Email == "none@nowhere.dom" {
		tokensInBytes, _ := json.Marshal(response)
		base64Tokens := base64.RawStdEncoding.EncodeToString(tokensInBytes)
		_, _ = w.Write([]byte(fmt.Sprintf(`{"ok": true, "gt": "%s", "action": "register"}`, base64Tokens)))
		return
	}

	// 	1.2 S'il existe
	// 	1.2.1 Générer un token d'authentification de l'utilisateur comme dans le basic authentication,
	// 	1.1.2 rédiriger vers la page d'accueil
	token, err := jwt.GenerateJWT(user)
	if err != nil {
		log.Printf("Failed to generate token, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to generate token"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	jwt.SetAuthenticationCookie(token, w, jwt.IsHttpRequest(r))
	_, _ = w.Write([]byte(
		fmt.Sprintf(`{"ok": true, "message": "User logged in successfully", "action": "continue", "jwt": "%s"}`, token),
	))
}

func decodeIdTokenAndFindUser(response auth_response) (entities.User, error) {
	var user entities.User
	id_token, err := decodeToken(response.Id_token)
	if err != nil {
		log.Printf("decodeIdTokenAndFindUser() => Error while decoding token, err=[%v]", err)
		return entities.User{
			Email: "none@nowhere.dom",
		}, err
	}

	user, err = persistence.AllManagers.Users.FindOne(entities.User{
		Email: id_token.Email,
	})
	if err != nil {
		log.Printf("decodeIdTokenAndFindUser() => Error while authenticating user, err=[%v]", err)
		log.Printf("decodeIdTokenAndFindUser() => Error while decoding token, err=[%v]", err)

		if errors.Is(err, mongo.ErrNoDocuments) {
			return entities.User{
				Email: "none@nowhere.dom",
			}, nil
		}
		return entities.User{
			Email: "none@nowhere.dom",
		}, err
	}

	return user, nil
}

func decodeToken(token string) (id_token, error) {
	var decoded_token id_token
	tokens := strings.Split(token, ".")
	decodedBytes, err := base64.RawStdEncoding.DecodeString(tokens[1])
	if err != nil {
		fmt.Println("decodeToken ()=> Erreur lors du décodage :", err)
		return id_token{}, err
	}

	err = json.Unmarshal(decodedBytes, &decoded_token)
	if err != nil {
		fmt.Println("Erreur lors de l'umarchalisation du token :", err)
	}

	return decoded_token, nil
}

func (p *GoogleAuthProvider) HandleRegister(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		response := entities.ErrorResponse{
			Message: "Invalid request",
			Code:    http.StatusBadRequest,
			Ok:      false,
		}
		w.WriteHeader(http.StatusBadRequest)
		data, _ := json.Marshal(response)
		_, _ = w.Write(data)
		return
	}

	var gt gt_pyload
	err = json.Unmarshal(payload, &gt)
	if err != nil {
		response := entities.ErrorResponse{
			Message: "Invalid request",
			Code:    http.StatusBadRequest,
			Ok:      false,
		}
		w.WriteHeader(http.StatusBadRequest)
		data, _ := json.Marshal(response)
		_, _ = w.Write(data)
		return
	}

	decodedGt, err := base64.RawStdEncoding.DecodeString(gt.Gt)
	if err != nil {
		log.Printf("failed to decode gt payload err=[%v]", err)
		response := entities.ErrorResponse{
			Message: "Invlid gt payload",
			Code:    http.StatusForbidden,
		}
		w.WriteHeader(http.StatusInternalServerError)
		data, _ := json.Marshal(response)
		_, _ = w.Write(data)
		return
	}

	var googleTokens auth_response
	err = json.Unmarshal(decodedGt, &googleTokens)
	if err != nil {
		log.Printf("failed to decode gt payload err=[%v]", err)
		response := entities.ErrorResponse{
			Message: "Invalid gt payload",
			Code:    http.StatusForbidden,
		}
		w.WriteHeader(http.StatusInternalServerError)
		data, _ := json.Marshal(response)
		_, _ = w.Write(data)
		return
	}

	client := http.Client{}
	req, err := http.NewRequest(http.MethodGet, "https://www.googleapis.com/oauth2/v3/userinfo?alt=json", nil)
	if err != nil {
		log.Printf("Failed to create request, err=[%v]", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", googleTokens.Access_token))
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to make request, err=[%v]", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		log.Printf("Failed to authenticate, status=[%d]", resp.StatusCode)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	var googleUser userinfo
	err = json.NewDecoder(resp.Body).Decode(&googleUser)
	if err != nil {
		log.Printf("Failed to decode response, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to make authentication request to Google"}`))
		return
	}

	user := entities.User{
		DisplayName: fmt.Sprintf("%s %s %s", googleUser.Given_name, googleUser.Name, googleUser.Family_name),
		Email:       googleUser.Email,
		PhotoURL:    googleUser.Picture,
		Validated:   false,
		Admin:       false,
		IsSuperUser: false,
	}

	_, err = persistence.AllManagers.Users.InsertOne(user)
	if err != nil {
		log.Printf("Failed to create user, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to create user"}`))
		return
	}

	token, err := jwt.GenerateJWT(user)
	if err != nil {
		log.Printf("Failed to generate token, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"ok": false, "message": "Failed to generate token"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	jwt.SetAuthenticationCookie(token, w, jwt.IsHttpRequest(r))
	_, _ = w.Write([]byte(
		fmt.Sprintf(`{"ok": true, "message": "User registered in successfully", "action": "continue", "jwt": "%s"}`, token),
	))
}
