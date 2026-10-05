package model

import "time"

type Server struct {
	ID          int32
	Name        string
	Description string
	Profile     *Profile
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type Profile struct {
	ID        int32
	Data      string
	Hash      string
	UpdatedAt time.Time
	CreatedAt time.Time
}
