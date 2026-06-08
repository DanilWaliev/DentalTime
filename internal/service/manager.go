package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"dental-time/internal/domain"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrManagerNotFound           = errors.New("manager not found")
	ErrManagerAlreadyExists      = errors.New("manager already exists")
	ErrInvalidManagerData        = errors.New("invalid manager data")
	ErrInvalidManagerCredentials = errors.New("invalid manager credentials")
	ErrInvalidJWTToken           = errors.New("invalid jwt token")
)

const (
	defaultAdminLogin    = "admin"
	defaultAdminPassword = "admin123"
	managerTokenTTL      = 24 * time.Hour
)

type ManagerRepository interface {
	GetAll(ctx context.Context) ([]*domain.Manager, error)
	GetByLogin(ctx context.Context, login string) (*domain.Manager, error)
	Create(ctx context.Context, manager domain.Manager) (*domain.Manager, error)
	Delete(ctx context.Context, id int) error
	Count(ctx context.Context) (int, error)
}

type ManagerService struct {
	managerRepo ManagerRepository
	jwtSecret   string
}

type JWTClaims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"`
	Exp  int64  `json:"exp"`
}

func NewManagerService(managerRepo ManagerRepository, jwtSecret string) *ManagerService {
	if jwtSecret == "" {
		jwtSecret = "dev-secret"
	}

	return &ManagerService{
		managerRepo: managerRepo,
		jwtSecret:   jwtSecret,
	}
}

func (s *ManagerService) EnsureDefaultManager(ctx context.Context) error {
	count, err := s.managerRepo.Count(ctx)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	_, err = s.Create(ctx, defaultAdminLogin, defaultAdminPassword)
	return err
}

func (s *ManagerService) GetAll(ctx context.Context) ([]*domain.Manager, error) {
	return s.managerRepo.GetAll(ctx)
}

func (s *ManagerService) Create(ctx context.Context, login, password string) (*domain.Manager, error) {
	login = strings.TrimSpace(login)
	password = strings.TrimSpace(password)
	if login == "" || password == "" {
		return nil, ErrInvalidManagerData
	}

	_, err := s.managerRepo.GetByLogin(ctx, login)
	if err == nil {
		return nil, ErrManagerAlreadyExists
	}
	if !errors.Is(err, ErrManagerNotFound) {
		return nil, err
	}

	passwordHash, err := hashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash manager password: %w", err)
	}

	return s.managerRepo.Create(ctx, domain.Manager{
		Login:        login,
		PasswordHash: passwordHash,
	})
}

func (s *ManagerService) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return ErrInvalidManagerData
	}

	return s.managerRepo.Delete(ctx, id)
}

func (s *ManagerService) Login(ctx context.Context, login, password string) (string, error) {
	login = strings.TrimSpace(login)
	password = strings.TrimSpace(password)
	if login == "" || password == "" {
		return "", ErrInvalidManagerCredentials
	}

	manager, err := s.managerRepo.GetByLogin(ctx, login)
	if err != nil {
		if errors.Is(err, ErrManagerNotFound) {
			return "", ErrInvalidManagerCredentials
		}

		return "", err
	}

	if !checkPassword(password, manager.PasswordHash) {
		return "", ErrInvalidManagerCredentials
	}

	return s.CreateToken(manager.Login)
}

func (s *ManagerService) CreateToken(login string) (string, error) {
	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}
	claims := JWTClaims{
		Sub:  login,
		Role: "manager",
		Exp:  time.Now().Add(managerTokenTTL).Unix(),
	}

	headerBytes, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	claimsBytes, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	firstPart := base64.RawURLEncoding.EncodeToString(headerBytes)
	secondPart := base64.RawURLEncoding.EncodeToString(claimsBytes)
	unsignedToken := firstPart + "." + secondPart
	signature := s.sign(unsignedToken)

	return unsignedToken + "." + signature, nil
}

func (s *ManagerService) ValidateToken(token string) (*JWTClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrInvalidJWTToken
	}

	unsignedToken := parts[0] + "." + parts[1]
	if !hmac.Equal([]byte(parts[2]), []byte(s.sign(unsignedToken))) {
		return nil, ErrInvalidJWTToken
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, ErrInvalidJWTToken
	}

	var claims JWTClaims
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return nil, ErrInvalidJWTToken
	}

	if claims.Role != "manager" || claims.Sub == "" || claims.Exp < time.Now().Unix() {
		return nil, ErrInvalidJWTToken
	}

	return &claims, nil
}

func (s *ManagerService) TokenTTL() time.Duration {
	return managerTokenTTL
}

func (s *ManagerService) sign(value string) string {
	mac := hmac.New(sha256.New, []byte(s.jwtSecret))
	mac.Write([]byte(value))

	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func checkPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
