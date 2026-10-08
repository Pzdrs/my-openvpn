package problem

import (
	"net/http"
	"strings"

	"pycrs.cz/openvpn-client-zone/internal/utils"
)

func NewInternalServerError(r *http.Request, err error) ProblemDetails {
	return New(
		r, http.StatusInternalServerError,
		"Internal Server Error",
		utils.FirstUpper(strings.TrimSpace(err.Error())),
		"internal-server-error",
	)
}

func NewBadRequest(r *http.Request, err error) ProblemDetails {
	return New(
		r, http.StatusBadRequest,
		"Bad Request",
		utils.FirstUpper(strings.TrimSpace(err.Error())),
		"bad-request",
	)
}

func NewNotFound(r *http.Request, err error) ProblemDetails {
	return New(
		r, http.StatusNotFound,
		"Not Found",
		utils.FirstUpper(strings.TrimSpace(err.Error())),
		"not-found",
	)
}

func NewForbidden(r *http.Request, err error) ProblemDetails {
	return New(
		r, http.StatusForbidden,
		"Forbidden",
		utils.FirstUpper(strings.TrimSpace(err.Error())),
		"forbidden",
	)
}
