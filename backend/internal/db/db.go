package db

import (
	"database/sql"
	_ "embed"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schema string

func Open(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	return db, db.Ping()
}

func Migrate(db *sql.DB) error {
	if _, err := db.Exec(schema); err != nil {
		return err
	}
	// Additive migrations for existing databases — errors are ignored (column may already exist)
	for _, q := range []string{
		`ALTER TABLE books ADD COLUMN cover_path TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE books ADD COLUMN format TEXT NOT NULL DEFAULT 'physical'`,
		`ALTER TABLE books ADD COLUMN file_path TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE books ADD COLUMN file_original_name TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE books ADD COLUMN file_mime_type TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE books ADD COLUMN reading_page INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE books ADD COLUMN reading_total_pages INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE recipes ADD COLUMN photo_path TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE media_backlog ADD COLUMN cover_path TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE media_backlog ADD COLUMN liked INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE media_backlog ADD COLUMN streaming TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE game_reviews ADD COLUMN cover_path TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE game_backlog ADD COLUMN cover_path TEXT NOT NULL DEFAULT ''`,
	} {
		db.Exec(q) //nolint:errcheck
	}
	return nil
}
