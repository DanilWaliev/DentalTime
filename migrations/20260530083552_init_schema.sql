-- +goose Up

CREATE TABLE IF NOT EXISTS services(
  service_id SERIAL PRIMARY KEY,
  title VARCHAR(50) UNIQUE NOT NULL,
  subtitle VARCHAR(200) NOT NULL,
  duration INT NOT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors(
  doctor_id SERIAL PRIMARY KEY,
  full_name VARCHAR(50) NOT NULL,
  spec VARCHAR(30) NOT NULL,
  experience INT NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors_services(
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
  PRIMARY KEY(doctor_id, service_id)
);

CREATE TABLE IF NOT EXISTS appointments(
  appointment_id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  status VARCHAR(20),
  patient_first_name VARCHAR(18) NOT NULL,
  patient_phone_number VARCHAR(11) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  service_id INT NOT NULL,
  doctor_id INT NOT NULL,

  FOREIGN KEY (doctor_id, service_id) REFERENCES doctors_services(doctor_id, service_id) ON DELETE RESTRICT
);

-- +goose Down

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors_services;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS services;
