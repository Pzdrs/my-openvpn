package controller

import (
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/utils"
)

type AuthController struct {
}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// HandleLogout handles the logout request by clearing the authentication cookies.
//
//	@Summary	Initiate logout
//	@Id			Logout
//	@Tags		auth
//	@Success	204
//	@Router		/auth/logout [post]
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
