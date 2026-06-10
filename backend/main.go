package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

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

	uploadsDir := getenv("UPLOADS_DIR", "./uploads")
	if err := os.MkdirAll(filepath.Join(uploadsDir, "books"), 0755); err != nil {
		log.Printf("Warning: could not create uploads dir: %v", err)
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

	// Generic resources
	for _, res := range []string{
		"about", "skills", "tools", "experiences",
		"projects", "education", "game_reviews", "recipes", "notes",
		"media_backlog", "game_backlog", "gastronomy",
	} {
		r.Get("/api/"+res, h.List(res))
		r.With(h.AuthMiddleware).Post("/api/"+res, h.Create(res))
		r.With(h.AuthMiddleware).Put("/api/"+res+"/{id}", h.Update(res))
		r.With(h.AuthMiddleware).Delete("/api/"+res+"/{id}", h.Delete(res))
	}

	// Books — custom list + generic create/update/delete + file/progress endpoints
	r.Get("/api/books", h.ListBooks())
	r.With(h.AuthMiddleware).Post("/api/books", h.Create("books"))
	r.With(h.AuthMiddleware).Put("/api/books/{id}", h.Update("books"))
	r.With(h.AuthMiddleware).Delete("/api/books/{id}", h.Delete("books"))
	r.With(h.AuthMiddleware).Post("/api/books/{id}/file", h.UploadBookFile())
	r.Get("/api/books/{id}/file", h.DownloadBookFile())
	r.With(h.AuthMiddleware).Post("/api/books/{id}/cover", h.UploadBookCover())
	r.Get("/api/books/{id}/cover", h.ServeBookCover())
	r.Put("/api/books/{id}/progress", h.UpdateBookProgress())

	// Study
	r.Get("/api/study", h.GetStudy())
	r.With(h.AuthMiddleware).Post("/api/study/topics", h.CreateStudyTopic())
	r.With(h.AuthMiddleware).Put("/api/study/topics/{id}", h.UpdateStudyTopic())
	r.With(h.AuthMiddleware).Delete("/api/study/topics/{id}", h.DeleteStudyTopic())
	r.With(h.AuthMiddleware).Post("/api/study/topics/{id}/links", h.CreateStudyLink())
	r.With(h.AuthMiddleware).Put("/api/study/links/{id}", h.UpdateStudyLink())
	r.With(h.AuthMiddleware).Delete("/api/study/links/{id}", h.DeleteStudyLink())
	r.With(h.AuthMiddleware).Post("/api/study/topics/{id}/notes", h.CreateStudyNote())
	r.With(h.AuthMiddleware).Put("/api/study/notes/{id}", h.UpdateStudyNote())
	r.With(h.AuthMiddleware).Delete("/api/study/notes/{id}", h.DeleteStudyNote())

	// Recipe photos
	r.With(h.AuthMiddleware).Post("/api/recipes/{id}/photo", h.UploadRecipePhoto())
	r.Get("/api/recipes/{id}/photo", h.ServeRecipePhoto())

	// Gastronomy photos
	r.With(h.AuthMiddleware).Post("/api/gastronomy/{id}/photo", h.UploadGastronomyPhoto())
	r.Get("/api/gastronomy/{id}/photo", h.ServeGastronomyPhoto())

	// Media backlog covers
	r.With(h.AuthMiddleware).Post("/api/media_backlog/{id}/cover", h.UploadMediaCover())
	r.Get("/api/media_backlog/{id}/cover", h.ServeMediaCover())

	// Game covers
	r.With(h.AuthMiddleware).Post("/api/game_reviews/{id}/cover", h.UploadGameReviewCover())
	r.Get("/api/game_reviews/{id}/cover", h.ServeGameReviewCover())
	r.With(h.AuthMiddleware).Post("/api/game_backlog/{id}/cover", h.UploadGameBacklogCover())
	r.Get("/api/game_backlog/{id}/cover", h.ServeGameBacklogCover())

	// Book collections
	r.Get("/api/book-collections", h.ListCollections())
	r.With(h.AuthMiddleware).Post("/api/book-collections", h.CreateCollection())
	r.With(h.AuthMiddleware).Put("/api/book-collections/{id}", h.UpdateCollection())
	r.With(h.AuthMiddleware).Delete("/api/book-collections/{id}", h.DeleteCollection())
	r.With(h.AuthMiddleware).Post("/api/book-collections/{id}/books", h.AddBookToCollection())
	r.With(h.AuthMiddleware).Delete("/api/book-collections/{id}/books/{bookId}", h.RemoveBookFromCollection())

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
