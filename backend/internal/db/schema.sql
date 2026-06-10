CREATE TABLE IF NOT EXISTS about (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    bio_pt           TEXT    NOT NULL DEFAULT '',
    bio_en           TEXT    NOT NULL DEFAULT '',
    years_experience TEXT    NOT NULL DEFAULT '',
    location         TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS skills (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    level      INTEGER NOT NULL DEFAULT 0,
    label_pt   TEXT    NOT NULL DEFAULT '',
    label_en   TEXT    NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tools (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experiences (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    period_pt      TEXT    NOT NULL DEFAULT '',
    period_en      TEXT    NOT NULL DEFAULT '',
    title_pt       TEXT    NOT NULL DEFAULT '',
    title_en       TEXT    NOT NULL DEFAULT '',
    company        TEXT    NOT NULL DEFAULT '',
    description_pt TEXT    NOT NULL DEFAULT '',
    description_en TEXT    NOT NULL DEFAULT '',
    tags           TEXT    NOT NULL DEFAULT '[]',
    active         INTEGER NOT NULL DEFAULT 0,
    sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name_pt        TEXT    NOT NULL DEFAULT '',
    name_en        TEXT    NOT NULL DEFAULT '',
    description_pt TEXT    NOT NULL DEFAULT '',
    description_en TEXT    NOT NULL DEFAULT '',
    tags           TEXT    NOT NULL DEFAULT '[]',
    url            TEXT    NOT NULL DEFAULT '',
    sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title_pt    TEXT    NOT NULL DEFAULT '',
    title_en    TEXT    NOT NULL DEFAULT '',
    institution TEXT    NOT NULL DEFAULT '',
    period      TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS books (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL DEFAULT '',
    author              TEXT    NOT NULL DEFAULT '',
    genre_pt            TEXT    NOT NULL DEFAULT '',
    genre_en            TEXT    NOT NULL DEFAULT '',
    type                TEXT    NOT NULL DEFAULT '',
    score               TEXT    NOT NULL DEFAULT '',
    score_num           INTEGER NOT NULL DEFAULT 0,
    short_comment_pt    TEXT    NOT NULL DEFAULT '',
    short_comment_en    TEXT    NOT NULL DEFAULT '',
    full_review_pt      TEXT    NOT NULL DEFAULT '',
    full_review_en      TEXT    NOT NULL DEFAULT '',
    highlights_pt       TEXT    NOT NULL DEFAULT '[]',
    highlights_en       TEXT    NOT NULL DEFAULT '[]',
    cover_path          TEXT    NOT NULL DEFAULT '',
    format              TEXT    NOT NULL DEFAULT 'physical',
    file_path           TEXT    NOT NULL DEFAULT '',
    file_original_name  TEXT    NOT NULL DEFAULT '',
    file_mime_type      TEXT    NOT NULL DEFAULT '',
    reading_page        INTEGER NOT NULL DEFAULT 0,
    reading_total_pages INTEGER NOT NULL DEFAULT 0,
    sort_order          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_collections (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name_pt        TEXT    NOT NULL DEFAULT '',
    name_en        TEXT    NOT NULL DEFAULT '',
    description_pt TEXT    NOT NULL DEFAULT '',
    description_en TEXT    NOT NULL DEFAULT '',
    sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_collection_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL REFERENCES book_collections(id) ON DELETE CASCADE,
    book_id       INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(collection_id, book_id)
);

CREATE TABLE IF NOT EXISTS game_reviews (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT    NOT NULL DEFAULT '',
    type             TEXT    NOT NULL DEFAULT '',
    genre            TEXT    NOT NULL DEFAULT '',
    platform_pt      TEXT    NOT NULL DEFAULT '',
    platform_en      TEXT    NOT NULL DEFAULT '',
    score            TEXT    NOT NULL DEFAULT '',
    score_num        INTEGER NOT NULL DEFAULT 0,
    short_comment_pt TEXT    NOT NULL DEFAULT '',
    short_comment_en TEXT    NOT NULL DEFAULT '',
    full_review_pt   TEXT    NOT NULL DEFAULT '',
    full_review_en   TEXT    NOT NULL DEFAULT '',
    pros_pt          TEXT    NOT NULL DEFAULT '[]',
    pros_en          TEXT    NOT NULL DEFAULT '[]',
    cons_pt          TEXT    NOT NULL DEFAULT '[]',
    cons_en          TEXT    NOT NULL DEFAULT '[]',
    cover_path       TEXT    NOT NULL DEFAULT '',
    sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    content    TEXT    NOT NULL DEFAULT '',
    color      TEXT    NOT NULL DEFAULT 'yellow',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_topics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    color       TEXT    NOT NULL DEFAULT 'blue',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id    INTEGER NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL DEFAULT '',
    url         TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id    INTEGER NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
    content     TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gastronomy (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    cuisine      TEXT    NOT NULL DEFAULT '',
    city         TEXT    NOT NULL DEFAULT '',
    location_url TEXT    NOT NULL DEFAULT '',
    visited      INTEGER NOT NULL DEFAULT 0,
    photo_path   TEXT    NOT NULL DEFAULT '',
    sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS media_backlog (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    genre      TEXT    NOT NULL DEFAULT '',
    type       TEXT    NOT NULL DEFAULT 'movie',
    watched    INTEGER NOT NULL DEFAULT 0,
    liked      INTEGER NOT NULL DEFAULT 0,
    streaming  TEXT    NOT NULL DEFAULT '',
    cover_path TEXT    NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_backlog (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    genre      TEXT    NOT NULL DEFAULT '',
    cover_path TEXT    NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji          TEXT    NOT NULL DEFAULT '',
    name_pt        TEXT    NOT NULL DEFAULT '',
    name_en        TEXT    NOT NULL DEFAULT '',
    detail_pt      TEXT    NOT NULL DEFAULT '',
    detail_en      TEXT    NOT NULL DEFAULT '',
    tag_pt         TEXT    NOT NULL DEFAULT '',
    tag_en         TEXT    NOT NULL DEFAULT '',
    prep_time      TEXT    NOT NULL DEFAULT '',
    servings       TEXT    NOT NULL DEFAULT '',
    difficulty_pt  TEXT    NOT NULL DEFAULT '',
    difficulty_en  TEXT    NOT NULL DEFAULT '',
    ingredients_pt TEXT    NOT NULL DEFAULT '[]',
    ingredients_en TEXT    NOT NULL DEFAULT '[]',
    steps_pt       TEXT    NOT NULL DEFAULT '[]',
    steps_en       TEXT    NOT NULL DEFAULT '[]',
    sort_order     INTEGER NOT NULL DEFAULT 0
);
