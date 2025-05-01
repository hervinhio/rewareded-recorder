package entities

type ErrorResponse struct {
	Ok      bool   `json:"ok"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}
