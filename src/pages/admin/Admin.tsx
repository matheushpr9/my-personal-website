import { useNavigate } from "react-router-dom";
import { clearToken, isAuthenticated } from "@/lib/api";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import CrudEditor from "./CrudEditor";
import {
  useAbout, useSkills, useTools, useExperiences,
  useProjects, useEducation, useBooks, useGameReviews, useRecipes,
} from "@/hooks/use-api";

const tabs = ["about", "skills", "tools", "experiences", "projects", "education", "books", "game_reviews", "recipes"] as const;

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("experiences");

  useEffect(() => { if (!isAuthenticated()) navigate("/admin/login"); }, [navigate]);

  const about = useAbout();
  const skills = useSkills();
  const tools = useTools();
  const experiences = useExperiences();
  const projects = useProjects();
  const education = useEducation();
  const books = useBooks();
  const gameReviews = useGameReviews();
  const recipes = useRecipes();

  const logout = () => { clearToken(); navigate("/admin/login"); };

  return (
    <div className="min-h-dvh p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="panel-card p-4 flex items-center justify-between">
          <h1 className="text-base font-bold uppercase tracking-tighter text-foreground">Admin Panel</h1>
          <button onClick={logout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
            <LogOut className="size-3" /> Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-sm border transition-colors ${
                tab === t ? "border-signal text-signal bg-signal/10" : "border-border text-muted-foreground"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        {tab === "about" && (
          <CrudEditor
            title="About"
            fields={[
              { key: "bio_pt", label: "Bio (PT)", type: "textarea" },
              { key: "bio_en", label: "Bio (EN)", type: "textarea" },
              { key: "years_experience", label: "Years Experience" },
              { key: "location", label: "Location" },
            ]}
            data={about.data}
            isLoading={about.isLoading}
            onCreate={(d) => about.create.mutate(d)}
            onUpdate={(d) => about.update.mutate(d)}
            onDelete={(id) => about.remove.mutate(id)}
          />
        )}

        {tab === "skills" && (
          <CrudEditor
            title="Skills"
            fields={[
              { key: "name", label: "Name" },
              { key: "level", label: "Level (0-100)", type: "number" },
              { key: "label_pt", label: "Label (PT)" },
              { key: "label_en", label: "Label (EN)" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={skills.data}
            isLoading={skills.isLoading}
            onCreate={(d) => skills.create.mutate(d)}
            onUpdate={(d) => skills.update.mutate(d)}
            onDelete={(id) => skills.remove.mutate(id)}
          />
        )}

        {tab === "tools" && (
          <CrudEditor
            title="Tools"
            fields={[
              { key: "name", label: "Name" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={tools.data}
            isLoading={tools.isLoading}
            onCreate={(d) => tools.create.mutate(d)}
            onUpdate={(d) => tools.update.mutate(d)}
            onDelete={(id) => tools.remove.mutate(id)}
          />
        )}

        {tab === "experiences" && (
          <CrudEditor
            title="Experiences"
            fields={[
              { key: "period_pt", label: "Period (PT)" },
              { key: "period_en", label: "Period (EN)" },
              { key: "title_pt", label: "Title (PT)" },
              { key: "title_en", label: "Title (EN)" },
              { key: "company", label: "Company" },
              { key: "description_pt", label: "Description (PT)", type: "textarea" },
              { key: "description_en", label: "Description (EN)", type: "textarea" },
              { key: "tags", label: "Tags", type: "json-array" },
              { key: "active", label: "Active (current job)", type: "boolean" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={experiences.data}
            isLoading={experiences.isLoading}
            onCreate={(d) => experiences.create.mutate(d)}
            onUpdate={(d) => experiences.update.mutate(d)}
            onDelete={(id) => experiences.remove.mutate(id)}
          />
        )}

        {tab === "projects" && (
          <CrudEditor
            title="Projects"
            fields={[
              { key: "name_pt", label: "Name (PT)" },
              { key: "name_en", label: "Name (EN)" },
              { key: "description_pt", label: "Description (PT)", type: "textarea" },
              { key: "description_en", label: "Description (EN)", type: "textarea" },
              { key: "tags", label: "Tags", type: "json-array" },
              { key: "url", label: "URL" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={projects.data}
            isLoading={projects.isLoading}
            onCreate={(d) => projects.create.mutate(d)}
            onUpdate={(d) => projects.update.mutate(d)}
            onDelete={(id) => projects.remove.mutate(id)}
          />
        )}

        {tab === "education" && (
          <CrudEditor
            title="Education"
            fields={[
              { key: "title_pt", label: "Title (PT)" },
              { key: "title_en", label: "Title (EN)" },
              { key: "institution", label: "Institution" },
              { key: "period", label: "Period" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={education.data}
            isLoading={education.isLoading}
            onCreate={(d) => education.create.mutate(d)}
            onUpdate={(d) => education.update.mutate(d)}
            onDelete={(id) => education.remove.mutate(id)}
          />
        )}

        {tab === "books" && (
          <CrudEditor
            title="Books"
            fields={[
              { key: "title", label: "Title" },
              { key: "author", label: "Author" },
              { key: "genre_pt", label: "Genre (PT)" },
              { key: "genre_en", label: "Genre (EN)" },
              { key: "type", label: "Type", type: "select", options: [
                { value: "fiction", label: "Fiction" },
                { value: "non-fiction", label: "Non-Fiction" },
                { value: "technical", label: "Technical" },
              ]},
              { key: "score", label: "Score (e.g. 9/10)" },
              { key: "score_num", label: "Score Number (0-100)", type: "number" },
              { key: "short_comment_pt", label: "Short Comment (PT)", type: "textarea" },
              { key: "short_comment_en", label: "Short Comment (EN)", type: "textarea" },
              { key: "full_review_pt", label: "Full Review (PT)", type: "textarea" },
              { key: "full_review_en", label: "Full Review (EN)", type: "textarea" },
              { key: "highlights_pt", label: "Highlights (PT)", type: "json-array" },
              { key: "highlights_en", label: "Highlights (EN)", type: "json-array" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={books.data}
            isLoading={books.isLoading}
            onCreate={(d) => books.create.mutate(d)}
            onUpdate={(d) => books.update.mutate(d)}
            onDelete={(id) => books.remove.mutate(id)}
          />
        )}

        {tab === "game_reviews" && (
          <CrudEditor
            title="Game Reviews"
            fields={[
              { key: "name", label: "Name" },
              { key: "type", label: "Type", type: "select", options: [
                { value: "videogame", label: "Videogame" },
                { value: "boardgame", label: "Board Game" },
              ]},
              { key: "genre", label: "Genre" },
              { key: "platform_pt", label: "Platform (PT)" },
              { key: "platform_en", label: "Platform (EN)" },
              { key: "score", label: "Score" },
              { key: "score_num", label: "Score Number (0-100)", type: "number" },
              { key: "short_comment_pt", label: "Short Comment (PT)", type: "textarea" },
              { key: "short_comment_en", label: "Short Comment (EN)", type: "textarea" },
              { key: "full_review_pt", label: "Full Review (PT)", type: "textarea" },
              { key: "full_review_en", label: "Full Review (EN)", type: "textarea" },
              { key: "pros_pt", label: "Pros (PT)", type: "json-array" },
              { key: "pros_en", label: "Pros (EN)", type: "json-array" },
              { key: "cons_pt", label: "Cons (PT)", type: "json-array" },
              { key: "cons_en", label: "Cons (EN)", type: "json-array" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={gameReviews.data}
            isLoading={gameReviews.isLoading}
            onCreate={(d) => gameReviews.create.mutate(d)}
            onUpdate={(d) => gameReviews.update.mutate(d)}
            onDelete={(id) => gameReviews.remove.mutate(id)}
          />
        )}

        {tab === "recipes" && (
          <CrudEditor
            title="Recipes"
            fields={[
              { key: "emoji", label: "Emoji" },
              { key: "name_pt", label: "Name (PT)" },
              { key: "name_en", label: "Name (EN)" },
              { key: "detail_pt", label: "Detail (PT)" },
              { key: "detail_en", label: "Detail (EN)" },
              { key: "tag_pt", label: "Tag (PT)" },
              { key: "tag_en", label: "Tag (EN)" },
              { key: "prep_time", label: "Prep Time" },
              { key: "servings", label: "Servings" },
              { key: "difficulty_pt", label: "Difficulty (PT)" },
              { key: "difficulty_en", label: "Difficulty (EN)" },
              { key: "ingredients_pt", label: "Ingredients (PT)", type: "json-array" },
              { key: "ingredients_en", label: "Ingredients (EN)", type: "json-array" },
              { key: "steps_pt", label: "Steps (PT)", type: "json-array" },
              { key: "steps_en", label: "Steps (EN)", type: "json-array" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={recipes.data}
            isLoading={recipes.isLoading}
            onCreate={(d) => recipes.create.mutate(d)}
            onUpdate={(d) => recipes.update.mutate(d)}
            onDelete={(id) => recipes.remove.mutate(id)}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
