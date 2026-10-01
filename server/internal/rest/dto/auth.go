package dto

type OAuthAuthorizeRequest struct {
	RedirectURI string `json:"redirect_uri" validate:"required,url"`
}

type OAuthAuthorizeResponse struct {
	URL string `json:"url" validate:"required,url"`
}

type OAuthCallbackRequest struct {
	URL   string `json:"url" validate:"required,url"`
}

type OAuthCallbackResponse struct{}
