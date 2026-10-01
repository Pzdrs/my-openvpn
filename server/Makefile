build: 
	go build -o bin/api ./cmd/

run: 
	go run ./cmd/main.go

sqlc:
	sqlc generate -f infra/db/sqlc.yaml

swag:
	swag fmt
	swag init -g server.go --parseInternal -o ./api -d internal/rest
