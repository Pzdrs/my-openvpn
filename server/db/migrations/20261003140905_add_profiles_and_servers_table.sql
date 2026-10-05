-- +goose Up
-- +goose StatementBegin
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    profile_data TEXT NOT NULL,
    profile_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE
    profiles
ADD
    CONSTRAINT unique_server_profile UNIQUE (server_id);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS servers;

DROP TABLE IF EXISTS profiles;

-- +goose StatementEnd