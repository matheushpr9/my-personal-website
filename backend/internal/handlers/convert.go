package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func colNames(cols []ColDef) []string {
	names := make([]string, len(cols))
	for i, c := range cols {
		names[i] = c.Name
	}
	return names
}

func placeholders(n int) []string {
	p := make([]string, n)
	for i := range p {
		p[i] = "?"
	}
	return p
}

func parseBody(r *http.Request) (map[string]any, error) {
	var m map[string]any
	return m, json.NewDecoder(r.Body).Decode(&m)
}

func convertIn(v any, kind ColKind) any {
	if v == nil {
		switch kind {
		case KindJSONArr:
			return "[]"
		case KindBool, KindInt:
			return 0
		default:
			return ""
		}
	}
	switch kind {
	case KindBool:
		if b, ok := v.(bool); ok && b {
			return 1
		}
		return 0
	case KindInt:
		switch n := v.(type) {
		case float64:
			return int64(n)
		case int64:
			return n
		}
		return 0
	case KindJSONArr:
		b, _ := json.Marshal(v)
		return string(b)
	default:
		if s, ok := v.(string); ok {
			return s
		}
		return fmt.Sprintf("%v", v)
	}
}

func convertOut(v any, kind ColKind) any {
	switch kind {
	case KindBool:
		if n, ok := v.(int64); ok {
			return n != 0
		}
		return false
	case KindJSONArr:
		arr := []string{}
		switch s := v.(type) {
		case string:
			json.Unmarshal([]byte(s), &arr) //nolint:errcheck
		case []byte:
			json.Unmarshal(s, &arr) //nolint:errcheck
		}
		return arr
	case KindInt:
		if n, ok := v.(int64); ok {
			return n
		}
		return 0
	default:
		if s, ok := v.([]byte); ok {
			return string(s)
		}
		if v == nil {
			return ""
		}
		return v
	}
}
