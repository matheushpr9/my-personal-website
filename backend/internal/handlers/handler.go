package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
)

type Handler struct {
	db     *sql.DB
	secret string
	user   string
	pass   string
}

func New(db *sql.DB) *Handler {
	return &Handler{
		db:     db,
		secret: getenv("JWT_SECRET", "change-me-in-production"),
		user:   getenv("ADMIN_USERNAME", "admin"),
		pass:   getenv("ADMIN_PASSWORD", ""),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
