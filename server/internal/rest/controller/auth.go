package controller

import (
	"fmt"
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/auth"
	"pycrs.cz/openvpn-client-zone/internal/service"
	"pycrs.cz/openvpn-client-zone/internal/utils"
)

type AuthController struct {
	oidcProvider *auth.OIDCProvider
	tokenService *service.TokenService
}

func NewAuthController(oidcProvider *auth.OIDCProvider, tokenService *service.TokenService) *AuthController {
	return &AuthController{
		oidcProvider: oidcProvider,
		tokenService: tokenService,
	}
}

func (c *AuthController) HandleLogin(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, c.oidcProvider.OAuth2Config.AuthCodeURL("state"), http.StatusFound)
}

func (c *AuthController) HandleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	if code == "" {
		http.Error(w, "Missing code in callback", http.StatusBadRequest)
		return
	}

	oauth_token, err := c.oidcProvider.OAuth2Config.Exchange(r.Context(), code)
	if err != nil {
		http.Error(w, "Failed to exchange code for token", http.StatusInternalServerError)
		return
	}

	rawIDToken, ok := oauth_token.Extra("id_token").(string)
	if !ok {
		http.Error(w, "No id_token in response", http.StatusBadRequest)
		return
	}

	idToken, err := c.oidcProvider.Verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		http.Error(w, "Failed to verify ID token", http.StatusUnauthorized)
		return
	}

	var claims struct {
		Subject       string `json:"sub"` // Unique User ID from IdP
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}

	if err := idToken.Claims(&claims); err != nil {
		http.Error(w, "Failed to parse claims", http.StatusInternalServerError)
		return
	}

	token, err := c.tokenService.GenerateToken(claims.Subject)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     utils.ACCESS_TOKEN_COOKIE_NAME,
		Value:    token,
		MaxAge:   int(c.tokenService.TokenLifetime.Seconds()),
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
	http.SetCookie(w, &http.Cookie{
		Name:     utils.IS_AUTHENTICATED_COOKIE_NAME,
		Value:    "true",
		MaxAge:   int(c.tokenService.TokenLifetime.Seconds()),
		HttpOnly: false,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	fmt.Fprintf(w, "Login successful! User: %s, Email: %s, Token: %s", claims.Name, claims.Email, token)
}

func (c *AuthController) HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   utils.ACCESS_TOKEN_COOKIE_NAME,
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})
	http.SetCookie(w, &http.Cookie{
		Name:   utils.IS_AUTHENTICATED_COOKIE_NAME,
		Value:  "false",
		MaxAge: -1,
		Path:   "/",
	})

	w.WriteHeader(http.StatusNoContent)
}
