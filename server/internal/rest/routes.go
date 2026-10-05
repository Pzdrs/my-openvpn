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
	oauthController *controller.OAuthController,
	serverController *controller.ServerController,

	RequireAuthenticated func(http.Handler) http.Handler,
) {
	r.Route("/auth", func(r chi.Router) {
		r.With(RequireAuthenticated).Post("/logout", authController.HandleLogout)
	})

	r.Route("/oauth", func(r chi.Router) {
		r.Post("/authorize", oauthController.HandleAuthorize)
		r.Post("/callback", oauthController.HandleCallback)
	})

	r.With(RequireAuthenticated).Route("/users", func(r chi.Router) {
		r.Get("/me", userController.HandleMe)
	})

	r.With(RequireAuthenticated).Route("/servers", func(r chi.Router) {
		r.Get("/", serverController.HandleUserServers)
	})
}
