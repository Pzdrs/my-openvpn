package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"pycrs.cz/openvpn-client-zone/internal/config"
)

type TokenClaims struct {
	jwt.RegisteredClaims
}

type TokenService struct {
	secretKey     []byte
	TokenLifetime time.Duration
}

func NewTokenService(cfg config.JWTConfig) *TokenService {
	ttl, err := time.ParseDuration(cfg.TokenLifetime)
	if err != nil {
		panic("Invalid token lifetime in configuration: " + err.Error())
	}

	fmt.Println(ttl)

	return &TokenService{
		secretKey:     []byte(cfg.SecretKey),
		TokenLifetime: ttl,
	}
}

func (s *TokenService) ValidateToken(tokenString string) (*TokenClaims, error) {
	claims := &TokenClaims{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.secretKey, nil
		},
	)

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, errors.New("token has expired")
		}
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (s *TokenService) GenerateToken(userID string) (string, error) {
	claims := &TokenClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.TokenLifetime)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}
