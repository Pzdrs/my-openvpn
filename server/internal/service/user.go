package service

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/repository"
)

type UserService struct {
	logger         *slog.Logger
	userRepository repository.UserRepository
}

func NewUserService(logger *slog.Logger, userRepository repository.UserRepository) *UserService {
	return &UserService{
		logger:         logger,
		userRepository: userRepository,
	}
}

func (s *UserService) FindOrCreateUser(ctx context.Context, externalID string) (*model.User, error) {
	user, err := s.userRepository.GetByExternalID(ctx, externalID)

	if err == nil {
		s.logger.DebugContext(ctx, "user found", "user_id", user.ID)
		return user, nil
	}

	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	s.logger.DebugContext(ctx, "user not found, creating new user", "external_id", externalID)

	user, err = s.userRepository.Create(ctx, externalID)
	if err != nil {
		return nil, err
	}

	s.logger.DebugContext(ctx, "user created successfully", "user_id", user.ID)
	return user, err
}
