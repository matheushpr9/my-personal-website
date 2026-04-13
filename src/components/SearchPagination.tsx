import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  search: string;
  onSearch: (q: string) => void;
  page: number;
  totalPages: number;
  total: number;
  setPage: (p: number) => void;
  placeholder?: string;
}

const SearchPagination = ({ search, onSearch, page, totalPages, total, setPage, placeholder }: Props) => {
  const { t } = useLang();

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <input
          className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-[10px] md:text-xs text-foreground placeholder:text-muted-foreground/50"
          placeholder={placeholder || t("Buscar...", "Search...")}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-[9px] text-muted-foreground">
            {total} {t("itens", "items")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-1 text-muted-foreground hover:text-signal disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-[9px] text-muted-foreground px-2">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1 text-muted-foreground hover:text-signal disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchPagination;
