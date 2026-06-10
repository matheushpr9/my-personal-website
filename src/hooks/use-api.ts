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
  cover_path?: string;
  format: "physical" | "digital";
  file_path?: string;
  file_original_name?: string;
  file_mime_type?: string;
  reading_page?: number;
  reading_total_pages?: number;
  sort_order: number;
}

export interface BookCollection {
  id: number;
  name_pt: string;
  name_en: string;
  description_pt: string;
  description_en: string;
  sort_order: number;
  books: Array<{
    id: number;
    title: string;
    author: string;
    format: string;
    score: string;
    score_num: number;
    reading_page: number;
    reading_total_pages: number;
    file_original_name: string;
    file_mime_type: string;
  }>;
}

export interface Note {
  id?: number;
  content: string;
  color: string;
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
  cover_path?: string;
  sort_order: number;
}

export interface StudyLink {
  id?: number;
  topic_id: number;
  title: string;
  url: string;
  description: string;
  sort_order: number;
}

export interface StudyNote {
  id?: number;
  topic_id: number;
  content: string;
  sort_order: number;
}

export interface StudyTopic {
  id?: number;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  links: StudyLink[];
  notes: StudyNote[];
}

export function useStudy() {
  const qc = useQueryClient();
  const key = ["study"];

  const query = useQuery({ queryKey: key, queryFn: () => api.get<StudyTopic[]>("/study") });

  const createTopic = useMutation({
    mutationFn: (data: Omit<StudyTopic, "id" | "links" | "notes">) =>
      api.post<{ id: number }>("/study/topics", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateTopic = useMutation({
    mutationFn: ({ id, ...data }: Omit<StudyTopic, "links" | "notes">) =>
      api.put(`/study/topics/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteTopic = useMutation({
    mutationFn: (id: number) => api.del(`/study/topics/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const createLink = useMutation({
    mutationFn: ({ topicId, ...data }: Omit<StudyLink, "id"> & { topicId: number }) =>
      api.post<{ id: number }>(`/study/topics/${topicId}/links`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateLink = useMutation({
    mutationFn: ({ id, ...data }: StudyLink) =>
      api.put(`/study/links/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteLink = useMutation({
    mutationFn: (id: number) => api.del(`/study/links/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const createNote = useMutation({
    mutationFn: ({ topicId, ...data }: Omit<StudyNote, "id"> & { topicId: number }) =>
      api.post<{ id: number }>(`/study/topics/${topicId}/notes`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateNote = useMutation({
    mutationFn: ({ id, ...data }: StudyNote) =>
      api.put(`/study/notes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteNote = useMutation({
    mutationFn: (id: number) => api.del(`/study/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    ...query,
    createTopic, updateTopic, deleteTopic,
    createLink, updateLink, deleteLink,
    createNote, updateNote, deleteNote,
  };
}

export interface Gastronomy {
  id?: number;
  name: string;
  cuisine: string;
  city: string;
  location_url: string;
  visited: boolean;
  photo_path?: string;
  sort_order: number;
}

export interface MediaBacklog {
  id?: number;
  name: string;
  genre: string;
  type: "movie" | "series";
  watched: boolean;
  liked: boolean;
  streaming: string;
  cover_path: string;
  sort_order: number;
}

export interface GameBacklog {
  id?: number;
  name: string;
  genre: string;
  cover_path?: string;
  sort_order: number;
}

export interface Recipe {
  id?: number;
  emoji?: string;
  name_pt: string; name_en: string;
  detail_pt: string; detail_en: string;
  tag_pt: string; tag_en: string;
  prep_time: string; servings: string;
  ingredients_pt: string[]; ingredients_en: string[];
  steps_pt: string[]; steps_en: string[];
  photo_path?: string;
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
export const useNotes = () => useCrud<Note>("notes");
export const useGastronomy = () => useCrud<Gastronomy>("gastronomy");
export const useMediaBacklog = () => useCrud<MediaBacklog>("media_backlog");
export const useGameBacklog = () => useCrud<GameBacklog>("game_backlog");
export const useGameReviews = () => useCrud<GameReview>("game_reviews");
export const useRecipes = () => useCrud<Recipe>("recipes");

export function useBookCollections() {
  const qc = useQueryClient();
  const key = ["book-collections"];

  const query = useQuery({ queryKey: key, queryFn: () => api.get<BookCollection[]>("/book-collections") });

  const create = useMutation({
    mutationFn: (data: Omit<BookCollection, "id" | "books">) => api.post<{ id: number }>("/book-collections", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: Omit<BookCollection, "books">) => api.put<void>(`/book-collections/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del<void>(`/book-collections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const addBook = useMutation({
    mutationFn: ({ collectionId, bookId, sortOrder = 0 }: { collectionId: number; bookId: number; sortOrder?: number }) =>
      api.post<void>(`/book-collections/${collectionId}/books`, { book_id: bookId, sort_order: sortOrder }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const removeBook = useMutation({
    mutationFn: ({ collectionId, bookId }: { collectionId: number; bookId: number }) =>
      api.del<void>(`/book-collections/${collectionId}/books/${bookId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { ...query, create, update, remove, addBook, removeBook };
}
