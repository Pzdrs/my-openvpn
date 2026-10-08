package service

import (
	"context"

	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/repository"
)

type ServerService struct {
	r repository.ServerRepository
}

func NewServerService(r repository.ServerRepository) *ServerService {
	return &ServerService{
		r: r,
	}
}

func (s *ServerService) GetUserServers(ctx context.Context, userId int32) ([]*model.Server, error) {
	servers, err := s.r.GetUserServers(ctx, userId)
	return servers, err
}

func (s *ServerService) GetServerProfile(ctx context.Context, serverID int32) (*model.Profile, error) {
	profile, err := s.r.GetServerProfile(ctx, serverID)
	return profile, err
}

func (s *ServerService) UpdateServerProfile(ctx context.Context, serverID int32, profile_data string) (model.Profile, error) {
	profile, err := s.r.UpsertServerProfile(ctx, serverID, profile_data)
	if err != nil {
		return model.Profile{}, err
	}
	return profile, nil
}

func (s *ServerService) RecordProfileDownload(ctx context.Context, userId int32, serverID int32, hash string) error {
	return s.r.UpsertLastProfileDownload(ctx, userId, serverID, hash)
}

func (s *ServerService) GetLastProfileDownload(ctx context.Context, userId int32, serverID int32) (model.LastProfileDownload, error) {
	return s.r.GetLastProfileDownload(ctx, userId, serverID)
}

func (s *ServerService) DeleteServerProfiles(ctx context.Context, serverID int32) error {
	return s.r.DeleteServerProfiles(ctx, serverID)
}
