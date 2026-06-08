-- +goose Up
CREATE TABLE managers (
    manager_id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- +goose Down
DROP TABLE managers;
