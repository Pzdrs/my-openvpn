package repository

import (
	"context"
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/queries"
)

type ServerRepository interface {
	GetUserServers(ctx context.Context, uid int32) ([]*model.Server, error)
	GetServerProfile(ctx context.Context, serverID int32) (*model.Profile, error)
	GetLastProfileDownload(ctx context.Context, userId int32, serverID int32) (model.LastProfileDownload, error)
	UpsertServerProfile(ctx context.Context, serverID int32, profile_data string) (model.Profile, error)
	UpsertLastProfileDownload(ctx context.Context, userId int32, serverID int32, hash string) error
	DeleteServerProfiles(ctx context.Context, serverID int32) error
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

func (r *postgresServerRepository) GetLastProfileDownload(ctx context.Context, userID int32, serverID int32) (model.LastProfileDownload, error) {
	row, err := r.q.GetLastProfileDownload(ctx, queries.GetLastProfileDownloadParams{
		UserID:   userID,
		ServerID: serverID,
	})
	if err != nil {
		return model.LastProfileDownload{}, err
	}

	return model.LastProfileDownload{
		UserID:                row.UserID,
		ServerID:              row.ServerID,
		DownloadedProfileHash: row.DownloadedProfileHash,
		LastDownloadedAt:      row.LastDownloadedAt.Time,
	}, nil
}

func (r *postgresServerRepository) UpsertServerProfile(ctx context.Context, serverID int32, profile_data string) (model.Profile, error) {
	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(profile_data)))
	profile, err := r.q.UpsertServerProfile(ctx, queries.UpsertServerProfileParams{
		ServerID:    serverID,
		ProfileData: profile_data,
		ProfileHash: hash,
	})

	if err != nil {
		return model.Profile{}, err
	}

	return mapProfileToModel(profile), nil
}

func (r *postgresServerRepository) UpsertLastProfileDownload(ctx context.Context, userId int32, serverID int32, hash string) error {
	return r.q.UpsertLastDownload(ctx, queries.UpsertLastDownloadParams{
		UserID:   userId,
		ServerID: serverID,
		LastDownloadedAt: pgtype.Timestamptz{
			Valid: true,
			Time:  time.Now(),
		},
		DownloadedProfileHash: hash,
	})
}

func (r *postgresServerRepository) DeleteServerProfiles(ctx context.Context, serverID int32) error {
	return r.q.DeleteServerProfiles(ctx, serverID)
}

func mapProfileToModel(p queries.Profile) model.Profile {
	return model.Profile{
		ID:        p.ID,
		Data:      p.ProfileData,
		Hash:      p.ProfileHash,
		CreatedAt: p.CreatedAt.Time,
		UpdatedAt: p.UpdatedAt.Time,
	}
}

// Compile-time check

var _ ServerRepository = (*postgresServerRepository)(nil)
