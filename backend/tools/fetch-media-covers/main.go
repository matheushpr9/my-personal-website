package main

// Fetch movie/series poster images from TMDB for all media_backlog items without a cover.
// Usage:
//   go run ./tools/fetch-media-covers/main.go \
//     --db=data.db \
//     --uploads=./uploads \
//     --token=YOUR_TMDB_API_KEY \
//     [--dry-run]
//
// Get a free TMDB API key at: https://www.themoviedb.org/settings/api

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

const (
	tmdbBase   = "https://api.themoviedb.org/3"
	tmdbImages = "https://image.tmdb.org/t/p/w500"
)

type item struct {
	id   int64
	name string
	typ  string // "movie" or "series"
}

type tmdbResult struct {
	PosterPath string `json:"poster_path"`
	Title      string `json:"title"`  // movie
	Name       string `json:"name"`   // tv
}

type tmdbResponse struct {
	Results []tmdbResult `json:"results"`
}

func main() {
	dbPath := flag.String("db", "data.db", "path to SQLite database")
	uploadsDir := flag.String("uploads", "./uploads", "path to uploads directory")
	token := flag.String("token", "", "TMDB API token (required)")
	dryRun := flag.Bool("dry-run", false, "show what would be fetched without saving")
	flag.Parse()

	if *token == "" {
		fmt.Fprintln(os.Stderr, "erro: --token é obrigatório")
		fmt.Fprintln(os.Stderr, "obtenha uma chave gratuita em https://www.themoviedb.org/settings/api")
		os.Exit(1)
	}

	db, err := sql.Open("sqlite", *dbPath)
	if err != nil {
		fatalf("abrir banco: %v", err)
	}
	defer db.Close()

	rows, err := db.Query(`SELECT id, name, type FROM media_backlog WHERE cover_path = '' ORDER BY id`)
	if err != nil {
		fatalf("consultar banco: %v", err)
	}
	var items []item
	for rows.Next() {
		var it item
		if err := rows.Scan(&it.id, &it.name, &it.typ); err != nil {
			fatalf("scan: %v", err)
		}
		items = append(items, it)
	}
	rows.Close()

	if len(items) == 0 {
		fmt.Println("nenhum item sem capa encontrado.")
		return
	}

	fmt.Printf("encontrados %d item(s) sem capa\n\n", len(items))

	coversDir := filepath.Join(*uploadsDir, "media-covers")
	if !*dryRun {
		if err := os.MkdirAll(coversDir, 0755); err != nil {
			fatalf("criar diretório: %v", err)
		}
	}

	client := &http.Client{Timeout: 15 * time.Second}
	ok, skipped, failed := 0, 0, 0

	for _, it := range items {
		posterPath, foundTitle, err := searchTMDB(client, *token, it.name, it.typ)
		if err != nil {
			fmt.Printf("[ERRO] %s (id=%d): busca TMDB falhou: %v\n", it.name, it.id, err)
			failed++
			continue
		}
		if posterPath == "" {
			fmt.Printf("[SKIP] %s (id=%d): nenhum poster encontrado\n", it.name, it.id)
			skipped++
			continue
		}

		imageURL := tmdbImages + posterPath
		fmt.Printf("[OK]   %s → %s (id=%d)\n", it.name, foundTitle, it.id)

		if *dryRun {
			fmt.Printf("       (dry-run) baixaria: %s\n", imageURL)
			ok++
			continue
		}

		safeName := fmt.Sprintf("%d_%s.jpg", it.id, sanitize(it.name))
		relPath := filepath.Join("media-covers", safeName)
		absPath := filepath.Join(*uploadsDir, relPath)

		if err := downloadImage(client, imageURL, absPath); err != nil {
			fmt.Printf("[ERRO] %s (id=%d): download falhou: %v\n", it.name, it.id, err)
			failed++
			continue
		}

		if _, err := db.Exec("UPDATE media_backlog SET cover_path=? WHERE id=?", relPath, it.id); err != nil {
			fmt.Printf("[ERRO] %s (id=%d): atualizar banco falhou: %v\n", it.name, it.id, err)
			os.Remove(absPath)
			failed++
			continue
		}

		ok++
		time.Sleep(250 * time.Millisecond) // be polite to TMDB rate limits
	}

	fmt.Printf("\nresultado: %d capas salvas, %d sem resultado, %d erros\n", ok, skipped, failed)
}

func searchTMDB(client *http.Client, token, name, typ string) (posterPath, title string, err error) {
	endpoint := "/search/movie"
	if typ == "series" {
		endpoint = "/search/tv"
	}

	u := fmt.Sprintf("%s%s?query=%s&language=pt-BR&page=1",
		tmdbBase, endpoint, url.QueryEscape(name))

	req, _ := http.NewRequest("GET", u, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", "", fmt.Errorf("TMDB status %d", resp.StatusCode)
	}

	var result tmdbResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}

	if len(result.Results) == 0 {
		return "", "", nil
	}

	r := result.Results[0]
	foundTitle := r.Title
	if foundTitle == "" {
		foundTitle = r.Name
	}
	return r.PosterPath, foundTitle, nil
}

func downloadImage(client *http.Client, imageURL, destPath string) error {
	resp, err := client.Get(imageURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("download status %d", resp.StatusCode)
	}

	f, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = io.Copy(f, resp.Body)
	return err
}

func sanitize(s string) string {
	return strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '_'
	}, s)
}

func fatalf(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "erro: "+format+"\n", args...)
	os.Exit(1)
}
