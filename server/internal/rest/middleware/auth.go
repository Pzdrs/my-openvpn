package middleware

import (
	"errors"
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
				clearAuthCookies(w)
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

func NewRequireAdminMiddleware(tokenService *service.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := service.GetTokenClaims(r.Context())
			if !ok {
				problem.Write(w, problem.NewInternalServerError(r, errors.New("failed to retrieve token claims")))
				return
			}

			if !claims.IsAdmin {
				problem.Write(w, problem.NewForbidden(r, errors.New("user is not authorized to access this resource")))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func clearAuthCookies(w http.ResponseWriter) {
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
}
