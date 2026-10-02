package controller

import (
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/rest/dto"
	"pycrs.cz/openvpn-client-zone/internal/rest/utils"
	"pycrs.cz/openvpn-client-zone/internal/service"
)

type UserController struct {
	userService *service.UserService
}

func NewUserController(userService *service.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// HandleMe handles the request to retrieve the authenticated user's information.
//
//	@Summary	Get authenticated user info
//	@Id			GetMe
//	@Tags		user
//	@Success	200	{object}	dto.User
//	@Router		/users/me [get]
func (c *UserController) HandleMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := service.GetTokenClaims(r.Context())
	if !ok {
		http.Error(w, "Failed to retrieve token claims", http.StatusInternalServerError)
		return
	}

	utils.Encode(w, r, http.StatusOK, dto.User{
		ID:      claims.Subject,
		Email:   claims.Email,
		Name:    claims.Name,
		Picture: claims.Picture,
	})
}
