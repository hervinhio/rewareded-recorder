package basic

import (
  "encoding/json"
  "github.com/hervinhio/rewarded-recorder/auth/jwt"
  "github.com/hervinhio/rewarded-recorder/entities"
  "github.com/hervinhio/rewarded-recorder/persistence"
  "io"
  "log"
  "net/http"
  "os"

  "golang.org/x/crypto/bcrypt"
)

type BasicAuthProvier struct {
  jwtKey string
}

func (p BasicAuthProvier) HandleLogin(w http.ResponseWriter, r *http.Request) {
  body, err := io.ReadAll(r.Body)
  if err != nil {
    log.Print("HandleLogin() => Error while reading request body", err)
    response := entities.ErrorResponse{
      Message: "The provided credentials are unreadable",
      Code:    http.StatusBadRequest,
    }
    w.WriteHeader(http.StatusBadRequest)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  var credentials entities.Credentials

  err = json.Unmarshal(body, &credentials)
  if err != nil {
    log.Printf("HandleLogin() Error while unmarshalling payload for creating many goods, err=[%v]", err)
    response := entities.ErrorResponse{
      Message: "Error while unmarshalling payload for creating many goods",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusBadRequest)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  if credentials.EmailAddress == "" || credentials.Password == "" {
    response := entities.ErrorResponse{
      Message: "Invalid username or password",
      Code:    http.StatusBadRequest,
    }
    w.WriteHeader(http.StatusInternalServerError)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  if err != nil {
    log.Printf("handleLogin() => Error while encrypting password, err=[%v]", err)
    response := entities.ErrorResponse{
      Message: "Cann't log you in at the moment. Try again later",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusInternalServerError)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  user, err := persistence.AllManagers.Users.FindOne(entities.User{
    Email: credentials.EmailAddress,
  })
  if err != nil {
    log.Printf("handleLogin() => Error while authenticating user, err=[%v]", err)
    response := entities.ErrorResponse{
      Message: "Invalid username or password",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusBadRequest)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  if user.Email == "none@nowhere.dom" {
    response := entities.ErrorResponse{
      Message: "Invalid username or password",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusForbidden)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
    response := entities.ErrorResponse{
      Message: "Invalid username or password",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusForbidden)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  jwtToken, err := jwt.GenerateJWT(user)
  if err != nil {
    log.Printf("handleLogin() => Error while gernerating cookie, err=[%v]", err)
    response := entities.ErrorResponse{
      Message: "Invalid username or password",
      Code:    http.StatusForbidden,
    }
    w.WriteHeader(http.StatusBadRequest)
    data, _ := json.Marshal(response)
    _, _ = w.Write(data)
    return
  }

  jwt.SetAuthenticationCookie(jwtToken, w, jwt.IsHttpRequest(r))
  w.WriteHeader(http.StatusOK)
  response := jwt.SuccessResponse{
    Ok:  true,
    Jwt: jwtToken,
  }
  data, _ := json.Marshal(response)
  _, _ = w.Write(data)
}

func (p *BasicAuthProvier) Init() {

  p.jwtKey = os.Getenv("JWT_KEY")

  if p.jwtKey == "" {
    log.Fatal("JWT_KEY env variable must be set")
  }
}

func (p *BasicAuthProvier) HandleRegister(w http.ResponseWriter, r *http.Request) {

}
