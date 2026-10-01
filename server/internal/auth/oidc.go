package auth

import (
	"context"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"pycrs.cz/openvpn-client-zone/internal/config"
)

type OIDCProvider struct {
	Config       config.OIDCConfig
	OAuth2Config oauth2.Config
	Verifier     *oidc.IDTokenVerifier
}

func NewOIDCProvider(ctx context.Context, cfg config.OIDCConfig) (*OIDCProvider, error) {
	provider, err := oidc.NewProvider(ctx, cfg.IssuerURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch discovery endpoint: %w", err)
	}

	oauth2Cfg := oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		Scopes:       []string{oidc.ScopeOpenID, oidc.ScopeProfile, oidc.ScopeEmail},
		Endpoint:     provider.Endpoint(),
	}

	verifier := provider.Verifier(&oidc.Config{ClientID: cfg.ClientID})

	return &OIDCProvider{
		Config:       cfg,
		OAuth2Config: oauth2Cfg,
		Verifier:     verifier,
	}, nil
}
