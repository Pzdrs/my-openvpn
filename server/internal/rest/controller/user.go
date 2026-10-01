package controller

import (
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/service"
)

type UserController struct {
}

func NewUserController() *UserController {
	return &UserController{}
}

func (c *UserController) HandleMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := service.GetTokenClaims(r.Context())
	if !ok {
		http.Error(w, "Failed to retrieve token claims", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"sub":"` + claims.Subject + `"}`))
}
