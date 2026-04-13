import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBooks, type Book } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";

const BooksSection = () => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Book | null>(null);
  const { data, isLoading } = useBooks();

  const fallback: Book[] = [
    { id: 1, title: "Clean Architecture", author: "Robert C. Martin", genre_pt: "Engenharia de Software", genre_en: "Software Engineering", type: "technical", score: "9/10", score_num: 90, short_comment_pt: "Referência essencial para arquitetura de software sustentável.", short_comment_en: "Essential reference for sustainable software architecture.", full_review_pt: "Uncle Bob apresenta princípios atemporais de design de software que transcendem linguagens e frameworks. O livro foca em separação de responsabilidades, inversão de dependência e na criação de sistemas que são fáceis de manter e evoluir. Mudou minha forma de pensar sobre estruturação de projetos.", full_review_en: "Uncle Bob presents timeless software design principles that transcend languages and frameworks. The book focuses on separation of concerns, dependency inversion, and creating systems that are easy to maintain and evolve. Changed how I think about project structure.", highlights_pt: ["Princípios SOLID explicados com clareza", "Boundary entre camadas", "Independência de frameworks"], highlights_en: ["SOLID principles explained clearly", "Boundaries between layers", "Framework independence"], sort_order: 0 },
    { id: 2, title: "Dune", author: "Frank Herbert", genre_pt: "Ficção Científica", genre_en: "Science Fiction", type: "fiction", score: "10/10", score_num: 100, short_comment_pt: "Épico de ficção científica com política, ecologia e filosofia.", short_comment_en: "Sci-fi epic with politics, ecology, and philosophy.", full_review_pt: "Dune é muito mais que ficção científica — é um tratado sobre poder, religião e ecologia embrulhado numa narrativa envolvente. Herbert criou um universo tão detalhado e coerente que cada releitura revela novas camadas. A jornada de Paul Atreides é complexa e evita clichês do 'herói escolhido'.", full_review_en: "Dune is far more than science fiction — it's a treatise on power, religion, and ecology wrapped in a compelling narrative. Herbert created a universe so detailed and coherent that each re-read reveals new layers. Paul Atreides' journey is complex and avoids 'chosen one' clichés.", highlights_pt: ["World-building incomparável", "Temas filosóficos profundos", "Personagens multidimensionais"], highlights_en: ["Unmatched world-building", "Deep philosophical themes", "Multi-dimensional characters"], sort_order: 1 },
    { id: 3, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", genre_pt: "Sistemas Distribuídos", genre_en: "Distributed Systems", type: "technical", score: "9.5/10", score_num: 95, short_comment_pt: "Bíblia dos sistemas distribuídos modernos.", short_comment_en: "The bible of modern distributed systems.", full_review_pt: "Kleppmann consegue explicar conceitos complexos de sistemas distribuídos de forma acessível sem sacrificar profundidade. Desde modelos de dados até consenso distribuído, cada capítulo é uma aula. Essencial para qualquer engenheiro que trabalha com sistemas em escala.", full_review_en: "Kleppmann manages to explain complex distributed systems concepts accessibly without sacrificing depth. From data models to distributed consensus, each chapter is a masterclass. Essential for any engineer working with systems at scale.", highlights_pt: ["Replicação e particionamento", "Modelos de consistência", "Stream processing"], highlights_en: ["Replication and partitioning", "Consistency models", "Stream processing"], sort_order: 2 },
  ];

  const books = data && data.length > 0 ? data : fallback;

  const searchFn = useCallback((book: Book, q: string) =>
    [book.title, book.author, book.genre_pt, book.genre_en, book.type].some((f) => f.toLowerCase().includes(q)),
  []);

  const { search, onSearch, page, setPage, totalPages, paginated, total } = useSearchPagination(books, searchFn);

  const typeLabel = (type: Book["type"]) => {
    const map = { fiction: t("Ficção", "Fiction"), "non-fiction": "Non-Fiction", technical: t("Técnico", "Technical") };
    return map[type];
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} id="books" className="panel-card p-5 md:p-6">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="size-1.5 rounded-full bg-border" />
          <div className="size-1.5 rounded-full bg-phosphor" />
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 md:mb-6">{t("Livros", "Books")}</div>

        {isLoading ? (
          <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
        ) : (
          <>
            <SearchPagination
              search={search} onSearch={onSearch} page={page} setPage={setPage}
              totalPages={totalPages} total={total}
              placeholder={t("Buscar por título, autor, gênero...", "Search by title, author, genre...")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {paginated.map((book) => (
                <div key={book.id} onClick={() => setSelected(book)} className="group cursor-pointer panel-card p-4 hover:border-signal/40 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="size-3.5 text-signal shrink-0" />
                      <span className="text-xs md:text-sm text-foreground font-bold group-hover:text-signal transition-colors uppercase tracking-tighter truncate">{book.title}</span>
                    </div>
                    <span className="text-[10px] text-phosphor font-bold shrink-0 ml-2">{book.score}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2 truncate">{book.author}</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-1.5 py-0.5 text-[8px] border border-signal/30 rounded-sm text-signal uppercase">{typeLabel(book.type)}</span>
                    <span className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground uppercase">{lang === "pt" ? book.genre_pt : book.genre_en}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{lang === "pt" ? book.short_comment_pt : book.short_comment_en}</p>
                  <div className="skill-bar">
                    <div className="skill-bar-fill bg-signal/60 group-hover:bg-signal transition-all" style={{ width: `${book.score_num}%` }} />
                  </div>
                  <div className="text-[8px] text-signal/60 mt-2 uppercase tracking-widest group-hover:text-signal transition-colors">→ {t("Ver review completa", "View full review")}</div>
                </div>
              ))}
            </div>

            {paginated.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{t("Nenhum livro encontrado.", "No books found.")}</p>
            )}

            {/* Bottom pagination (only if > 1 page and items shown) */}
            {totalPages > 1 && paginated.length > 0 && (
              <SearchPagination search="" onSearch={() => {}} page={page} setPage={setPage} totalPages={totalPages} total={total} />
            )}
          </>
        )}
      </motion.div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <div className="bg-input/50 p-5 md:p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="size-5 text-signal shrink-0" />
                  <div className="min-w-0">
                    <DialogTitle className="text-lg md:text-xl font-bold text-foreground uppercase tracking-tighter truncate">{selected.title}</DialogTitle>
                    <div className="text-xs text-muted-foreground">{selected.author}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-[9px] border border-signal/40 rounded-sm text-signal uppercase font-bold">{typeLabel(selected.type)}</span>
                  <span className="px-2 py-1 text-[9px] border border-border rounded-sm text-muted-foreground uppercase">{lang === "pt" ? selected.genre_pt : selected.genre_en}</span>
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
                  <p className="text-xs md:text-sm text-foreground/80 leading-relaxed font-display">{lang === "pt" ? selected.full_review_pt : selected.full_review_en}</p>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BooksSection;
