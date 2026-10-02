package controller

import (
	"crypto/rand"
	"errors"
	"log/slog"
	"net/http"
	"net/url"

	"golang.org/x/oauth2"
	"pycrs.cz/openvpn-client-zone/internal/auth"
	"pycrs.cz/openvpn-client-zone/internal/rest/dto"
	"pycrs.cz/openvpn-client-zone/internal/rest/problem"
	rutils "pycrs.cz/openvpn-client-zone/internal/rest/utils"
	"pycrs.cz/openvpn-client-zone/internal/service"
	"pycrs.cz/openvpn-client-zone/internal/utils"
)

type OAuthController struct {
	logger       *slog.Logger
	oidcProvider *auth.OIDCProvider
	tokenService *service.TokenService
	userService  *service.UserService
}

func NewOAuthController(
	logger       *slog.Logger,
	oidcProvider *auth.OIDCProvider,
	tokenService *service.TokenService,
	userService *service.UserService) *OAuthController {
	return &OAuthController{
		logger:       logger,
		oidcProvider: oidcProvider,
		tokenService: tokenService,
		userService:  userService,
	}
}

// HandleCallback handles the OAuth2 callback from the identity provider.
//
//	@Summary	Handle OAuth2 callback
//	@Id			FinishOAuth
//	@Tags		oauth
//	@Param		request	body		dto.OAuthCallbackRequest	true	"OAuth2 callback request"
//	@Success	204		{object}	dto.OAuthCallbackResponse
//	@Router		/oauth/callback [post]
func (c *OAuthController) HandleCallback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	c.logger.InfoContext(ctx, "OAuth callback received")

	req, ok := rutils.DecodeValidate[dto.OAuthCallbackRequest](w, r)
	if !ok {
		return
	}

	stateCookie, err := r.Cookie(utils.OAUTH_STATE_COOKIE_NAME)
	if err != nil {
		problem.Write(w, problem.NewBadRequest(r, errors.New("missing state cookie")))
		return
	}

	url, err := url.Parse(req.URL)
	if err != nil {
		problem.Write(w, problem.NewBadRequest(r, errors.New("invalid URL")))
		return
	}
	query := url.Query()

	code := query.Get("code")
	state := query.Get("state")

	if state != stateCookie.Value {
		problem.Write(w, problem.NewBadRequest(r, errors.New("invalid state parameter")))
		return
	}
	c.logger.DebugContext(ctx, "OAuth callback: state validated")

	if code == "" {
		problem.Write(w, problem.NewBadRequest(r, errors.New("missing code in callback")))
		return
	}

	oauthToken, err := c.oidcProvider.OAuth2Config.Exchange(ctx, code)
	if err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to exchange code for token")))
		return
	}
	c.logger.DebugContext(ctx, "OAuth callback: authorization code exchanged")

	rawIDToken, ok := oauthToken.Extra("id_token").(string)
	if !ok {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("missing id_token in token response")))
		return
	}

	idToken, err := c.oidcProvider.Verifier.Verify(ctx, rawIDToken)
	if err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to verify ID token")))
		return
	}
	c.logger.DebugContext(ctx, "OAuth callback: ID token verified")

	var claims struct {
		Subject string `json:"sub"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := idToken.Claims(&claims); err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to parse claims")))
		return
	}

	user, err := c.userService.FindOrCreateUser(ctx, claims.Subject)
	if err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to get or create user")))
		return
	}
	c.logger.DebugContext(ctx, "OAuth callback: user ready")

	token, err := c.tokenService.GenerateToken(user.ID, claims.Email, claims.Name, claims.Picture)
	if err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to generate token")))
		return
	}

	clearStateCookie(w)

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

	w.WriteHeader(http.StatusNoContent)
	c.logger.InfoContext(ctx, "OAuth callback completed successfully", "user_id", user.ID)
}

// HandleAuthorize initiates the OAuth2 authorization flow by generating an authorization URL and setting a state cookie.
//
//	@Summary	Initiate OAuth2 authorization flow
//	@Id			StartOAuth
//	@Tags		oauth
//	@Param		request	body		dto.OAuthAuthorizeRequest	true	"OAuth2 authorization request"
//	@Success	200		{object}	dto.OAuthAuthorizeResponse
//	@Router		/oauth/authorize [post]
func (c *OAuthController) HandleAuthorize(w http.ResponseWriter, r *http.Request) {
	req, ok := rutils.DecodeValidate[dto.OAuthAuthorizeRequest](w, r)
	if !ok {
		return
	}

	nonce := rand.Text()

	url := c.oidcProvider.OAuth2Config.AuthCodeURL(
		nonce,
		oauth2.SetAuthURLParam("redirect_uri", req.RedirectURI),
	)

	setStateCookie(w, nonce)
	rutils.Encode(w, r, http.StatusOK, dto.OAuthAuthorizeResponse{URL: url})
}

func clearStateCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:   utils.OAUTH_STATE_COOKIE_NAME,
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})
}

func setStateCookie(w http.ResponseWriter, state string) {
	http.SetCookie(w, &http.Cookie{
		Name:     utils.OAUTH_STATE_COOKIE_NAME,
		Value:    state,
		MaxAge:   utils.OAUTH_STATE_COOKIE_MAX_AGE,
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
}
