package service

import "context"

type claimsContextKey struct{}

func WithTokenClaims(ctx context.Context, claims *TokenClaims) context.Context {
	return context.WithValue(ctx, claimsContextKey{}, claims)
}

func GetTokenClaims(ctx context.Context) (*TokenClaims, bool) {
	claims, ok := ctx.Value(claimsContextKey{}).(*TokenClaims)
	return claims, ok
}
