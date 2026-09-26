package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"pycrs.cz/openvpn-client-zone/internal/rest/controller"
)

func addRoutes(
	r chi.Router,
	authController *controller.AuthController,
	userController *controller.UserController,

	RequireAuthenticated func(http.Handler) http.Handler,
) {
	r.Route("/auth", func(r chi.Router) {
		r.Get("/login", authController.HandleLogin)
		r.Get("/callback", authController.HandleCallback)

		r.Group(func(r chi.Router) {
			r.Use(RequireAuthenticated)
			r.Get("/logout", authController.HandleLogout)
		})
	})

	r.With(RequireAuthenticated).Route("/users", func(r chi.Router) {
		r.Get("/me", userController.HandleMe)
	})
}
