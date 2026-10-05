-- name: GerUserServers :many
SELECT
    s.id,
    s.name,
    s.description,
    s.created_at,
    s.updated_at,
    p.id as profile_id,
    p.profile_data,
    p.profile_hash,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at
FROM
    servers s
    LEFT JOIN profiles p ON s.id = p.server_id;

-- name: GetServerProfile :one
SELECT
    id,
    profile_data,
    profile_hash,
    updated_at,
    created_at
FROM
    profiles
WHERE
    server_id = $1;