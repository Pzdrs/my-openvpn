package bootstrap

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"pycrs.cz/openvpn-client-zone/internal/config"
)

func InitDB(ctx context.Context, config config.Configuration) (*pgxpool.Pool, error) {
	var dsn string

	if config.Database.URL != "" {
		dsn = config.Database.URL
	} else {
		dsn = fmt.Sprintf("postgresql://%s:%s@%s:%d/%s",
			config.Database.User,
			config.Database.Password,
			config.Database.Host,
			config.Database.Port,
			config.Database.Name,
		)
	}

	conn, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Connected to database")
	return conn, nil
}