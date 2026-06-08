package config

import (
	"errors"
	"fmt"
	"os"
)

type Config struct {
	DBHost     string
	DBUser     string
	DBPort     string
	DBPassword string
	DBName     string
	ServerPort string
	ServerHost string
	JWTSecret  string
}

func Load() (*Config, error) {
	c := &Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBUser:     os.Getenv("DB_USER"),
		DBPort:     os.Getenv("DB_PORT"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		ServerPort: os.Getenv("SERVER_PORT"),
		ServerHost: os.Getenv("SERVER_HOST"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
	}

	if c.DBPort == "" || c.DBHost == "" || c.DBUser == "" || c.DBName == "" || c.DBPassword == "" {
		return nil, errors.New("недостаточно данных для инициализации БД")
	}

	return c, nil
}

func (c *Config) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
