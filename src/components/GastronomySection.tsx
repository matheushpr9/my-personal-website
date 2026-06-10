import { useLang } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { MapPin, UtensilsCrossed, ChevronDown } from "lucide-react";
import { useGastronomy } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";

type VisitedFilter = "all" | "visited" | "wishlist";

const chip = (active: boolean) =>
  `px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border transition-colors cursor-pointer ${
    active
      ? "border-signal text-signal bg-signal/10"
      : "border-border text-muted-foreground hover:border-signal/40"
  }`;

const GastronomySection = () => {
  const { t } = useLang();
  const { data, isLoading } = useGastronomy();
  const [open, setOpen] = useState(false);
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter>("all");

  const items = data ?? [];

  const filtered = useMemo(() => {
    if (visitedFilter === "visited") return items.filter((i) => i.visited);
    if (visitedFilter === "wishlist") return items.filter((i) => !i.visited);
    return items;
  }, [items, visitedFilter]);

  const searchFn = (item: typeof items[0], q: string) =>
    [item.name, item.cuisine, item.city].some((v) => v?.toLowerCase().includes(q));

  const { search, onSearch, page, setPage, totalPages, paginated, total } =
    useSearchPagination(filtered, searchFn);

  if (!isLoading && items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      id="gastronomy"
      className="panel-card"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <UtensilsCrossed className="size-3" />
          {t("Gastronomia", "Gastronomy")}
        </div>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="gastronomy-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6">
              {isLoading ? (
                <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex-1">
                      <SearchPagination
                        search={search} onSearch={onSearch} page={page} setPage={setPage}
                        totalPages={totalPages} total={total}
                        placeholder={t("Buscar por nome, culinária, cidade...", "Search by name, cuisine, city...")}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0 -mt-4 sm:mt-0">
                      <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Status", "Status")}:</span>
                      {(["all", "visited", "wishlist"] as VisitedFilter[]).map((f) => (
                        <button key={f} onClick={() => setVisitedFilter(f)} className={chip(visitedFilter === f)}>
                          {f === "all" ? t("Todos", "All") : f === "visited" ? t("Visitado", "Visited") : t("Lista", "Wishlist")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {search.trim() && (
                    <p className="text-[9px] text-muted-foreground mb-3 -mt-1">
                      {total === 0
                        ? t("Nenhum resultado", "No results")
                        : `${total} ${t("resultado(s) para", "result(s) for")}`}{" "}
                      <span className="text-signal">"{search}"</span>
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginated.map((item) => (
                      <div
                        key={item.id}
                        className={`group panel-card overflow-hidden transition-all hover:border-signal/40 ${
                          item.location_url ? "cursor-pointer" : ""
                        }`}
                        onClick={() => item.location_url && window.open(item.location_url, "_blank", "noopener")}
                      >
                        <div className="relative w-full h-36 overflow-hidden">
                          {item.photo_path ? (
                            <img
                              src={`/api/gastronomy/${item.id}/photo`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-input border-b border-border/40 flex flex-col items-center justify-center gap-2">
                              <UtensilsCrossed className="size-5 text-border/50" />
                              {item.cuisine && (
                                <span className="text-[8px] text-muted-foreground/40 uppercase tracking-widest">
                                  {item.cuisine}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {item.visited ? (
                              <span className="text-[7px] px-1.5 py-0.5 bg-card/90 border border-phosphor/50 rounded-sm text-phosphor uppercase tracking-wider font-bold">
                                ✓ {t("Visitado", "Visited")}
                              </span>
                            ) : (
                              <span className="text-[7px] px-1.5 py-0.5 bg-card/90 border border-border/70 rounded-sm text-muted-foreground/60 uppercase tracking-wider">
                                {t("Lista", "Wishlist")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5">
                          <div className="text-[10px] font-bold uppercase tracking-tighter text-foreground group-hover:text-signal transition-colors line-clamp-1 mb-2">
                            {item.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {item.cuisine && (
                              <span className="text-[8px] px-1.5 py-0.5 border border-signal/25 rounded-sm text-signal/80 uppercase">
                                {item.cuisine}
                              </span>
                            )}
                            {item.city && (
                              <span className="text-[8px] px-1.5 py-0.5 border border-border rounded-sm text-muted-foreground uppercase">
                                {item.city}
                              </span>
                            )}
                          </div>
                          {item.location_url && (
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/50 group-hover:text-signal transition-colors">
                              <MapPin className="size-2.5" />
                              {t("Ver no Maps", "View on Maps")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {paginated.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      {t("Nenhum restaurante encontrado.", "No restaurants found.")}
                    </p>
                  )}

                  {totalPages > 1 && paginated.length > 0 && (
                    <SearchPagination search="" onSearch={() => {}} page={page} setPage={setPage} totalPages={totalPages} total={total} />
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GastronomySection;
