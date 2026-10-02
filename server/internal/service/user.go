package service

import (
	"context"
	"database/sql"
	"errors"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/repository"
)

type UserService struct {
	userRepository repository.UserRepository
}

func NewUserService(userRepository repository.UserRepository) *UserService {
	return &UserService{
		userRepository: userRepository,
	}
}

func (s *UserService) FindOrCreateUser(ctx context.Context, externalID string) (*model.User, error) {
	user, err := s.userRepository.GetByExternalID(ctx, externalID)

	if err == nil {
		return user, nil
	}

	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	return s.userRepository.Create(ctx, externalID)
}
