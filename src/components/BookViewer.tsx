import { useState, useEffect, useRef } from "react";
import { X, Download, BookOpen, Save, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import type { Book } from "@/hooks/use-api";

interface Props {
  book: Book;
  onClose: () => void;
  onProgressSaved?: () => void;
}

const cfiKey = (id: number) => `epub_cfi_${id}`;

const BookViewer = ({ book, onClose, onProgressSaved }: Props) => {
  const { t } = useLang();

  const isPdf = book.file_mime_type === "application/pdf";
  const isEpub = book.file_mime_type === "application/epub+zip";

  const [readingPage, setReadingPage] = useState(book.reading_page ?? 0);
  const [totalPages, setTotalPages] = useState(book.reading_total_pages ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [epubBuffer, setEpubBuffer] = useState<ArrayBuffer | null>(null);
  const [epubLoading, setEpubLoading] = useState(isEpub);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [epubPct, setEpubPct] = useState<number | null>(null);

  // The container div is ALWAYS rendered when isEpub — never conditionally.
  // This ensures containerRef.current is set before the epubjs init effect runs.
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);

  // Step 1: fetch the EPUB as ArrayBuffer.
  // The container div is already in the DOM at this point (rendered below unconditionally).
  useEffect(() => {
    if (!isEpub) return;

    setEpubLoading(true);
    setEpubError(null);

    fetch(`/api/books/${book.id}/file`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then(setEpubBuffer)
      .catch((err) => {
        setEpubError(String(err));
        setEpubLoading(false);
      });
  }, [isEpub, book.id]);

  // Step 2: init epubjs once the buffer arrives and the container is in the DOM.
  // Using ArrayBuffer makes epubjs serve all internal EPUB resources (CSS, images)
  // via in-memory blob: URLs instead of trying to fetch them over HTTP.
  useEffect(() => {
    if (!epubBuffer || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    import("epubjs")
      .then(({ default: Epub }) => {
        if (cancelled || !containerRef.current) return;

        // Read the container's actual rendered dimensions — the async import gives the
        // browser time to finish layout, so clientWidth/clientHeight are reliable here.
        // Using the real dimensions prevents the epubjs iframe from overflowing the
        // container and sitting on top of the prev/next buttons (blocking clicks).
        const W = containerRef.current.clientWidth || window.innerWidth;
        const H = containerRef.current.clientHeight || window.innerHeight - 148;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const book_ = (Epub as any)(epubBuffer);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rendition = (book_ as any).renderTo(containerRef.current, {
          width: W,
          height: H,
          flow: "paginated",
          spread: "none",
          allowScriptedContent: false,
        });

        renditionRef.current = rendition;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.hooks.content.register((contents: any) => {
          const body = contents.document?.body;
          if (body) {
            body.style.cssText +=
              ";background:#fff!important;color:#111!important;" +
              "font-size:18px;line-height:1.75;max-width:680px;margin:0 auto;padding:2rem 1.5rem;";
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.on("relocated", (loc: any) => {
          if (cancelled) return;
          const cfi = loc?.start?.cfi;
          if (cfi) localStorage.setItem(cfiKey(book.id!), cfi);
          const pct = loc?.start?.percentage;
          if (typeof pct === "number") setEpubPct(Math.round(pct * 100));
        });

        const savedCfi = localStorage.getItem(cfiKey(book.id!));

        const display = savedCfi ? rendition.display(savedCfi) : rendition.display();

        display
          .then(() => { if (!cancelled) setEpubLoading(false); })
          .catch(() => {
            // If saved CFI is invalid (e.g. different version of the file), restart from beginning
            rendition.display().then(() => { if (!cancelled) setEpubLoading(false); });
          });
      })
      .catch((err) => {
        if (!cancelled) {
          setEpubError(String(err));
          setEpubLoading(false);
        }
      });

    return () => {
      cancelled = true;
      renditionRef.current?.destroy?.();
      renditionRef.current = null;
    };
  }, [epubBuffer, book.id]);

  // Keyboard navigation for EPUB (← prev, → next)
  useEffect(() => {
    if (!isEpub) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") renditionRef.current?.prev();
      if (e.key === "ArrowRight") renditionRef.current?.next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isEpub]);

  const saveProgress = async () => {
    setSaving(true);
    const page = isEpub ? (epubPct ?? 0) : readingPage;
    const total = isEpub ? 100 : totalPages;
    try {
      await api.put(`/books/${book.id}/progress`, { page, total_pages: total });
      setSaved(true);
      onProgressSaved?.();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <BookOpen className="size-4 text-signal shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold uppercase tracking-tighter text-foreground truncate">{book.title}</p>
          <p className="text-[10px] text-muted-foreground">{book.author}</p>
        </div>
        <a
          href={`/api/books/${book.id}/file`}
          download={book.file_original_name}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-signal border border-border rounded-sm px-2 py-1 uppercase"
        >
          <Download className="size-3" /> {t("Baixar", "Download")}
        </a>
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive border border-border rounded-sm px-2 py-1 uppercase"
        >
          <X className="size-3" /> {t("Fechar", "Close")}
        </button>
      </div>

      {/* Reader */}
      {isPdf && (
        <iframe
          src={`/api/books/${book.id}/file`}
          className="flex-1 w-full border-0"
          title={book.title}
        />
      )}

      {isEpub && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Overlay shown while the buffer is fetching or epubjs is rendering */}
          {epubLoading && !epubError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background pointer-events-none">
              <Loader2 className="size-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {epubError && (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-xs text-destructive text-center">
                {t("Erro ao carregar o livro.", "Failed to load the book.")}<br />
                <span className="text-muted-foreground">{epubError}</span>
              </p>
            </div>
          )}

          {/* Container is ALWAYS in the DOM when isEpub so the ref is set before epubjs inits.
              Click zones overlay the epubjs iframe: left 40% = prev, right 40% = next.
              This works even if the iframe intercepts pointer events on the nav buttons. */}
          <div
            ref={containerRef}
            className="flex-1 relative"
            style={{ background: "#fff", minHeight: 0, display: epubError ? "none" : undefined }}
          >
            {!epubLoading && (
              <>
                <div
                  className="absolute left-0 top-0 w-2/5 h-full z-10 cursor-w-resize"
                  onClick={() => renditionRef.current?.prev()}
                />
                <div
                  className="absolute right-0 top-0 w-2/5 h-full z-10 cursor-e-resize"
                  onClick={() => renditionRef.current?.next()}
                />
              </>
            )}
          </div>

          {!epubError && (
            <div className="flex items-center justify-center gap-6 py-2 border-t border-border bg-card shrink-0">
              <button
                onClick={() => renditionRef.current?.prev()}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-sm px-3 py-1.5 uppercase transition-colors"
              >
                <ChevronLeft className="size-3" /> {t("Anterior", "Prev")}
              </button>
              {epubPct !== null && (
                <span className="text-[10px] text-muted-foreground tabular-nums">{epubPct}%</span>
              )}
              <button
                onClick={() => renditionRef.current?.next()}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-sm px-3 py-1.5 uppercase transition-colors"
              >
                {t("Próximo", "Next")} <ChevronRight className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {!isPdf && !isEpub && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t("Formato não suportado.", "Format not supported.")}</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {t("Progresso", "Progress")}
        </span>

        {isPdf && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{t("Página", "Page")}</span>
            <input
              type="number"
              min={0}
              value={readingPage}
              onChange={(e) => setReadingPage(Number(e.target.value))}
              className="w-16 bg-input border border-border rounded-sm px-2 py-1 text-xs text-foreground text-center"
            />
            <span className="text-muted-foreground">{t("de", "of")}</span>
            <input
              type="number"
              min={0}
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value))}
              className="w-16 bg-input border border-border rounded-sm px-2 py-1 text-xs text-foreground text-center"
            />
          </div>
        )}

        {isPdf && totalPages > 0 && readingPage > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-signal rounded-full transition-all"
                style={{ width: `${Math.min(100, (readingPage / totalPages) * 100)}%` }}
              />
            </div>
            <span>{Math.round((readingPage / totalPages) * 100)}%</span>
          </div>
        )}

        {isEpub && epubPct !== null && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-signal rounded-full transition-all"
                style={{ width: `${epubPct}%` }}
              />
            </div>
            <span>{epubPct}%</span>
          </div>
        )}

        {isEpub && (
          <span className="text-[10px] text-muted-foreground/60 italic">
            {t("Posição salva automaticamente", "Position auto-saved")}
          </span>
        )}

        <button
          onClick={saveProgress}
          disabled={saving}
          className="flex items-center gap-1 text-[10px] font-bold uppercase px-3 py-1.5 rounded-sm border transition-colors ml-auto"
          style={
            saved
              ? { borderColor: "var(--phosphor)", color: "var(--phosphor)" }
              : { borderColor: "var(--signal)", color: "var(--signal)" }
          }
        >
          {saved ? <Check className="size-3" /> : <Save className="size-3" />}
          {saved ? t("Salvo!", "Saved!") : t("Salvar progresso", "Save progress")}
        </button>
      </div>
    </div>
  );
};

export default BookViewer;
