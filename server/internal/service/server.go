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
