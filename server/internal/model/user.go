package model

import "time"

type User struct {
	ID         int32
	ExternalID string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
