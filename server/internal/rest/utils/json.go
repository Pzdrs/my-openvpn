package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"pycrs.cz/openvpn-client-zone/internal/rest/problem"
)

func validationErrorsToMap(ve validator.ValidationErrors) map[string]problem.FieldValidationError {
	errors := make(map[string]problem.FieldValidationError)
	for _, fe := range ve {
		field := strings.ToLower(fe.Field()) // normalize field name
		errors[field] = problem.FieldValidationError{
			Message: fmt.Sprintf("failed validation on '%s'", fe.Tag()),
			Type:    fe.Tag(),
		}
	}
	return errors
}

func DecodeValidate[T any](w http.ResponseWriter, r *http.Request) (T, bool) {
	var v T

	// Decode JSON
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&v); err != nil {
		problem.Write(w, problem.New(
			r, http.StatusBadRequest,
			"Invalid JSON",
			"Request body contains invalid JSON",
			"invalid-json",
		))
		return v, false
	}

	// Validate struct
	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(v); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			errMap := validationErrorsToMap(ve)

			problem.Write(w, problem.ValidationProblemDetails{
				ProblemDetails: problem.New(
					r, http.StatusBadRequest,
					"Validation Error",
					"One or more fields are invalid",
					"validation-error",
				),
				Errors: errMap,
			})
		}
		return v, false
	}

	return v, true
}

func Encode[T any](w http.ResponseWriter, r *http.Request, status int, v T) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		return fmt.Errorf("encode json: %w", err)
	}
	return nil
}
