package config

import (
	"slices"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
)

func DatabaseConfigStructLevelValidation(sl validator.StructLevel) {
	cfg := sl.Current().Interface().(DatabaseConfig)

	if cfg.URL == "" {
		if cfg.Host == "" {
			sl.ReportError(cfg.Host, "host", "Host", "required_without_url", "")
		}
		if cfg.User == "" {
			sl.ReportError(cfg.User, "user", "User", "required_without_url", "")
		}
		if cfg.Password == "" {
			sl.ReportError(cfg.Password, "password", "Password", "required_without_url", "")
		}
		if cfg.Name == "" {
			sl.ReportError(cfg.Name, "name", "Name", "required_without_url", "")
		}
		if cfg.Port == 0 {
			sl.ReportError(cfg.Port, "port", "Port", "required_without_url", "")
		}
	} else {
		if _, err := pgx.ParseConfig(cfg.URL); err != nil {
			sl.ReportError(cfg.URL, "url", "URL", "invalid_postgres_url", err.Error())
		}
	}
}

func EnsureOpenIDScope(cfg *OIDCConfig) {
	if cfg != nil && !slices.Contains(cfg.Scopes, "openid") {
		cfg.Scopes = append(cfg.Scopes, "openid")
	}
}
