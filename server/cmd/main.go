package main

import (
	"context"
	"fmt"
	"log"
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
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt)
	defer stop()

	log.Printf("Starting openvpn-client-zone")

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

	tokenService := service.NewTokenService(config.JWT)
	userService := service.NewUserService(userRepository)

	server := rest.NewServer(oidcProvider, tokenService, userService)

	httpServer := &http.Server{
		Addr:    net.JoinHostPort(config.Server.Host, strconv.Itoa(config.Server.Port)),
		Handler: server,
	}

	// we run the server in a separate goroutine
	go func() {
		log.Printf("Listening on %s\n", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "error listening and serving: %s\n", err)
		}
	}()

	// graceful shutdown logic running in a separate goroutine waiting for context cancellation
	var wg sync.WaitGroup
	wg.Add(1)
	wg.Go(func() {
		<-ctx.Done()
		log.Print("Shutting down HTTP server...")

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			fmt.Fprintf(os.Stderr, "error shutting down http server: %s\n", err)
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
