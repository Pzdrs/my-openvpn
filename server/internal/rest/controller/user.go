package controller

import (
	"errors"
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/rest/dto"
	"pycrs.cz/openvpn-client-zone/internal/rest/problem"
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
//	@Summary		Get authenticated user info
//	@Id				GetMe
//	@Tags			user
//	@Description	Get the authenticated user's information.
//	@Success		200	{object}	dto.User
//	@Router			/users/me [get]
func (c *UserController) HandleMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := service.GetTokenClaims(r.Context())
	if !ok {
		problem.Write(
			w, problem.NewInternalServerError(r, errors.New("failed to retrieve token claims")),
		)
		return
	}

	utils.Encode(w, r, http.StatusOK, dto.User{
		ID:      claims.Subject,
		Email:   claims.Email,
		Name:    claims.Name,
		Picture: claims.Picture,
		IsAdmin: claims.IsAdmin,
	})
}
