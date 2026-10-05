package repository

import (
	"context"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/queries"
)

type ServerRepository interface {
	GetUserServers(ctx context.Context, uid int32) ([]*model.Server, error)
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
	rows, err := r.q.GetUserServers(ctx)
	if err != nil {
		return nil, err
	}

	servers := make([]*model.Server, 0, len(rows))

	for _, row := range rows {
		server := &model.Server{
			ID:          row.Server.ID,
			Name:        row.Server.Name,
			Description: row.Server.Description.String,
			CreatedAt:   row.Server.CreatedAt.Time,
			UpdatedAt:   row.Server.UpdatedAt.Time,
		}

		if row.Profile.ID.Valid {
			server.Profile = &model.Profile{
				ID:        row.Profile.ID.Int32,
				Data:      row.Profile.ProfileData.String,
				Hash:      row.Profile.ProfileHash.String,
				CreatedAt: row.Profile.CreatedAt.Time,
				UpdatedAt: row.Profile.UpdatedAt.Time,
			}
		}

		servers = append(servers, server)
	}

	return servers, nil
}

// Compile-time check

var _ ServerRepository = (*postgresServerRepository)(nil)
