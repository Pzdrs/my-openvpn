package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
	"pycrs.cz/openvpn-client-zone/internal/auth"
	"pycrs.cz/openvpn-client-zone/internal/rest/controller"
	"pycrs.cz/openvpn-client-zone/internal/rest/middleware"
	"pycrs.cz/openvpn-client-zone/internal/service"
)

func NewServer(
	oidcProvider *auth.OIDCProvider,
	tokenService *service.TokenService,
) http.Handler {
	r := chi.NewRouter()
	r.Use(chi_middleware.Logger)

	RequireAuthenticated := middleware.NewRequireAuthenticatedMiddleware(tokenService)

	authController := controller.NewAuthController(oidcProvider, tokenService)
	userController := controller.NewUserController()

	r.Route("/api/v1", func(api chi.Router) {
		addRoutes(
			api,
			authController,
			userController,
			RequireAuthenticated,
		)
	})

	return r
}
