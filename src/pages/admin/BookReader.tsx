import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";
import { useBooks } from "@/hooks/use-api";
import BookViewer from "@/components/BookViewer";
import { ArrowLeft, BookMarked, Download, BookOpen } from "lucide-react";

const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: books } = useBooks();
  const [reading, setReading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(`/admin/login?next=/admin/books/${id}`);
    }
  }, [navigate, id]);

  const book = books?.find((b) => String(b.id) === id);

  const handleDownload = async () => {
    if (!book) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/books/${book.id}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = book.file_original_name || `book-${book.id}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (reading && book) {
    return (
      <BookViewer
        book={book}
        onClose={() => setReading(false)}
      />
    );
  }

  if (!book) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-xs text-muted-foreground animate-pulse">Carregando...</span>
      </div>
    );
  }

  const isPdf = book.file_mime_type === "application/pdf";
  const isEpub = book.file_mime_type === "application/epub+zip";
  const isMobi = book.file_mime_type === "application/x-mobipocket-ebook";
  const canReadOnline = isPdf || isEpub || isMobi;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-sm px-2 py-1 uppercase transition-colors"
        >
          <ArrowLeft className="size-3" /> Voltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        {/* Book info */}
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          {book.cover_path ? (
            <img
              src={`/api/books/${book.id}/cover`}
              alt={book.title}
              className="w-28 h-40 object-cover rounded-sm border border-border/60 shadow-lg"
            />
          ) : (
            <div className="w-28 h-40 bg-input border border-border/40 rounded-sm flex items-center justify-center">
              <BookOpen className="size-8 text-border" />
            </div>
          )}
          <div>
            <h1 className="text-base font-bold uppercase tracking-tighter text-foreground mb-1">
              {book.title}
            </h1>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            {book.score && (
              <span className="text-sm font-bold text-phosphor mt-1 block">{book.score}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canReadOnline && (
            <button
              onClick={() => setReading(true)}
              className="flex items-center gap-2 bg-signal text-primary-foreground px-6 py-3 rounded-sm text-sm font-bold uppercase hover:bg-signal/80 transition-colors"
            >
              <BookMarked className="size-4" /> Ler
            </button>
          )}
          {book.file_original_name && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 border border-border text-muted-foreground px-6 py-3 rounded-sm text-sm font-bold uppercase hover:border-signal/40 hover:text-signal transition-colors disabled:opacity-50"
            >
              <Download className="size-4" />
              {downloading ? "Baixando..." : "Baixar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReader;
