package model

import "time"

type User struct {
	ID         int32  `json:"id"`
	ExternalID string `json:"external_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}