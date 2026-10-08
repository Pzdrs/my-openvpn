-- +goose Up
-- +goose StatementBegin
CREATE TABLE user_last_downloads (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    server_id INT REFERENCES servers(id) ON DELETE CASCADE,
    last_downloaded_at TIMESTAMPTZ NOT NULL,
    downloaded_profile_hash CHAR(64) NOT NULL,
    PRIMARY KEY (user_id, server_id) 
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE user_last_downloads;
-- +goose StatementEnd
