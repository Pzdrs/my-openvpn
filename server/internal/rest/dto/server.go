package dto

import (
	"encoding/base64"
	"time"

	"pycrs.cz/openvpn-client-zone/internal/model"
)

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

type CreateServerRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description,omitempty"`
}

type UpdateProfileRequest struct {
	ProfileData string `json:"profile_data" validate:"required"`
}

type LastProfileDownloadResponse struct {
	Exists             bool       `json:"exists" validate:"required"`
	LastDownloadedAt   *time.Time `json:"last_downloaded_at,omitempty"`
	LastDownloadedHash *string    `json:"last_downloaded_hash,omitempty"`
}

func ServersModelToDTO(servers []model.Server) []Server {
	serversDTO := make([]Server, len(servers))
	for i, s := range servers {
		serversDTO[i] = ServerModelToDTO(s)
	}
	return serversDTO
}

func ServerModelToDTO(s model.Server) Server {
	var profileDTO *Profile
	if s.Profile != nil {
		dto := ProfileModelToDTO(*s.Profile)
		profileDTO = &dto
	}

	return Server{
		ID:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		Profile:     profileDTO,
	}
}

func ProfileModelToDTO(p model.Profile) Profile {
	return Profile{
		Data:      base64.StdEncoding.EncodeToString([]byte(p.Data)),
		Hash:      p.Hash,
		UpdatedAt: p.UpdatedAt,
	}
}
