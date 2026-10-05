package dto

import (
	"time"

	"pycrs.cz/openvpn-client-zone/internal/model"
)

type ServersResponse struct {
	Servers []Server `json:"servers"`
}

type Server struct {
	ID          int32    `json:"id" validate:"required"`
	Name        string   `json:"name" validate:"required"`
	Description string   `json:"description,omitempty"`
	Profile     *Profile `json:"profile,omitempty"`
}

type Profile struct {
	Data      string    `json:"data" validate:"required"`
	Hash      string    `json:"hash" validate:"required"`
	UpdatedAt time.Time `json:"updated_at" validate:"required"`
}

func ServersModelToDTO(servers []model.Server) []Server {
	serversDTO := make([]Server, len(servers))
	for i, s := range servers {
		serversDTO[i] = ServerModelToDTO(&s)
	}
	return serversDTO
}

func ServerModelToDTO(s *model.Server) Server {
	return Server{
		ID:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		Profile: func() *Profile {
			if s.Profile != nil {
				return &Profile{
					Data:      s.Profile.Data,
					Hash:      s.Profile.Hash,
					UpdatedAt: s.Profile.UpdatedAt,
				}
			}
			return nil
		}(),
	}
}

func ProfileModelToDTO(p *model.Profile) Profile {
	return Profile{
		Data:      p.Data,
		Hash:      p.Hash,
		UpdatedAt: p.UpdatedAt,
	}
}
