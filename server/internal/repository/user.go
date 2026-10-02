package repository

import (
	"context"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/queries"
)

type UserRepository interface {
	GetByExternalID(ctx context.Context, externalID string) (*model.User, error)
	Create(ctx context.Context, externalID string) (*model.User, error)
}

type postgresUserRepository struct {
	q *queries.Queries
}

func NewUserRepository(q *queries.Queries) UserRepository {
	return &postgresUserRepository{q: q}
}

func (r *postgresUserRepository) GetByExternalID(ctx context.Context, externalID string) (*model.User, error) {
	user, err := r.q.GetUserByExternalID(ctx, externalID)
	if err != nil {
		return nil, err
	}

	return mapUserToModel(user), nil
}

func (r *postgresUserRepository) Create(ctx context.Context, externalID string) (*model.User, error) {
	user, err := r.q.CreateUser(ctx, externalID)
	if err != nil {
		return nil, err
	}

	return mapUserToModel(user), nil
}

func mapUserToModel(u queries.User) *model.User {
	return &model.User{
		ID:         u.ID,
		ExternalID: u.ExternalID,
		CreatedAt:  u.CreatedAt.Time,
		UpdatedAt:  u.UpdatedAt.Time,
	}
}

// Compile-time check
var _ UserRepository = (*postgresUserRepository)(nil)