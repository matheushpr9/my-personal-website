package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) List(res string) http.HandlerFunc {
	def := resourceDefs[res]
	names := colNames(def.Cols)

	orderBy := "id"
	for _, c := range def.Cols {
		if c.Name == "sort_order" {
			orderBy = "sort_order, id"
			break
		}
	}
	query := fmt.Sprintf("SELECT id, %s FROM %s ORDER BY %s",
		strings.Join(names, ", "), def.Table, orderBy)

	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := h.db.Query(query)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		result := []map[string]any{}
		for rows.Next() {
			rawVals := make([]*any, len(def.Cols))
			dest := make([]any, 1+len(def.Cols))
			var id int64
			dest[0] = &id
			for i := range def.Cols {
				var v any
				rawVals[i] = &v
				dest[i+1] = &v
			}
			if err := rows.Scan(dest...); err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			m := map[string]any{"id": id}
			for i, col := range def.Cols {
				m[col.Name] = convertOut(*rawVals[i], col.Kind)
			}
			result = append(result, m)
		}
		writeJSON(w, http.StatusOK, result)
	}
}

func (h *Handler) Create(res string) http.HandlerFunc {
	def := resourceDefs[res]
	names := colNames(def.Cols)
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)",
		def.Table, strings.Join(names, ", "), strings.Join(placeholders(len(def.Cols)), ", "))

	return func(w http.ResponseWriter, r *http.Request) {
		body, err := parseBody(r)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid body")
			return
		}
		vals := make([]any, len(def.Cols))
		for i, col := range def.Cols {
			vals[i] = convertIn(body[col.Name], col.Kind)
		}
		result, err := h.db.Exec(query, vals...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		id, _ := result.LastInsertId()
		writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
	}
}

func (h *Handler) Update(res string) http.HandlerFunc {
	def := resourceDefs[res]
	setClauses := make([]string, len(def.Cols))
	for i, col := range def.Cols {
		setClauses[i] = col.Name + "=?"
	}
	query := fmt.Sprintf("UPDATE %s SET %s WHERE id=?",
		def.Table, strings.Join(setClauses, ", "))

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
		vals := make([]any, len(def.Cols)+1)
		for i, col := range def.Cols {
			vals[i] = convertIn(body[col.Name], col.Kind)
		}
		vals[len(def.Cols)] = id
		if _, err := h.db.Exec(query, vals...); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "updated"})
	}
}

func (h *Handler) Delete(res string) http.HandlerFunc {
	def := resourceDefs[res]
	query := fmt.Sprintf("DELETE FROM %s WHERE id=?", def.Table)

	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		if _, err := h.db.Exec(query, id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"ok": "deleted"})
	}
}
