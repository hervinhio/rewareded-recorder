package auth

import (
	"github.com/hervinhio/rewarded-recorder/auth/basic"
	"github.com/hervinhio/rewarded-recorder/auth/google"
)

var providers = map[string]AuthProvider{
	"basic":  &basic.BasicAuthProvier{},
	"google": &google.GoogleAuthProvider{},
}

func InitAuth() {
	for _, provider := range providers {
		provider.Init()
	}
}
