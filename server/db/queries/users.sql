-- name: GetUserByExternalID :one
SELECT * FROM users WHERE external_id = $1; 

-- name: CreateUser :one
INSERT INTO users (external_id) VALUES ($1) RETURNING *;