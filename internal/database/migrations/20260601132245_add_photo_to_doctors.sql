-- +goose Up
ALTER TABLE doctors
ADD COLUMN photo_url VARCHAR(255) DEFAULT 'web/uploads/doctors/default.png';

-- +goose Down

ALTER TABLE doctors
DROP COLUMN photo_url;
