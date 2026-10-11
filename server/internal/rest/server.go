package rest

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
	"pycrs.cz/openvpn-client-zone/internal/auth"
	"pycrs.cz/openvpn-client-zone/internal/rest/controller"
	"pycrs.cz/openvpn-client-zone/internal/rest/middleware"
	"pycrs.cz/openvpn-client-zone/internal/service"
)

// @title		OpenVPN Client Zone API
// @version	1.0
// @BasePath	/api/v1
func NewServer(
	oidcProvider *auth.OIDCProvider,
	tokenService *service.TokenService,
	userService *service.UserService,
	serverService *service.ServerService,
) http.Handler {
	r := chi.NewRouter()
	r.Use(chi_middleware.Logger)

	RequireAuthenticated := middleware.NewRequireAuthenticatedMiddleware(tokenService)
	RequireAdmin := middleware.NewRequireAdminMiddleware(tokenService)

	authController := controller.NewAuthController()
	userController := controller.NewUserController(userService)
	oauthController := controller.NewOAuthController(slog.Default(), oidcProvider, tokenService, userService)
	serverController := controller.NewServerController(slog.Default(), serverService)

	r.Route("/api/v1", func(api chi.Router) {
		addRoutes(
			api,
			authController,
			userController,
			oauthController,
			serverController,
			RequireAuthenticated,
			RequireAdmin,
		)
	})

	return r
}
