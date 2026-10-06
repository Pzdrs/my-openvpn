package dto

type User struct {
	ID      string `json:"id" validate:"required"`
	Email   string `json:"email" validate:"required"`
	Name    string `json:"name" validate:"required"`
	Picture string `json:"picture" validate:"required"`
	IsAdmin bool   `json:"is_admin" validate:"required"`
}
