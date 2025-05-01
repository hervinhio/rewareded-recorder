package entities

type InvalidJWT struct {
	Jwt string `json:"jwt" bson:"jwt"`
}
