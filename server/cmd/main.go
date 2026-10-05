package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"time"

	"pycrs.cz/openvpn-client-zone/internal/auth"
	"pycrs.cz/openvpn-client-zone/internal/bootstrap"
	"pycrs.cz/openvpn-client-zone/internal/queries"
	"pycrs.cz/openvpn-client-zone/internal/repository"
	"pycrs.cz/openvpn-client-zone/internal/rest"
	"pycrs.cz/openvpn-client-zone/internal/service"
)

func run(ctx context.Context) error {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})))

	ctx, stop := signal.NotifyContext(ctx, os.Interrupt)
	defer stop()

	slog.Info("Starting openvpn-client-zone")

	config, err := bootstrap.InitConfig()
	if err != nil {
		return fmt.Errorf("failed to initialize config: %w", err)
	}

	connPool, err := bootstrap.InitDB(ctx, config)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	defer connPool.Close()

	oidcProvider, err := auth.NewOIDCProvider(ctx, config.OIDC)
	if err != nil {
		return fmt.Errorf("failed to initialize OIDC provider: %w", err)
	}

	q := queries.New(connPool)

	userRepository := repository.NewUserRepository(q)
	serverRepository := repository.NewServerRepository(q)

	tokenService := service.NewTokenService(config.JWT)
	userService := service.NewUserService(slog.Default().With("service", "user"), userRepository)
	serverService := service.NewServerService(serverRepository)

	server := rest.NewServer(oidcProvider, tokenService, userService, serverService)

	httpServer := &http.Server{
		Addr:    net.JoinHostPort(config.Server.Host, strconv.Itoa(config.Server.Port)),
		Handler: server,
	}

	// we run the server in a separate goroutine
	go func() {
		slog.Info("Listening on", "address", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("error listening and serving", "error", err)
		}
	}()

	// graceful shutdown logic running in a separate goroutine waiting for context cancellation
	var wg sync.WaitGroup
	wg.Add(1)
	wg.Go(func() {
		<-ctx.Done()
		slog.Info("Shutting down HTTP server...")

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		slog.Info("Shutting down HTTP server", "timeout", 10*time.Second)
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			slog.Error("error shutting down http server", "error", err)
		}
	})
	wg.Wait()

	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
