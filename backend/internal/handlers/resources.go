package handlers

type ColKind int

const (
	KindText     ColKind = iota
	KindInt
	KindBool
	KindJSONArr
	KindReadOnly // returned in list, ignored in create/update (managed by dedicated endpoints)
)

type ColDef struct {
	Name string
	Kind ColKind
}

type ResDef struct {
	Table string
	Cols  []ColDef
}

var resourceDefs = map[string]ResDef{
	"about": {Table: "about", Cols: []ColDef{
		{Name: "bio_pt"},
		{Name: "bio_en"},
		{Name: "years_experience"},
		{Name: "location"},
	}},
	"skills": {Table: "skills", Cols: []ColDef{
		{Name: "name"},
		{Name: "level", Kind: KindInt},
		{Name: "label_pt"},
		{Name: "label_en"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"tools": {Table: "tools", Cols: []ColDef{
		{Name: "name"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"experiences": {Table: "experiences", Cols: []ColDef{
		{Name: "period_pt"},
		{Name: "period_en"},
		{Name: "title_pt"},
		{Name: "title_en"},
		{Name: "company"},
		{Name: "description_pt"},
		{Name: "description_en"},
		{Name: "tags", Kind: KindJSONArr},
		{Name: "active", Kind: KindBool},
		{Name: "sort_order", Kind: KindInt},
	}},
	"projects": {Table: "projects", Cols: []ColDef{
		{Name: "name_pt"},
		{Name: "name_en"},
		{Name: "description_pt"},
		{Name: "description_en"},
		{Name: "tags", Kind: KindJSONArr},
		{Name: "url"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"education": {Table: "education", Cols: []ColDef{
		{Name: "title_pt"},
		{Name: "title_en"},
		{Name: "institution"},
		{Name: "period"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"books": {Table: "books", Cols: []ColDef{
		{Name: "title"},
		{Name: "author"},
		{Name: "genre_pt"},
		{Name: "genre_en"},
		{Name: "type"},
		{Name: "score"},
		{Name: "score_num", Kind: KindInt},
		{Name: "short_comment_pt"},
		{Name: "short_comment_en"},
		{Name: "full_review_pt"},
		{Name: "full_review_en"},
		{Name: "highlights_pt", Kind: KindJSONArr},
		{Name: "highlights_en", Kind: KindJSONArr},
		{Name: "format"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"notes": {Table: "notes", Cols: []ColDef{
		{Name: "content"},
		{Name: "color"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"game_reviews": {Table: "game_reviews", Cols: []ColDef{
		{Name: "name"},
		{Name: "type"},
		{Name: "genre"},
		{Name: "platform_pt"},
		{Name: "platform_en"},
		{Name: "score"},
		{Name: "score_num", Kind: KindInt},
		{Name: "short_comment_pt"},
		{Name: "short_comment_en"},
		{Name: "full_review_pt"},
		{Name: "full_review_en"},
		{Name: "pros_pt", Kind: KindJSONArr},
		{Name: "pros_en", Kind: KindJSONArr},
		{Name: "cons_pt", Kind: KindJSONArr},
		{Name: "cons_en", Kind: KindJSONArr},
		{Name: "cover_path", Kind: KindReadOnly},
		{Name: "sort_order", Kind: KindInt},
	}},
	"gastronomy": {Table: "gastronomy", Cols: []ColDef{
		{Name: "name"},
		{Name: "cuisine"},
		{Name: "city"},
		{Name: "location_url"},
		{Name: "visited", Kind: KindBool},
		{Name: "photo_path", Kind: KindReadOnly},
		{Name: "sort_order", Kind: KindInt},
	}},
	"media_backlog": {Table: "media_backlog", Cols: []ColDef{
		{Name: "name"},
		{Name: "genre"},
		{Name: "type"},
		{Name: "watched", Kind: KindBool},
		{Name: "liked", Kind: KindBool},
		{Name: "streaming"},
		{Name: "cover_path"},
		{Name: "sort_order", Kind: KindInt},
	}},
	"game_backlog": {Table: "game_backlog", Cols: []ColDef{
		{Name: "name"},
		{Name: "genre"},
		{Name: "cover_path", Kind: KindReadOnly},
		{Name: "sort_order", Kind: KindInt},
	}},
	"recipes": {Table: "recipes", Cols: []ColDef{
		{Name: "emoji"},
		{Name: "name_pt"},
		{Name: "name_en"},
		{Name: "detail_pt"},
		{Name: "detail_en"},
		{Name: "tag_pt"},
		{Name: "tag_en"},
		{Name: "prep_time"},
		{Name: "servings"},
		{Name: "ingredients_pt", Kind: KindJSONArr},
		{Name: "ingredients_en", Kind: KindJSONArr},
		{Name: "steps_pt", Kind: KindJSONArr},
		{Name: "steps_en", Kind: KindJSONArr},
		{Name: "sort_order", Kind: KindInt},
		{Name: "photo_path", Kind: KindReadOnly},
	}},
}
