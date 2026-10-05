-- name: GetUserServers :many
SELECT
    sqlc.embed(servers),
    sqlc.embed(profiles)
FROM servers
LEFT JOIN profiles ON profiles.server_id = servers.id
ORDER BY servers.name, servers.id;
