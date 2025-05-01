package google

type id_token struct {
	Azp            string `json:"azp"`
	Aud            string `json:"aud"`
	Sub            string `json:"sub"`
	Hd             string `json:"hd"`
	Email          string `json:"email"`
	Email_verified bool   `json:"email_verified"`
	At_hash        string `json:"at_hash"`
	Exp            int    `json:"exp"`
	Iss            string `json:"iss"`
	Iat            int    `json:"iat"`
}
