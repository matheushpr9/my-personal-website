import { useNavigate } from "react-router-dom";
import { clearToken, isAuthenticated } from "@/lib/api";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { LogOut, Upload, X, Plus, Trash2, BookMarked, Search } from "lucide-react";
import CrudEditor from "./CrudEditor";
import StudyAdmin from "./StudyAdmin";
import BookViewer from "@/components/BookViewer";
import {
  useAbout, useSkills, useTools, useExperiences,
  useProjects, useEducation, useBooks, useGameReviews, useRecipes,
  useNotes, useBookCollections, useMediaBacklog, useGameBacklog, useGastronomy,
  type BookCollection, type Book,
} from "@/hooks/use-api";

const tabs = ["about", "skills", "tools", "experiences", "projects", "education", "books", "game_reviews", "game_backlog", "gastronomy", "recipes", "media_backlog", "study", "notes", "collections"] as const;

// ---- Upload-after-create modal ----
function UploadModal({
  bookId,
  bookTitle,
  onClose,
  onDone,
}: {
  bookId: number;
  bookTitle: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/books/${bookId}/file`, fd);
      onDone();
    } catch (e: any) {
      setError(e.message);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="panel-card p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-foreground">Upload do arquivo</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-destructive">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-signal font-bold">"{bookTitle}"</span> é digital. Suba o arquivo agora ou faça depois na seção "Arquivos Digitais".
        </p>
        {error && <p className="text-[10px] text-destructive">{error}</p>}
        <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-sm text-xs font-bold uppercase cursor-pointer transition-colors ${uploading ? "bg-signal/40 text-primary-foreground cursor-not-allowed" : "bg-signal text-primary-foreground hover:bg-signal/80"}`}>
          <Upload className="size-3.5" />
          {uploading ? "Enviando..." : "Selecionar PDF / EPUB"}
          <input
            type="file"
            accept=".pdf,.epub"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>
        <button onClick={onClose} className="text-[10px] text-muted-foreground w-full text-center uppercase">
          Fazer depois
        </button>
      </div>
    </div>
  );
}

// ---- Book Assets Manager (cover + file) ----
function BookFileManager({ books }: { books: ReturnType<typeof useBooks>["data"] }) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewerBook, setViewerBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const { refetch } = useBooks();

  const allBooks = books ?? [];
  if (allBooks.length === 0) return null;

  const filtered = search.trim()
    ? allBooks.filter((b) =>
        [b.title, b.author, b.genre_pt, b.genre_en].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : allBooks;

  const handleUpload = async (bookId: number, type: "cover" | "file", file: File) => {
    const key = `${type}-${bookId}`;
    setUploadingId(key);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/books/${bookId}/${type}`, fd);
      refetch();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploadingId(null);
    }
  };

  const UploadBtn = ({
    bookId, type, accept, label, uploaded,
  }: { bookId: number; type: "cover" | "file"; accept: string; label: string; uploaded?: string }) => {
    const key = `${type}-${bookId}`;
    const busy = uploadingId === key;
    return (
      <label className={`cursor-pointer flex items-center gap-1 text-[9px] uppercase border rounded-sm px-2 py-1 transition-colors shrink-0 ${
        busy ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" :
        uploaded ? "border-signal/30 text-signal hover:bg-signal/10" : "border-border text-muted-foreground hover:border-signal/30 hover:text-signal"
      }`}>
        <Upload className="size-3" />
        {busy ? "..." : uploaded ? "Trocar" : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(bookId, type, f);
            e.target.value = "";
          }}
        />
      </label>
    );
  };

  const canRead = (book: Book) =>
    book.format === "digital" &&
    (book.file_mime_type === "application/pdf" || book.file_mime_type === "application/epub+zip") &&
    !!book.file_original_name;

  return (
    <>
      {viewerBook && (
        <BookViewer
          book={viewerBook}
          onClose={() => setViewerBook(null)}
          onProgressSaved={() => refetch()}
        />
      )}
      <div className="panel-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground shrink-0">Capas & Arquivos</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <input
              className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
              placeholder="Buscar livro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <span className="text-[9px] text-muted-foreground shrink-0">
              {filtered.length}/{allBooks.length}
            </span>
          )}
        </div>

        {errorMsg && <p className="text-[10px] text-destructive">{errorMsg}</p>}

        <div className="space-y-2">
          {filtered.map((book) => (
            <div key={book.id} className="flex items-center gap-3 border border-border rounded-sm p-3 hover:border-signal/30 transition-colors">
              {/* Cover preview */}
              <div className="shrink-0">
                {book.cover_path ? (
                  <img
                    src={`/api/books/${book.id}/cover`}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded-sm border border-border/60"
                  />
                ) : (
                  <div className="w-10 h-14 bg-input border border-border/40 rounded-sm flex items-center justify-center">
                    <Upload className="size-3 text-border" />
                  </div>
                )}
              </div>

              {/* Title — clickable to open reader */}
              <div
                className="flex-1 min-w-0 cursor-pointer group/title"
                onClick={() => canRead(book) && setViewerBook(book)}
              >
                <div className={`text-xs font-bold truncate transition-colors ${canRead(book) ? "text-foreground group-hover/title:text-signal" : "text-foreground"}`}>
                  {book.title}
                  {canRead(book) && <span className="text-signal/60 ml-1 text-[9px] group-hover/title:text-signal transition-colors">→ ler</span>}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {book.format === "digital" ? "Digital" : "Físico"}
                  {book.file_original_name && (
                    <span className="text-signal/70 ml-2">
                      · {book.file_mime_type === "application/pdf" ? "PDF" : book.file_mime_type === "application/epub+zip" ? "EPUB" : book.file_original_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                {canRead(book) && (
                  <button
                    onClick={() => setViewerBook(book)}
                    className="flex items-center gap-1 text-[9px] uppercase border border-signal/30 text-signal rounded-sm px-2 py-1 hover:bg-signal/10 transition-colors"
                  >
                    <BookMarked className="size-3" /> Ler
                  </button>
                )}
                <UploadBtn
                  bookId={book.id!}
                  type="cover"
                  accept=".jpg,.jpeg,.png,.webp"
                  label="Capa"
                  uploaded={book.cover_path}
                />
                {book.format === "digital" && (
                  <UploadBtn
                    bookId={book.id!}
                    type="file"
                    accept=".pdf,.epub"
                    label="Ebook"
                    uploaded={book.file_original_name}
                  />
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum livro encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ---- Collection Manager ----
function CollectionManager({
  collections,
  books,
}: {
  collections: BookCollection[] | undefined;
  books: ReturnType<typeof useBooks>["data"];
}) {
  const { addBook, removeBook } = useBookCollections();
  const [selectedCollId, setSelectedCollId] = useState<number | "">("");
  const [selectedBookId, setSelectedBookId] = useState<number | "">("");
  const [sortOrder, setSortOrder] = useState(0);

  if (!collections || collections.length === 0) return null;

  const currentColl = collections.find((c) => c.id === selectedCollId);
  const booksInColl = currentColl?.books.map((b) => b.id) ?? [];
  const availableBooks = (books ?? []).filter((b) => !booksInColl.includes(b.id!));

  const handleAdd = () => {
    if (!selectedCollId || !selectedBookId) return;
    addBook.mutate({ collectionId: Number(selectedCollId), bookId: Number(selectedBookId), sortOrder });
    setSelectedBookId("");
    setSortOrder(0);
  };

  return (
    <div className="panel-card p-5 space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground">Livros nas Coleções</h2>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 block">Coleção</label>
        <select
          className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground"
          value={selectedCollId}
          onChange={(e) => setSelectedCollId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Selecionar coleção...</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name_pt || c.name_en}</option>
          ))}
        </select>
      </div>

      {currentColl && (
        <>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
              Livros ({currentColl.books.length})
            </div>
            {currentColl.books.length === 0 && (
              <p className="text-[10px] text-muted-foreground">Nenhum livro nesta coleção.</p>
            )}
            {currentColl.books.map((b) => (
              <div key={b.id} className="flex items-center justify-between border border-border rounded-sm px-3 py-2">
                <span className="text-xs text-foreground truncate">{b.title}</span>
                <button
                  onClick={() => removeBook.mutate({ collectionId: currentColl.id, bookId: b.id })}
                  className="text-destructive p-1 shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Adicionar livro</div>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Selecionar livro...</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Ordem"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-20 bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground"
              />
              <button
                onClick={handleAdd}
                disabled={!selectedBookId}
                className="flex items-center gap-1 bg-signal text-primary-foreground px-3 py-1.5 rounded-sm text-xs font-bold uppercase disabled:opacity-40"
              >
                <Plus className="size-3" /> Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Gastronomy Photo Manager ----
function GastronomyPhotoManager({
  items,
  onRefetch,
}: {
  items: ReturnType<typeof useGastronomy>["data"];
  onRefetch: () => void;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const all = items ?? [];
  if (all.length === 0) return null;

  const filtered = search.trim()
    ? all.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()))
    : all;

  const handleUpload = async (id: number, file: File) => {
    setUploadingId(id);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/gastronomy/${id}/photo`, fd);
      onRefetch();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="panel-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground shrink-0">Fotos — Gastronomia</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
            placeholder="Buscar restaurante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && <span className="text-[9px] text-muted-foreground shrink-0">{filtered.length}/{all.length}</span>}
      </div>

      {errorMsg && <p className="text-[10px] text-destructive">{errorMsg}</p>}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-border rounded-sm p-3 hover:border-signal/30 transition-colors">
            <div className="shrink-0 w-16 h-12 rounded-sm overflow-hidden border border-border/60 bg-input flex items-center justify-center">
              {item.photo_path ? (
                <img src={`/api/gastronomy/${item.id}/photo`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Upload className="size-3 text-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
              <div className="text-[9px] text-muted-foreground">{item.cuisine}{item.city ? ` · ${item.city}` : ""}</div>
            </div>
            <label className={`cursor-pointer flex items-center gap-1 text-[9px] uppercase border rounded-sm px-2 py-1 transition-colors shrink-0 ${
              uploadingId === item.id ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
              : item.photo_path ? "border-signal/30 text-signal hover:bg-signal/10"
              : "border-border text-muted-foreground hover:border-signal/30 hover:text-signal"
            }`}>
              <Upload className="size-3" />
              {uploadingId === item.id ? "..." : item.photo_path ? "Trocar" : "Foto"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploadingId === item.id}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(item.id!, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum restaurante encontrado.</p>
        )}
      </div>
    </div>
  );
}

// ---- Recipe Photo Manager ----
function RecipePhotoManager({
  recipes,
  onRefetch,
}: {
  recipes: ReturnType<typeof useRecipes>["data"];
  onRefetch: () => void;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const all = recipes ?? [];
  if (all.length === 0) return null;

  const filtered = search.trim()
    ? all.filter((r) =>
        [r.name_pt, r.name_en].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : all;

  const handleUpload = async (recipeId: number, file: File) => {
    setUploadingId(recipeId);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/recipes/${recipeId}/photo`, fd);
      onRefetch();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="panel-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground shrink-0">Fotos das Receitas</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
            placeholder="Buscar receita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <span className="text-[9px] text-muted-foreground shrink-0">{filtered.length}/{all.length}</span>
        )}
      </div>

      {errorMsg && <p className="text-[10px] text-destructive">{errorMsg}</p>}

      <div className="space-y-2">
        {filtered.map((recipe) => (
          <div key={recipe.id} className="flex items-center gap-3 border border-border rounded-sm p-3 hover:border-signal/30 transition-colors">
            {/* Photo preview */}
            <div className="shrink-0 w-16 h-12 rounded-sm overflow-hidden border border-border/60 bg-input flex items-center justify-center">
              {recipe.photo_path ? (
                <img
                  src={`/api/recipes/${recipe.id}/photo`}
                  alt={recipe.name_pt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="size-3 text-border" />
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{recipe.name_pt}</div>
              <div className="text-[9px] text-muted-foreground">{recipe.tag_pt}</div>
            </div>

            {/* Upload button */}
            <label className={`cursor-pointer flex items-center gap-1 text-[9px] uppercase border rounded-sm px-2 py-1 transition-colors shrink-0 ${
              uploadingId === recipe.id
                ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                : recipe.photo_path
                ? "border-signal/30 text-signal hover:bg-signal/10"
                : "border-border text-muted-foreground hover:border-signal/30 hover:text-signal"
            }`}>
              <Upload className="size-3" />
              {uploadingId === recipe.id ? "..." : recipe.photo_path ? "Trocar" : "Foto"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploadingId === recipe.id}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(recipe.id!, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Nenhuma receita encontrada.</p>
        )}
      </div>
    </div>
  );
}

// ---- Generic Cover Manager ----
function CoverManager({
  title,
  apiPath,
  items,
  labelFn,
  onRefetch,
}: {
  title: string;
  apiPath: string;
  items: Array<{ id?: number; name: string; cover_path?: string; [key: string]: any }> | undefined;
  labelFn?: (item: any) => string;
  onRefetch: () => void;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const all = items ?? [];
  if (all.length === 0) return null;

  const filtered = search.trim()
    ? all.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()))
    : all;

  const handleUpload = async (id: number, file: File) => {
    setUploadingId(id);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/${apiPath}/${id}/cover`, fd);
      onRefetch();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="panel-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground shrink-0">{title}</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
            placeholder="Buscar título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && <span className="text-[9px] text-muted-foreground shrink-0">{filtered.length}/{all.length}</span>}
      </div>

      {errorMsg && <p className="text-[10px] text-destructive">{errorMsg}</p>}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-border rounded-sm p-3 hover:border-signal/30 transition-colors">
            <div className="shrink-0 w-10 h-[52px] rounded-sm overflow-hidden border border-border/60 bg-input flex items-center justify-center">
              {item.cover_path ? (
                <img src={`/api/${apiPath}/${item.id}/cover`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Upload className="size-3 text-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
              {labelFn && <div className="text-[9px] text-muted-foreground">{labelFn(item)}</div>}
            </div>
            <label className={`cursor-pointer flex items-center gap-1 text-[9px] uppercase border rounded-sm px-2 py-1 transition-colors shrink-0 ${
              uploadingId === item.id ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
              : item.cover_path ? "border-signal/30 text-signal hover:bg-signal/10"
              : "border-border text-muted-foreground hover:border-signal/30 hover:text-signal"
            }`}>
              <Upload className="size-3" />
              {uploadingId === item.id ? "..." : item.cover_path ? "Trocar" : "Capa"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploadingId === item.id}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(item.id!, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum item encontrado.</p>
        )}
      </div>
    </div>
  );
}

// ---- Media Cover Manager ----
function MediaCoverManager({
  items,
  onRefetch,
}: {
  items: ReturnType<typeof useMediaBacklog>["data"];
  onRefetch: () => void;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const all = items ?? [];
  if (all.length === 0) return null;

  const filtered = search.trim()
    ? all.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()))
    : all;

  const handleUpload = async (id: number, file: File) => {
    setUploadingId(id);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload(`/media_backlog/${id}/cover`, fd);
      onRefetch();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="panel-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground shrink-0">Capas — Filmes & Séries</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
            placeholder="Buscar título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && <span className="text-[9px] text-muted-foreground shrink-0">{filtered.length}/{all.length}</span>}
      </div>

      {errorMsg && <p className="text-[10px] text-destructive">{errorMsg}</p>}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-border rounded-sm p-3 hover:border-signal/30 transition-colors">
            <div className="shrink-0 w-10 h-[60px] rounded-sm overflow-hidden border border-border/60 bg-input flex items-center justify-center">
              {item.cover_path ? (
                <img src={`/api/media_backlog/${item.id}/cover`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Upload className="size-3 text-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
              <div className="text-[9px] text-muted-foreground">{item.type === "series" ? "Série" : "Filme"}{item.genre ? ` · ${item.genre}` : ""}</div>
            </div>
            <label className={`cursor-pointer flex items-center gap-1 text-[9px] uppercase border rounded-sm px-2 py-1 transition-colors shrink-0 ${
              uploadingId === item.id ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
              : item.cover_path ? "border-signal/30 text-signal hover:bg-signal/10"
              : "border-border text-muted-foreground hover:border-signal/30 hover:text-signal"
            }`}>
              <Upload className="size-3" />
              {uploadingId === item.id ? "..." : item.cover_path ? "Trocar" : "Capa"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploadingId === item.id}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(item.id!, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum item encontrado.</p>
        )}
      </div>
    </div>
  );
}

// ---- Admin ----
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
  const gameBacklog = useGameBacklog();
  const gastronomy = useGastronomy();
  const recipes = useRecipes();
  const mediaBacklog = useMediaBacklog();
  const notes = useNotes();
  const collections = useBookCollections();

  const [uploadModal, setUploadModal] = useState<{ id: number; title: string } | null>(null);

  const logout = () => { clearToken(); navigate("/admin/login"); };

  return (
    <div className="min-h-dvh p-3 md:p-6">
      {uploadModal && (
        <UploadModal
          bookId={uploadModal.id}
          bookTitle={uploadModal.title}
          onClose={() => setUploadModal(null)}
          onDone={() => { setUploadModal(null); books.refetch(); }}
        />
      )}
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
          <div className="space-y-4">
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
                { key: "format", label: "Format", type: "select", options: [
                  { value: "physical", label: "Físico (Physical)" },
                  { value: "digital", label: "Digital" },
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
              onCreate={async (d) => {
                const res = await books.create.mutateAsync(d);
                if (d.format === "digital" && res?.id) {
                  setUploadModal({ id: res.id, title: d.title });
                }
              }}
              onUpdate={(d) => books.update.mutate(d)}
              onDelete={(id) => books.remove.mutate(id)}
            />
            <BookFileManager books={books.data} />
          </div>
        )}

        {tab === "gastronomy" && (
          <div className="space-y-4">
            <CrudEditor
              title="Gastronomia"
              fields={[
                { key: "name", label: "Restaurante" },
                { key: "cuisine", label: "Culinária / Tipo" },
                { key: "city", label: "Cidade" },
                { key: "location_url", label: "Link Google Maps" },
                { key: "visited", label: "Visitado?", type: "boolean" },
                { key: "sort_order", label: "Ordem", type: "number" },
              ]}
              data={gastronomy.data}
              isLoading={gastronomy.isLoading}
              onCreate={(d) => gastronomy.create.mutate(d)}
              onUpdate={(d) => gastronomy.update.mutate(d)}
              onDelete={(id) => gastronomy.remove.mutate(id)}
            />
            <GastronomyPhotoManager
              items={gastronomy.data}
              onRefetch={() => gastronomy.refetch()}
            />
          </div>
        )}

        {tab === "study" && <StudyAdmin />}

        {tab === "game_backlog" && (
          <div className="space-y-4">
            <CrudEditor
              title="Game Backlog"
              fields={[
                { key: "name", label: "Nome do Jogo" },
                { key: "genre", label: "Gênero" },
                { key: "sort_order", label: "Ordem", type: "number" },
              ]}
              data={gameBacklog.data}
              isLoading={gameBacklog.isLoading}
              onCreate={(d) => gameBacklog.create.mutate(d)}
              onUpdate={(d) => gameBacklog.update.mutate(d)}
              onDelete={(id) => gameBacklog.remove.mutate(id)}
            />
            <CoverManager
              title="Capas — Game Backlog"
              apiPath="game_backlog"
              items={gameBacklog.data}
              onRefetch={() => gameBacklog.refetch()}
            />
          </div>
        )}

        {tab === "media_backlog" && (
          <div className="space-y-4">
            <CrudEditor
              title="Media Backlog — Filmes & Séries"
              fields={[
                { key: "name", label: "Nome" },
                { key: "genre", label: "Gênero" },
                { key: "type", label: "Tipo", type: "select", options: [
                  { value: "movie", label: "Filme" },
                  { value: "series", label: "Série" },
                ]},
                { key: "streaming", label: "Streaming (ex: Netflix)" },
                { key: "watched", label: "Assistido?", type: "boolean" },
                { key: "liked", label: "Gostei?", type: "boolean" },
                { key: "sort_order", label: "Ordem", type: "number" },
              ]}
              data={mediaBacklog.data}
              isLoading={mediaBacklog.isLoading}
              onCreate={(d) => mediaBacklog.create.mutate(d)}
              onUpdate={(d) => mediaBacklog.update.mutate(d)}
              onDelete={(id) => mediaBacklog.remove.mutate(id)}
            />
            <MediaCoverManager
              items={mediaBacklog.data}
              onRefetch={() => mediaBacklog.refetch()}
            />
          </div>
        )}

        {tab === "notes" && (
          <CrudEditor
            title="Notes"
            fields={[
              { key: "content", label: "Conteúdo", type: "textarea" },
              { key: "color", label: "Cor", type: "select", options: [
                { value: "yellow", label: "🟡 Amarelo" },
                { value: "pink", label: "🩷 Rosa" },
                { value: "blue", label: "🔵 Azul" },
                { value: "green", label: "🟢 Verde" },
                { value: "orange", label: "🟠 Laranja" },
                { value: "purple", label: "🟣 Roxo" },
              ]},
              { key: "sort_order", label: "Order", type: "number" },
            ]}
            data={notes.data}
            isLoading={notes.isLoading}
            onCreate={(d) => notes.create.mutateAsync(d)}
            onUpdate={(d) => notes.update.mutateAsync(d)}
            onDelete={(id) => notes.remove.mutate(id)}
          />
        )}

        {tab === "game_reviews" && (
          <div className="space-y-4">
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
            <CoverManager
              title="Capas — Game Reviews"
              apiPath="game_reviews"
              items={gameReviews.data}
              labelFn={(i) => i.type === "videogame" ? "Videogame" : "Board Game"}
              onRefetch={() => gameReviews.refetch()}
            />
          </div>
        )}

        {tab === "recipes" && (
          <div className="space-y-4">
            <CrudEditor
              title="Recipes"
              fields={[
                { key: "name_pt", label: "Name (PT)" },
                { key: "name_en", label: "Name (EN)" },
                { key: "detail_pt", label: "Detail (PT)" },
                { key: "detail_en", label: "Detail (EN)" },
                { key: "tag_pt", label: "Tag (PT)" },
                { key: "tag_en", label: "Tag (EN)" },
                { key: "prep_time", label: "Prep Time" },
                { key: "servings", label: "Servings" },
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
            <RecipePhotoManager recipes={recipes.data} onRefetch={() => recipes.refetch()} />
          </div>
        )}

        {tab === "collections" && (
          <div className="space-y-4">
            <CrudEditor
              title="Book Collections"
              fields={[
                { key: "name_pt", label: "Nome (PT)" },
                { key: "name_en", label: "Name (EN)" },
                { key: "description_pt", label: "Descrição (PT)", type: "textarea" },
                { key: "description_en", label: "Description (EN)", type: "textarea" },
                { key: "sort_order", label: "Order", type: "number" },
              ]}
              data={collections.data as any[]}
              isLoading={collections.isLoading}
              onCreate={(d) => collections.create.mutate(d)}
              onUpdate={(d) => collections.update.mutate(d)}
              onDelete={(id) => collections.remove.mutate(id)}
            />
            <CollectionManager collections={collections.data} books={books.data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
