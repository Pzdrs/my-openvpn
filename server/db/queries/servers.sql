-- name: CreateServer :one
INSERT INTO servers (name, description)
VALUES ($1, $2)
RETURNING id, name, description, created_at, updated_at;

-- name: DeleteServer :exec
DELETE FROM servers WHERE id = $1;

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

-- name: GetLastProfileDownload :one
SELECT
    user_id,
    server_id,
    downloaded_profile_hash,
    last_downloaded_at
FROM
    user_last_downloads
WHERE
    user_id = $1 AND server_id = $2;

-- name: UpsertServerProfile :one
INSERT INTO profiles (
    server_id,
    profile_data,
    profile_hash,
    updated_at
) VALUES (
    $1, -- server_id
    $2, -- profile_data
    $3, -- profile_hash
    CURRENT_TIMESTAMP
)
ON CONFLICT (server_id) 
DO UPDATE SET
    profile_data = EXCLUDED.profile_data,
    profile_hash = EXCLUDED.profile_hash,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- name: UpsertLastDownload :exec
INSERT INTO
    user_last_downloads (user_id, server_id, last_downloaded_at, downloaded_profile_hash)
VALUES
    ($1, $2, $3, $4) ON CONFLICT (user_id, server_id) DO
UPDATE
SET
    last_downloaded_at = EXCLUDED.last_downloaded_at,
    downloaded_profile_hash = EXCLUDED.downloaded_profile_hash;

-- name: DeleteServerProfiles :exec
DELETE FROM profiles WHERE server_id = $1;