package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"unicode"
)

func FirstUpper(s string) string {
	if s == "" {
		return ""
	}
	runes := []rune(s) // convert string to runes
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}

func Decode[T any](r *http.Request) (T, error) {
	var v T
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		return v, fmt.Errorf("decode json: %w", err)
	}
	return v, nil
}
