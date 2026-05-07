package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"personal-website/backend/internal/db"
	"personal-website/backend/internal/handlers"
)

func main() {
	_ = godotenv.Load()

	database, err := db.Open(getenv("DB_PATH", "data.db"))
	if err != nil {
		log.Fatal("db open:", err)
	}
	defer database.Close()

	if err := db.Migrate(database); err != nil {
		log.Fatal("migrate:", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	h := handlers.New(database)

	r.Post("/api/auth/login", h.Login)

	for _, res := range []string{
		"about", "skills", "tools", "experiences",
		"projects", "education", "books", "game_reviews", "recipes",
	} {
		r.Get("/api/"+res, h.List(res))
		r.With(h.AuthMiddleware).Post("/api/"+res, h.Create(res))
		r.With(h.AuthMiddleware).Put("/api/"+res+"/{id}", h.Update(res))
		r.With(h.AuthMiddleware).Delete("/api/"+res+"/{id}", h.Delete(res))
	}

	port := getenv("PORT", "3000")
	log.Printf("Server on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
