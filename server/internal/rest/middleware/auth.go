package middleware

import (
	"net/http"

	"pycrs.cz/openvpn-client-zone/internal/rest/problem"
	"pycrs.cz/openvpn-client-zone/internal/service"
	"pycrs.cz/openvpn-client-zone/internal/utils"
)

func NewRequireAuthenticatedMiddleware(tokenService *service.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(utils.ACCESS_TOKEN_COOKIE_NAME)
			if err != nil {
				problem.Write(w, problem.New(
					r, http.StatusUnauthorized,
					"Unauthenticated",
					"Authentication is required to access this resource",
					"auth/unauthenticated",
				))
				return
			}

			claims, err := tokenService.ValidateToken(cookie.Value)
			if err != nil {
				problem.Write(w, problem.New(
					r, http.StatusUnauthorized,
					"Unauthenticated",
					"Authentication is required to access this resource",
					"auth/unauthenticated",
				))
				return
			}

			ctx := r.Context()
			ctx = service.WithTokenClaims(ctx, claims)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
