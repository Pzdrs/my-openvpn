package config

type Configuration struct {
	Server   ServerConfig
	Database DatabaseConfig
	OIDC     OIDCConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Host string
	Port int `validate:"min=1,max=65535"`
}

type DatabaseConfig struct {
	URL      string
	User     string
	Password string
	Host     string
	Port     int
	Name     string
}

type OIDCConfig struct {
	ClientID     string
	ClientSecret string
	IssuerURL    string
}

type JWTConfig struct {
	SecretKey     string
	TokenLifetime string
}
