import { useLang } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BookMarked, Layers, ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBooks, useBookCollections, type Book } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";
import BookViewer from "./BookViewer";

type FormatFilter = "all" | "physical" | "digital";
type TypeFilter = "all" | "fiction" | "non-fiction" | "technical";
type ScoreFilter = 0 | 70 | 80 | 90;

const fallback: Book[] = [
  { id: 1, title: "Clean Architecture", author: "Robert C. Martin", genre_pt: "Engenharia de Software", genre_en: "Software Engineering", type: "technical", score: "9/10", score_num: 90, short_comment_pt: "Referência essencial para arquitetura de software sustentável.", short_comment_en: "Essential reference for sustainable software architecture.", full_review_pt: "Uncle Bob apresenta princípios atemporais de design de software que transcendem linguagens e frameworks. O livro foca em separação de responsabilidades, inversão de dependência e na criação de sistemas que são fáceis de manter e evoluir. Mudou minha forma de pensar sobre estruturação de projetos.", full_review_en: "Uncle Bob presents timeless software design principles that transcend languages and frameworks. The book focuses on separation of concerns, dependency inversion, and creating systems that are easy to maintain and evolve. Changed how I think about project structure.", highlights_pt: ["Princípios SOLID explicados com clareza", "Boundary entre camadas", "Independência de frameworks"], highlights_en: ["SOLID principles explained clearly", "Boundaries between layers", "Framework independence"], format: "physical", sort_order: 0 },
  { id: 2, title: "Dune", author: "Frank Herbert", genre_pt: "Ficção Científica", genre_en: "Science Fiction", type: "fiction", score: "10/10", score_num: 100, short_comment_pt: "Épico de ficção científica com política, ecologia e filosofia.", short_comment_en: "Sci-fi epic with politics, ecology, and philosophy.", full_review_pt: "Dune é muito mais que ficção científica — é um tratado sobre poder, religião e ecologia embrulhado numa narrativa envolvente. Herbert criou um universo tão detalhado e coerente que cada releitura revela novas camadas.", full_review_en: "Dune is far more than science fiction — it's a treatise on power, religion, and ecology wrapped in a compelling narrative.", highlights_pt: ["World-building incomparável", "Temas filosóficos profundos", "Personagens multidimensionais"], highlights_en: ["Unmatched world-building", "Deep philosophical themes", "Multi-dimensional characters"], format: "physical", sort_order: 1 },
  { id: 3, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", genre_pt: "Sistemas Distribuídos", genre_en: "Distributed Systems", type: "technical", score: "9.5/10", score_num: 95, short_comment_pt: "Bíblia dos sistemas distribuídos modernos.", short_comment_en: "The bible of modern distributed systems.", full_review_pt: "Kleppmann consegue explicar conceitos complexos de sistemas distribuídos de forma acessível sem sacrificar profundidade.", full_review_en: "Kleppmann manages to explain complex distributed systems concepts accessibly without sacrificing depth.", highlights_pt: ["Replicação e particionamento", "Modelos de consistência", "Stream processing"], highlights_en: ["Replication and partitioning", "Consistency models", "Stream processing"], format: "physical", sort_order: 2 },
];

const chip = (active: boolean) =>
  `px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border transition-colors cursor-pointer ${
    active ? "border-signal text-signal bg-signal/10" : "border-border text-muted-foreground hover:border-signal/40"
  }`;

const BooksSection = () => {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "collections">("library");
  const [selected, setSelected] = useState<Book | null>(null);
  const [viewerBook, setViewerBook] = useState<Book | null>(null);
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>(0);

  const { data: booksData, isLoading, refetch } = useBooks();
  const { data: collections, isLoading: collectionsLoading } = useBookCollections();

  const books = booksData && booksData.length > 0 ? booksData : fallback;

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (formatFilter !== "all" && (b.format ?? "physical") !== formatFilter) return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (scoreFilter > 0 && b.score_num < scoreFilter) return false;
      return true;
    });
  }, [books, formatFilter, typeFilter, scoreFilter]);

  const searchFn = useCallback(
    (book: Book, q: string) =>
      [book.title, book.author, book.genre_pt, book.genre_en, book.type].some((f) => f.toLowerCase().includes(q)),
    [],
  );

  const { search, onSearch, page, setPage, totalPages, paginated, total } = useSearchPagination(filteredBooks, searchFn);

  const typeLabel = (type: Book["type"]) => {
    const map: Record<string, string> = {
      fiction: t("Ficção", "Fiction"),
      "non-fiction": "Non-Fiction",
      technical: t("Técnico", "Technical"),
    };
    return map[type] ?? type;
  };

  const hasFile = (book: Book) => !!book.file_path;
  const progress = (book: Book) => {
    const p = book.reading_page ?? 0;
    const total = book.reading_total_pages ?? 0;
    if (!p || !total) return null;
    return { page: p, total, pct: Math.min(100, Math.round((p / total) * 100)) };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        id="books"
        className="panel-card"
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5 md:p-6 text-left"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="size-3" />
            {t("Livros", "Books")}
          </div>
          <ChevronDown
            className="size-3.5 text-muted-foreground transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="books-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-4">
                  <button
                    onClick={() => setActiveTab("library")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border transition-colors ${
                      activeTab === "library" ? "border-signal text-signal bg-signal/10" : "border-border text-muted-foreground"
                    }`}
                  >
                    <BookOpen className="size-3" /> {t("Biblioteca", "Library")}
                  </button>
                  <button
                    onClick={() => setActiveTab("collections")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border transition-colors ${
                      activeTab === "collections" ? "border-signal text-signal bg-signal/10" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Layers className="size-3" /> {t("Coleções", "Collections")}
                  </button>
                </div>

                {/* === LIBRARY TAB === */}
                {activeTab === "library" && (
                  <>
                    {isLoading ? (
                      <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
                    ) : (
                      <>
                        <SearchPagination
                          search={search} onSearch={onSearch} page={page} setPage={setPage}
                          totalPages={totalPages} total={total}
                          placeholder={t("Buscar por título, autor, gênero...", "Search by title, author, genre...")}
                        />

                        {search.trim() && (
                          <p className="text-[9px] text-muted-foreground mb-3 -mt-2">
                            {total === 0
                              ? t("Nenhum resultado", "No results")
                              : t(`${total} resultado${total !== 1 ? "s" : ""}`, `${total} result${total !== 1 ? "s" : ""}`)}
                            {" "}{t("para", "for")}{" "}
                            <span className="text-signal">"{search}"</span>
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Formato", "Format")}:</span>
                            {(["all", "physical", "digital"] as FormatFilter[]).map((f) => (
                              <button key={f} onClick={() => setFormatFilter(f)} className={chip(formatFilter === f)}>
                                {f === "all" ? t("Todos", "All") : f === "physical" ? t("Físico", "Physical") : "Digital"}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Tipo", "Type")}:</span>
                            {(["all", "fiction", "non-fiction", "technical"] as TypeFilter[]).map((f) => (
                              <button key={f} onClick={() => setTypeFilter(f)} className={chip(typeFilter === f)}>
                                {f === "all" ? t("Todos", "All") : typeLabel(f as Book["type"])}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Nota", "Score")}:</span>
                            {([0, 70, 80, 90] as ScoreFilter[]).map((f) => (
                              <button key={f} onClick={() => setScoreFilter(f)} className={chip(scoreFilter === f)}>
                                {f === 0 ? t("Todos", "All") : `${f / 10}+`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          {paginated.map((book) => {
                            const prog = progress(book);
                            const fmt = book.format ?? "physical";
                            return (
                              <div
                                key={book.id}
                                onClick={() => setSelected(book)}
                                className="group cursor-pointer panel-card p-4 hover:border-signal/40 transition-all"
                              >
                                <div className="flex gap-3 mb-2">
                                  {book.cover_path ? (
                                    <img
                                      src={`/api/books/${book.id}/cover`}
                                      alt={book.title}
                                      className="w-12 h-16 object-cover rounded-sm shrink-0 border border-border/60"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-12 h-16 bg-input border border-border/40 rounded-sm shrink-0 flex items-center justify-center">
                                      <BookOpen className="size-4 text-border" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1 mb-0.5">
                                      <span className="text-xs md:text-sm text-foreground font-bold group-hover:text-signal transition-colors uppercase tracking-tighter line-clamp-2 leading-tight">
                                        {book.title}
                                      </span>
                                      <span className="text-[10px] text-phosphor font-bold shrink-0">{book.score}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">{book.author}</div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <span className="px-1.5 py-0.5 text-[8px] border border-signal/30 rounded-sm text-signal uppercase">
                                    {typeLabel(book.type)}
                                  </span>
                                  <span className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground uppercase">
                                    {lang === "pt" ? book.genre_pt : book.genre_en}
                                  </span>
                                  {fmt === "digital" ? (
                                    <span className="px-1.5 py-0.5 text-[8px] border border-phosphor/40 rounded-sm text-phosphor uppercase">
                                      Digital
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 text-[8px] border border-border/60 rounded-sm text-muted-foreground/60 uppercase">
                                      {t("Físico", "Physical")}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
                                  {lang === "pt" ? book.short_comment_pt : book.short_comment_en}
                                </p>

                                <div className="skill-bar">
                                  <div className="skill-bar-fill bg-signal/60 group-hover:bg-signal transition-all" style={{ width: `${book.score_num}%` }} />
                                </div>

                                {prog && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
                                      <div className="h-full bg-phosphor/70 rounded-full" style={{ width: `${prog.pct}%` }} />
                                    </div>
                                    <span className="text-[8px] text-muted-foreground shrink-0">
                                      {t("Pág.", "P.")} {prog.page}/{prog.total}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {paginated.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-8">
                            {t("Nenhum livro encontrado.", "No books found.")}
                          </p>
                        )}

                        {totalPages > 1 && paginated.length > 0 && (
                          <SearchPagination search="" onSearch={() => {}} page={page} setPage={setPage} totalPages={totalPages} total={total} />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* === COLLECTIONS TAB === */}
                {activeTab === "collections" && (
                  <>
                    {collectionsLoading ? (
                      <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
                    ) : !collections || collections.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        {t("Nenhuma coleção criada ainda.", "No collections yet.")}
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {collections.map((col) => (
                          <div key={col.id}>
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-0.5">
                                <Layers className="size-3.5 text-signal shrink-0" />
                                <span className="text-sm font-bold uppercase tracking-tighter text-foreground">
                                  {lang === "pt" ? col.name_pt : col.name_en}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  {col.books.length} {t("livro(s)", "book(s)")}
                                </span>
                              </div>
                              {(lang === "pt" ? col.description_pt : col.description_en) && (
                                <p className="text-[10px] text-muted-foreground ml-5">
                                  {lang === "pt" ? col.description_pt : col.description_en}
                                </p>
                              )}
                            </div>

                            {col.books.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground ml-5 italic">
                                {t("Nenhum livro nesta coleção.", "No books in this collection.")}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {col.books.map((cb, idx) => {
                                  const bookFull = books.find((b) => b.id === cb.id);
                                  const prog =
                                    cb.reading_page && cb.reading_total_pages
                                      ? Math.round((cb.reading_page / cb.reading_total_pages) * 100)
                                      : null;
                                  return (
                                    <div
                                      key={cb.id}
                                      className="flex items-center gap-3 panel-card p-3 cursor-pointer hover:border-signal/40 transition-all"
                                      onClick={() => bookFull && setSelected(bookFull)}
                                    >
                                      <span className="text-[10px] text-muted-foreground/50 font-mono w-5 shrink-0 text-right">{idx + 1}</span>
                                      <BookOpen className="size-3.5 text-signal shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold uppercase tracking-tighter text-foreground truncate">{cb.title}</div>
                                        <div className="text-[9px] text-muted-foreground">{cb.author}</div>
                                      </div>
                                      {cb.format === "digital" && (
                                        <span className="text-[8px] text-phosphor border border-phosphor/30 rounded-sm px-1.5 py-0.5 uppercase shrink-0">Digital</span>
                                      )}
                                      {prog !== null && <span className="text-[9px] text-signal shrink-0">{prog}%</span>}
                                      <span className="text-[9px] text-phosphor font-bold shrink-0">{cb.score}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <div className="bg-input/50 p-5 md:p-6 border-b border-border">
                <div className="flex gap-4 mb-2">
                  {selected.cover_path && (
                    <img
                      src={`/api/books/${selected.id}/cover`}
                      alt={selected.title}
                      className="w-20 h-28 object-cover rounded-sm shrink-0 border border-border/60 shadow-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {!selected.cover_path && <BookOpen className="size-5 text-signal shrink-0 mt-0.5" />}
                      <DialogTitle
                        onClick={() => {
                          if ((selected.format ?? "physical") === "digital" && hasFile(selected)) {
                            setViewerBook(selected);
                            setSelected(null);
                          }
                        }}
                        className={`text-lg md:text-xl font-bold text-foreground uppercase tracking-tighter ${
                          (selected.format ?? "physical") === "digital" && hasFile(selected)
                            ? "cursor-pointer hover:text-signal transition-colors"
                            : ""
                        }`}
                      >
                        {selected.title}
                        {(selected.format ?? "physical") === "digital" && hasFile(selected) && (
                          <span className="text-signal text-sm font-normal ml-2">→</span>
                        )}
                      </DialogTitle>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{selected.author}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-[9px] border border-signal/40 rounded-sm text-signal uppercase font-bold">{typeLabel(selected.type)}</span>
                  <span className="px-2 py-1 text-[9px] border border-border rounded-sm text-muted-foreground uppercase">{lang === "pt" ? selected.genre_pt : selected.genre_en}</span>
                  {(selected.format ?? "physical") === "digital" ? (
                    <span className="px-2 py-1 text-[9px] border border-phosphor/40 rounded-sm text-phosphor uppercase">Digital</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-phosphor">{selected.score}</span>
                  <div className="flex-1 skill-bar h-2">
                    <div className="skill-bar-fill bg-signal" style={{ width: `${selected.score_num}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Review</div>
                  <p className="text-xs md:text-sm text-foreground/80 leading-relaxed font-display">
                    {lang === "pt" ? selected.full_review_pt : selected.full_review_en}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] text-phosphor uppercase tracking-widest mb-2 font-bold">★ {t("Destaques", "Highlights")}</div>
                  <ul className="space-y-1">
                    {(lang === "pt" ? selected.highlights_pt : selected.highlights_en).map((h) => (
                      <li key={h} className="text-xs text-foreground/70 flex items-start gap-1.5">
                        <span className="text-phosphor mt-0.5">▸</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
                {(selected.format ?? "physical") === "digital" && hasFile(selected) && (
                  <button
                    onClick={() => { setViewerBook(selected); setSelected(null); }}
                    className="flex items-center gap-2 bg-signal text-primary-foreground px-4 py-2 rounded-sm text-xs font-bold uppercase hover:bg-signal/80 transition-colors"
                  >
                    <BookMarked className="size-3.5" /> {t("Ler agora", "Read now")}
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {viewerBook && (
        <BookViewer book={viewerBook} onClose={() => setViewerBook(null)} onProgressSaved={() => refetch()} />
      )}
    </>
  );
};

export default BooksSection;
