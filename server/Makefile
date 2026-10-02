build: 
	go build -o bin/api ./cmd/

run: 
	go run ./cmd/main.go

sqlc:
	sqlc generate -f db/sqlc.yaml

swag:
	swag fmt
	swag init -g server.go --parseInternal -o ./api -d internal/rest

migrate:
	goose up