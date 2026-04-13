import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// --- Types ---
export interface Experience {
  id?: number;
  period_pt: string; period_en: string;
  title_pt: string; title_en: string;
  company: string;
  description_pt: string; description_en: string;
  tags: string[];
  active: boolean;
  sort_order: number;
}

export interface Project {
  id?: number;
  name_pt: string; name_en: string;
  description_pt: string; description_en: string;
  tags: string[];
  url?: string;
  sort_order: number;
}

export interface Education {
  id?: number;
  title_pt: string; title_en: string;
  institution: string;
  period: string;
  sort_order: number;
}

export interface Skill {
  id?: number;
  name: string;
  level: number;
  label_pt: string; label_en: string;
  sort_order: number;
}

export interface Tool {
  id?: number;
  name: string;
  sort_order: number;
}

export interface About {
  id?: number;
  bio_pt: string; bio_en: string;
  years_experience: string;
  location: string;
}

export interface Book {
  id?: number;
  title: string; author: string;
  genre_pt: string; genre_en: string;
  type: "fiction" | "non-fiction" | "technical";
  score: string; score_num: number;
  short_comment_pt: string; short_comment_en: string;
  full_review_pt: string; full_review_en: string;
  highlights_pt: string[]; highlights_en: string[];
  sort_order: number;
}

export interface GameReview {
  id?: number;
  name: string;
  type: "videogame" | "boardgame";
  genre: string;
  platform_pt: string; platform_en: string;
  score: string; score_num: number;
  short_comment_pt: string; short_comment_en: string;
  full_review_pt: string; full_review_en: string;
  pros_pt: string[]; pros_en: string[];
  cons_pt: string[]; cons_en: string[];
  sort_order: number;
}

export interface Recipe {
  id?: number;
  emoji: string;
  name_pt: string; name_en: string;
  detail_pt: string; detail_en: string;
  tag_pt: string; tag_en: string;
  prep_time: string; servings: string;
  difficulty_pt: string; difficulty_en: string;
  ingredients_pt: string[]; ingredients_en: string[];
  steps_pt: string[]; steps_en: string[];
  sort_order: number;
}

// --- Generic hook factory ---
function useCrud<T extends { id?: number }>(resource: string) {
  const qc = useQueryClient();
  const key = [resource];

  const query = useQuery({ queryKey: key, queryFn: () => api.get<T[]>(`/${resource}`) });

  const create = useMutation({
    mutationFn: (data: Omit<T, "id">) => api.post<{ id: number }>(`/${resource}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: T) => api.put(`/${resource}/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/${resource}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { ...query, create, update, remove };
}

export const useExperiences = () => useCrud<Experience>("experiences");
export const useProjects = () => useCrud<Project>("projects");
export const useEducation = () => useCrud<Education>("education");
export const useSkills = () => useCrud<Skill>("skills");
export const useTools = () => useCrud<Tool>("tools");
export const useAbout = () => useCrud<About>("about");
export const useBooks = () => useCrud<Book>("books");
export const useGameReviews = () => useCrud<GameReview>("game_reviews");
export const useRecipes = () => useCrud<Recipe>("recipes");
