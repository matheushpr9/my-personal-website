package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type StudyLink struct {
	ID          int64  `json:"id"`
	TopicID     int64  `json:"topic_id"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	Description string `json:"description"`
	SortOrder   int64  `json:"sort_order"`
}

type StudyNote struct {
	ID        int64  `json:"id"`
	TopicID   int64  `json:"topic_id"`
	Content   string `json:"content"`
	SortOrder int64  `json:"sort_order"`
}

type StudyTopic struct {
	ID          int64       `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Color       string      `json:"color"`
	SortOrder   int64       `json:"sort_order"`
	Links       []StudyLink `json:"links"`
	Notes       []StudyNote `json:"notes"`
}

// GetStudy returns all topics with their nested links and notes.
func (h *Handler) GetStudy() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		topicRows, err := h.db.Query(
			`SELECT id, name, description, color, sort_order FROM study_topics ORDER BY sort_order, id`)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer topicRows.Close()

		topicMap := map[int64]*StudyTopic{}
		var order []int64
		for topicRows.Next() {
			var t StudyTopic
			if err := topicRows.Scan(&t.ID, &t.Name, &t.Description, &t.Color, &t.SortOrder); err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			t.Links = []StudyLink{}
			t.Notes = []StudyNote{}
			topicMap[t.ID] = &t
			order = append(order, t.ID)
		}
		topicRows.Close()

		linkRows, err := h.db.Query(
			`SELECT id, topic_id, title, url, description, sort_order FROM study_links ORDER BY sort_order, id`)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer linkRows.Close()
		for linkRows.Next() {
			var l StudyLink
			if err := linkRows.Scan(&l.ID, &l.TopicID, &l.Title, &l.URL, &l.Description, &l.SortOrder); err != nil {
				continue
			}
			if t, ok := topicMap[l.TopicID]; ok {
				t.Links = append(t.Links, l)
			}
		}
		linkRows.Close()

		noteRows, err := h.db.Query(
			`SELECT id, topic_id, content, sort_order FROM study_notes ORDER BY sort_order, id`)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer noteRows.Close()
		for noteRows.Next() {
			var n StudyNote
			if err := noteRows.Scan(&n.ID, &n.TopicID, &n.Content, &n.SortOrder); err != nil {
				continue
			}
			if t, ok := topicMap[n.TopicID]; ok {
				t.Notes = append(t.Notes, n)
			}
		}
		noteRows.Close()

		result := make([]StudyTopic, 0, len(order))
		for _, id := range order {
			if t, ok := topicMap[id]; ok {
				result = append(result, *t)
			}
		}
		writeJSON(w, http.StatusOK, result)
	}
}

// --- Topics ---

func (h *Handler) CreateStudyTopic() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Color       string `json:"color"`
			SortOrder   int64  `json:"sort_order"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		if body.Color == "" {
			body.Color = "blue"
		}
		res, err := h.db.Exec(
			`INSERT INTO study_topics (name, description, color, sort_order) VALUES (?,?,?,?)`,
			body.Name, body.Description, body.Color, body.SortOrder)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		id, _ := res.LastInsertId()
		writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
	}
}

func (h *Handler) UpdateStudyTopic() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var body struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Color       string `json:"color"`
			SortOrder   int64  `json:"sort_order"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		if _, err := h.db.Exec(
			`UPDATE study_topics SET name=?, description=?, color=?, sort_order=? WHERE id=?`,
			body.Name, body.Description, body.Color, body.SortOrder, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "updated"})
	}
}

func (h *Handler) DeleteStudyTopic() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		h.db.Exec(`DELETE FROM study_topics WHERE id=?`, id) //nolint:errcheck
		writeJSON(w, http.StatusOK, map[string]string{"ok": "deleted"})
	}
}

// --- Links ---

func (h *Handler) CreateStudyLink() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		topicID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid topic id")
			return
		}
		var body struct {
			Title       string `json:"title"`
			URL         string `json:"url"`
			Description string `json:"description"`
			SortOrder   int64  `json:"sort_order"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		res, err := h.db.Exec(
			`INSERT INTO study_links (topic_id, title, url, description, sort_order) VALUES (?,?,?,?,?)`,
			topicID, body.Title, body.URL, body.Description, body.SortOrder)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		id, _ := res.LastInsertId()
		writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
	}
}

func (h *Handler) UpdateStudyLink() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var body struct {
			Title       string `json:"title"`
			URL         string `json:"url"`
			Description string `json:"description"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		if _, err := h.db.Exec(
			`UPDATE study_links SET title=?, url=?, description=? WHERE id=?`,
			body.Title, body.URL, body.Description, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "updated"})
	}
}

func (h *Handler) DeleteStudyLink() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		h.db.Exec(`DELETE FROM study_links WHERE id=?`, id) //nolint:errcheck
		writeJSON(w, http.StatusOK, map[string]string{"ok": "deleted"})
	}
}

// --- Notes ---

func (h *Handler) CreateStudyNote() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		topicID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid topic id")
			return
		}
		var body struct {
			Content   string `json:"content"`
			SortOrder int64  `json:"sort_order"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		res, err := h.db.Exec(
			`INSERT INTO study_notes (topic_id, content, sort_order) VALUES (?,?,?)`,
			topicID, body.Content, body.SortOrder)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		id, _ := res.LastInsertId()
		writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
	}
}

func (h *Handler) UpdateStudyNote() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var body struct {
			Content string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		if _, err := h.db.Exec(`UPDATE study_notes SET content=? WHERE id=?`, body.Content, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "updated"})
	}
}

func (h *Handler) DeleteStudyNote() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		h.db.Exec(`DELETE FROM study_notes WHERE id=?`, id) //nolint:errcheck
		writeJSON(w, http.StatusOK, map[string]string{"ok": "deleted"})
	}
}
