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

	"pycrs.cz/openvpn-client-zone/internal/apiserver"
	"pycrs.cz/openvpn-client-zone/internal/bootstrap"
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

	server := apiserver.NewServer(ctx)

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
