package config

import (
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
}

func Load() *Config {
	return &Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBUser:     os.Getenv("DB_USER"),
		DBPort:     os.Getenv("DB_PORT"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		ServerPort: os.Getenv("SERVER_PORT"),
		ServerHost: os.Getenv("SERVER_HOST"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("user=%s dbname=%s password=%s host=%s port=%s sslmode=disable", c.DBUser, c.DBName, c.DBPassword, c.DBHost, c.DBPort)
}
