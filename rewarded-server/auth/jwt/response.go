package jwt

type SuccessResponse struct {
	Jwt string `json:"jwt"`
	Ok  bool   `json:"ok"`
}
