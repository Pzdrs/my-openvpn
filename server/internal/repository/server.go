package repository

import (
	"context"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/queries"
)

type ServerRepository interface {
	GetUserServers(ctx context.Context, uid int32) ([]*model.Server, error)
	GetServerProfile(ctx context.Context, serverID int32) (*model.Profile, error)
}

type postgresServerRepository struct {
	q *queries.Queries
}

func NewServerRepository(q *queries.Queries) ServerRepository {
	return &postgresServerRepository{
		q: q,
	}
}

func (r *postgresServerRepository) GetUserServers(ctx context.Context, uid int32) ([]*model.Server, error) {
	rows, err := r.q.GerUserServers(ctx)
	if err != nil {
		return nil, err
	}

	servers := make([]*model.Server, 0, len(rows))

	for _, row := range rows {
		server := &model.Server{
			ID:          row.ID,
			Name:        row.Name,
			Description: row.Description.String,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
		}

		if row.ProfileID.Valid {
			server.Profile = &model.Profile{
				ID:        row.ProfileID.Int32,
				Data:      row.ProfileData.String,
				Hash:      row.ProfileHash.String,
				CreatedAt: row.ProfileCreatedAt.Time,
				UpdatedAt: row.ProfileUpdatedAt.Time,
			}
		}

		servers = append(servers, server)
	}

	return servers, nil
}

func (r *postgresServerRepository) GetServerProfile(ctx context.Context, serverID int32) (*model.Profile, error) {
	row, err := r.q.GetServerProfile(ctx, serverID)
	if err != nil {
		return nil, err
	}

	return &model.Profile{
		ID:        row.ID,
		Data:      row.ProfileData,
		Hash:      row.ProfileHash,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
	}, nil
}

// Compile-time check

var _ ServerRepository = (*postgresServerRepository)(nil)
