package problem

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"pycrs.cz/openvpn-client-zone/internal/utils"
)

type ProblemDetails struct {
	Status   int    `json:"status" validate:"required"`
	Title    string `json:"title" validate:"required"`
	Detail   string `json:"detail" validate:"required"`
	Type     string `json:"type" validate:"required"`
	Instance string `json:"instance" validate:"required"`
} //	@name	ProblemDetails

type FieldValidationError struct {
	Type    string `json:"type" validate:"required"`
	Message string `json:"message" validate:"required"`
} //	@name	FieldValidationError

type ValidationProblemDetails struct {
	ProblemDetails
	Errors map[string]FieldValidationError `json:"errors" validate:"required"`
}

type Problem interface {
	GetStatus() int
	GetTitle() string
	GetDetail() string
	GetType() string
	GetInstance() string
}

func (p ProblemDetails) GetStatus() int      { return p.Status }
func (p ProblemDetails) GetTitle() string    { return p.Title }
func (p ProblemDetails) GetDetail() string   { return p.Detail }
func (p ProblemDetails) GetType() string     { return p.Type }
func (p ProblemDetails) GetInstance() string { return p.Instance }

func New(r *http.Request, status int, title, detail, problemType string) ProblemDetails {
	return ProblemDetails{
		Status:   status,
		Title:    title,
		Detail:   detail,
		Type:     wrapType(problemType),
		Instance: r.URL.Path,
	}
}

func NewInternalServerError(r *http.Request, err error) ProblemDetails {
	return New(
		r, http.StatusInternalServerError,
		"Internal Server Error",
		utils.FirstUpper(strings.TrimSpace(err.Error())),
		"internal-server-error",
	)
}

func Write(w http.ResponseWriter, p Problem) error {

	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(p.GetStatus())

	return json.NewEncoder(w).Encode(p)
}

func wrapType(problem string) string {
	return fmt.Sprintf("https://client-zone.pycrs.cz/probs/%s", problem)
}