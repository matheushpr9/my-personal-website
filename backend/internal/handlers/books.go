package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
"path/filepath"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

// ListBooks returns all books including file and progress fields not in the generic resource def.
func (h *Handler) ListBooks() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := h.db.Query(`
			SELECT id, title, author, genre_pt, genre_en, type, score, score_num,
			       short_comment_pt, short_comment_en, full_review_pt, full_review_en,
			       highlights_pt, highlights_en, cover_path, format,
			       file_path, file_original_name, file_mime_type,
			       reading_page, reading_total_pages, sort_order
			FROM books ORDER BY sort_order, id`)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		result := []map[string]any{}
		for rows.Next() {
			var (
				id, scoreNum, readingPage, readingTotalPages, sortOrder int64
				title, author, genrePt, genreEn, typ, score            string
				shortCommentPt, shortCommentEn                         string
				fullReviewPt, fullReviewEn                             string
				highlightsPtRaw, highlightsEnRaw                       string
				coverPath, format, filePath, fileOriginalName, fileMimeType string
			)
			if err := rows.Scan(
				&id, &title, &author, &genrePt, &genreEn, &typ, &score, &scoreNum,
				&shortCommentPt, &shortCommentEn, &fullReviewPt, &fullReviewEn,
				&highlightsPtRaw, &highlightsEnRaw, &coverPath, &format,
				&filePath, &fileOriginalName, &fileMimeType,
				&readingPage, &readingTotalPages, &sortOrder,
			); err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}

			var hPt, hEn []string
			json.Unmarshal([]byte(highlightsPtRaw), &hPt) //nolint:errcheck
			json.Unmarshal([]byte(highlightsEnRaw), &hEn) //nolint:errcheck
			if hPt == nil {
				hPt = []string{}
			}
			if hEn == nil {
				hEn = []string{}
			}
			if format == "" {
				format = "physical"
			}

			result = append(result, map[string]any{
				"id":                  id,
				"title":               title,
				"author":              author,
				"genre_pt":            genrePt,
				"genre_en":            genreEn,
				"type":                typ,
				"score":               score,
				"score_num":           scoreNum,
				"short_comment_pt":    shortCommentPt,
				"short_comment_en":    shortCommentEn,
				"full_review_pt":      fullReviewPt,
				"full_review_en":      fullReviewEn,
				"highlights_pt":       hPt,
				"highlights_en":       hEn,
				"cover_path":          coverPath,
				"format":              format,
				"file_path":           filePath,
				"file_original_name":  fileOriginalName,
				"file_mime_type":      fileMimeType,
				"reading_page":        readingPage,
				"reading_total_pages": readingTotalPages,
				"sort_order":          sortOrder,
			})
		}
		writeJSON(w, http.StatusOK, result)
	}
}

// UploadBookFile handles multipart file upload for a digital book (admin only).
func (h *Handler) UploadBookFile() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}

		if err := r.ParseMultipartForm(150 << 20); err != nil {
			writeError(w, http.StatusBadRequest, "file too large or invalid form")
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, http.StatusBadRequest, "file field required")
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		mimeByExt := map[string]string{
			".pdf":  "application/pdf",
			".epub": "application/epub+zip",
		}
		mimeType, ok := mimeByExt[ext]
		if !ok {
			writeError(w, http.StatusBadRequest, "only pdf and epub are allowed")
			return
		}

		uploadsDir := getenv("UPLOADS_DIR", "./uploads")
		booksDir := filepath.Join(uploadsDir, "books")
		if err := os.MkdirAll(booksDir, 0755); err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}

		// Remove old file
		var oldPath string
		h.db.QueryRow("SELECT file_path FROM books WHERE id=?", id).Scan(&oldPath) //nolint:errcheck
		if oldPath != "" {
			os.Remove(filepath.Join(uploadsDir, oldPath)) //nolint:errcheck
		}

		safeName := fmt.Sprintf("%d_%s", id, sanitizeFilename(header.Filename))
		relPath := filepath.Join("books", safeName)
		absPath := filepath.Join(uploadsDir, relPath)

		dst, err := os.Create(absPath)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			writeError(w, http.StatusInternalServerError, "write error")
			return
		}

		if _, err := h.db.Exec(
			"UPDATE books SET file_path=?, file_original_name=?, file_mime_type=? WHERE id=?",
			relPath, header.Filename, mimeType, id,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"ok": "uploaded"})
	}
}

// DownloadBookFile serves the uploaded book file. Add ?download=true for attachment disposition.
func (h *Handler) DownloadBookFile() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}

		var filePath, originalName, mimeType string
		err = h.db.QueryRow(
			"SELECT file_path, file_original_name, file_mime_type FROM books WHERE id=?", id,
		).Scan(&filePath, &originalName, &mimeType)
		if err != nil || filePath == "" {
			writeError(w, http.StatusNotFound, "no file uploaded for this book")
			return
		}

		uploadsDir := getenv("UPLOADS_DIR", "./uploads")

		absPath := filepath.Clean(filepath.Join(uploadsDir, filePath))
		cleanBase := filepath.Clean(uploadsDir) + string(os.PathSeparator)
		if !strings.HasPrefix(absPath, cleanBase) {
			writeError(w, http.StatusForbidden, "invalid path")
			return
		}

		f, err := os.Open(absPath)
		if err != nil {
			writeError(w, http.StatusNotFound, "file not found on disk")
			return
		}
		defer f.Close()

		info, err := f.Stat()
		if err != nil {
			writeError(w, http.StatusInternalServerError, "stat error")
			return
		}

		w.Header().Set("Content-Type", mimeType)
		if r.URL.Query().Get("download") == "true" {
			w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, originalName))
		} else {
			w.Header().Set("Content-Disposition", "inline")
		}
		http.ServeContent(w, r, originalName, info.ModTime(), f)
	}
}

// UpdateBookProgress saves reading progress for a book (public — personal site, owner reads).
func (h *Handler) UpdateBookProgress() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}

		var body struct {
			Page       int64 `json:"page"`
			TotalPages int64 `json:"total_pages"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}

		if _, err := h.db.Exec(
			"UPDATE books SET reading_page=?, reading_total_pages=? WHERE id=?",
			body.Page, body.TotalPages, id,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"ok": "progress updated"})
	}
}

// UploadBookCover handles cover image upload (JPG, PNG, WebP). Admin only.
func (h *Handler) UploadBookCover() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}

		if err := r.ParseMultipartForm(20 << 20); err != nil {
			writeError(w, http.StatusBadRequest, "file too large (max 20MB)")
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, http.StatusBadRequest, "file field required")
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
		if !allowedExts[ext] {
			writeError(w, http.StatusBadRequest, "only jpg, png, webp are allowed")
			return
		}

		uploadsDir := getenv("UPLOADS_DIR", "./uploads")
		coversDir := filepath.Join(uploadsDir, "covers")
		if err := os.MkdirAll(coversDir, 0755); err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}

		var oldPath string
		h.db.QueryRow("SELECT cover_path FROM books WHERE id=?", id).Scan(&oldPath) //nolint:errcheck
		if oldPath != "" {
			os.Remove(filepath.Join(uploadsDir, oldPath)) //nolint:errcheck
		}

		safeName := fmt.Sprintf("%d_%s", id, sanitizeFilename(header.Filename))
		relPath := filepath.Join("covers", safeName)
		absPath := filepath.Join(uploadsDir, relPath)

		dst, err := os.Create(absPath)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			writeError(w, http.StatusInternalServerError, "write error")
			return
		}

		if _, err := h.db.Exec("UPDATE books SET cover_path=? WHERE id=?", relPath, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"ok": "cover uploaded"})
	}
}

// ServeBookCover serves the cover image inline (public).
func (h *Handler) ServeBookCover() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		var coverPath string
		if err := h.db.QueryRow("SELECT cover_path FROM books WHERE id=?", id).Scan(&coverPath); err != nil || coverPath == "" {
			http.NotFound(w, r)
			return
		}

		uploadsDir := getenv("UPLOADS_DIR", "./uploads")
		absPath := filepath.Clean(filepath.Join(uploadsDir, coverPath))
		if !strings.HasPrefix(absPath, filepath.Clean(uploadsDir)+string(os.PathSeparator)) {
			http.NotFound(w, r)
			return
		}

		ext := strings.ToLower(filepath.Ext(coverPath))
		mimes := map[string]string{".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
		mimeType := mimes[ext]
		if mimeType == "" {
			mimeType = "image/jpeg"
		}

		f, err := os.Open(absPath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer f.Close()

		info, _ := f.Stat()
		w.Header().Set("Content-Type", mimeType)
		w.Header().Set("Cache-Control", "public, max-age=86400")
		http.ServeContent(w, r, coverPath, info.ModTime(), f)
	}
}

// --- Collections ---

type collectionItem struct {
	ID            int64  `json:"id"`
	NamePt        string `json:"name_pt"`
	NameEn        string `json:"name_en"`
	DescriptionPt string `json:"description_pt"`
	DescriptionEn string `json:"description_en"`
	SortOrder     int64  `json:"sort_order"`
	Books         []map[string]any `json:"books"`
}

func (h *Handler) ListCollections() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := h.db.Query(
			`SELECT id, name_pt, name_en, description_pt, description_en, sort_order
			 FROM book_collections ORDER BY sort_order, id`)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		var collections []collectionItem
		for rows.Next() {
			var c collectionItem
			if err := rows.Scan(&c.ID, &c.NamePt, &c.NameEn, &c.DescriptionPt, &c.DescriptionEn, &c.SortOrder); err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			c.Books = []map[string]any{}
			collections = append(collections, c)
		}
		rows.Close()

		for i, c := range collections {
			bRows, err := h.db.Query(`
				SELECT b.id, b.title, b.author, b.format, b.score, b.score_num,
				       b.reading_page, b.reading_total_pages, b.file_original_name, b.file_mime_type
				FROM books b
				JOIN book_collection_items bci ON b.id = bci.book_id
				WHERE bci.collection_id = ?
				ORDER BY bci.sort_order, bci.id`, c.ID)
			if err != nil {
				continue
			}
			for bRows.Next() {
				var (
					bid, scoreNum, readPage, totalPages int64
					title, author, format, score        string
					fileName, fileMime                  string
				)
				bRows.Scan(&bid, &title, &author, &format, &score, &scoreNum, &readPage, &totalPages, &fileName, &fileMime) //nolint:errcheck
				collections[i].Books = append(collections[i].Books, map[string]any{
					"id":                  bid,
					"title":               title,
					"author":              author,
					"format":              format,
					"score":               score,
					"score_num":           scoreNum,
					"reading_page":        readPage,
					"reading_total_pages": totalPages,
					"file_original_name":  fileName,
					"file_mime_type":      fileMime,
				})
			}
			bRows.Close()
		}

		if collections == nil {
			collections = []collectionItem{}
		}
		writeJSON(w, http.StatusOK, collections)
	}
}

func (h *Handler) CreateCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := parseBody(r)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		res, err := h.db.Exec(
			`INSERT INTO book_collections (name_pt, name_en, description_pt, description_en, sort_order) VALUES (?,?,?,?,?)`,
			strVal(body["name_pt"]), strVal(body["name_en"]),
			strVal(body["description_pt"]), strVal(body["description_en"]),
			intVal(body["sort_order"]),
		)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		id, _ := res.LastInsertId()
		writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
	}
}

func (h *Handler) UpdateCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		body, err := parseBody(r)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		if _, err := h.db.Exec(
			`UPDATE book_collections SET name_pt=?, name_en=?, description_pt=?, description_en=?, sort_order=? WHERE id=?`,
			strVal(body["name_pt"]), strVal(body["name_en"]),
			strVal(body["description_pt"]), strVal(body["description_en"]),
			intVal(body["sort_order"]), id,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "updated"})
	}
}

func (h *Handler) DeleteCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		h.db.Exec("DELETE FROM book_collections WHERE id=?", id) //nolint:errcheck
		writeJSON(w, http.StatusOK, map[string]string{"ok": "deleted"})
	}
}

func (h *Handler) AddBookToCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		collID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		body, err := parseBody(r)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		bookID := intVal(body["book_id"])
		sortOrder := intVal(body["sort_order"])
		if _, err := h.db.Exec(
			`INSERT OR REPLACE INTO book_collection_items (collection_id, book_id, sort_order) VALUES (?,?,?)`,
			collID, bookID, sortOrder,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "added"})
	}
}

func (h *Handler) RemoveBookFromCollection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		collID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		bookID, err := strconv.ParseInt(chi.URLParam(r, "bookId"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid bookId")
			return
		}
		h.db.Exec("DELETE FROM book_collection_items WHERE collection_id=? AND book_id=?", collID, bookID) //nolint:errcheck
		writeJSON(w, http.StatusOK, map[string]string{"ok": "removed"})
	}
}


// --- helpers ---

func strVal(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func intVal(v any) int64 {
	if n, ok := v.(float64); ok {
		return int64(n)
	}
	return 0
}

// uploadTableImage is a generic image upload handler for any table and column.
func (h *Handler) uploadTableImage(table, subdir, col string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		if err := r.ParseMultipartForm(20 << 20); err != nil {
			writeError(w, http.StatusBadRequest, "file too large (max 20MB)")
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, http.StatusBadRequest, "file field required")
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}[ext] {
			writeError(w, http.StatusBadRequest, "only jpg, png, webp are allowed")
			return
		}

		uploadsDir := getenv("UPLOADS_DIR", "./uploads")
		dir := filepath.Join(uploadsDir, subdir)
		if err := os.MkdirAll(dir, 0755); err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}

		var oldPath string
		h.db.QueryRow("SELECT "+col+" FROM "+table+" WHERE id=?", id).Scan(&oldPath) //nolint:errcheck
		if oldPath != "" {
			os.Remove(filepath.Join(uploadsDir, oldPath)) //nolint:errcheck
		}

		safeName := fmt.Sprintf("%d_%s", id, sanitizeFilename(header.Filename))
		relPath := filepath.Join(subdir, safeName)
		absPath := filepath.Join(uploadsDir, relPath)

		dst, err := os.Create(absPath)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "storage error")
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			writeError(w, http.StatusInternalServerError, "write error")
			return
		}

		if _, err := h.db.Exec("UPDATE "+table+" SET "+col+"=? WHERE id=?", relPath, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "uploaded"})
	}
}

// serveTableImage is a generic image serve handler for any table and column.
func (h *Handler) serveTableImage(table, col string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		var imgPath string
		if err := h.db.QueryRow("SELECT "+col+" FROM "+table+" WHERE id=?", id).Scan(&imgPath); err != nil || imgPath == "" {
			http.NotFound(w, r)
			return
		}
		uploadsDir := getenv("UPLOADS_DIR", "./uploads")
		absPath := filepath.Clean(filepath.Join(uploadsDir, imgPath))
		if !strings.HasPrefix(absPath, filepath.Clean(uploadsDir)+string(os.PathSeparator)) {
			http.NotFound(w, r)
			return
		}
		ext := strings.ToLower(filepath.Ext(imgPath))
		mimes := map[string]string{".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
		mimeType := mimes[ext]
		if mimeType == "" {
			mimeType = "image/jpeg"
		}
		f, err := os.Open(absPath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer f.Close()
		info, _ := f.Stat()
		w.Header().Set("Content-Type", mimeType)
		w.Header().Set("Cache-Control", "public, max-age=86400")
		http.ServeContent(w, r, imgPath, info.ModTime(), f)
	}
}

func (h *Handler) uploadTablePhoto(table, subdir string) http.HandlerFunc {
	return h.uploadTableImage(table, subdir, "photo_path")
}

func (h *Handler) serveTablePhoto(table string) http.HandlerFunc {
	return h.serveTableImage(table, "photo_path")
}

func (h *Handler) UploadGastronomyPhoto() http.HandlerFunc {
	return h.uploadTablePhoto("gastronomy", "gastro-photos")
}

func (h *Handler) ServeGastronomyPhoto() http.HandlerFunc {
	return h.serveTablePhoto("gastronomy")
}

func (h *Handler) UploadRecipePhoto() http.HandlerFunc {
	return h.uploadTablePhoto("recipes", "recipe-photos")
}

func (h *Handler) ServeRecipePhoto() http.HandlerFunc {
	return h.serveTablePhoto("recipes")
}

func (h *Handler) UploadMediaCover() http.HandlerFunc {
	return h.uploadTableImage("media_backlog", "media-covers", "cover_path")
}

func (h *Handler) ServeMediaCover() http.HandlerFunc {
	return h.serveTableImage("media_backlog", "cover_path")
}

func (h *Handler) UploadGameReviewCover() http.HandlerFunc {
	return h.uploadTableImage("game_reviews", "game-covers", "cover_path")
}

func (h *Handler) ServeGameReviewCover() http.HandlerFunc {
	return h.serveTableImage("game_reviews", "cover_path")
}

func (h *Handler) UploadGameBacklogCover() http.HandlerFunc {
	return h.uploadTableImage("game_backlog", "game-covers", "cover_path")
}

func (h *Handler) ServeGameBacklogCover() http.HandlerFunc {
	return h.serveTableImage("game_backlog", "cover_path")
}

func sanitizeFilename(name string) string {
	return strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' || r == '.' {
			return r
		}
		return '_'
	}, name)
}

