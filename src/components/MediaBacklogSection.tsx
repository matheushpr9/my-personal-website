import { motion, AnimatePresence } from "framer-motion";
import { Film, ChevronDown, Search, Tv, Eye, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useMediaBacklog, type MediaBacklog } from "@/hooks/use-api";

type TypeFilter = "all" | "movie" | "series";
type StatusFilter = "all" | "watched" | "liked" | "pending";

const chip = (active: boolean) =>
  `px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border transition-colors cursor-pointer ${
    active
      ? "border-signal text-signal bg-signal/10"
      : "border-border text-muted-foreground hover:border-signal/40"
  }`;

const MediaBacklogSection = () => {
  const { t } = useLang();
  const { data, isLoading } = useMediaBacklog();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [streamingFilter, setStreamingFilter] = useState("all");

  const items: MediaBacklog[] = data ?? [];

  const streamingOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.streaming).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);
    if (statusFilter === "watched") list = list.filter((i) => i.watched);
    if (statusFilter === "liked") list = list.filter((i) => i.watched && i.liked);
    if (statusFilter === "pending") list = list.filter((i) => !i.watched);
    if (streamingFilter !== "all") list = list.filter((i) => i.streaming === streamingFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => [i.name, i.genre, i.streaming].some((v) => v.toLowerCase().includes(q)));
    }
    return list;
  }, [items, typeFilter, statusFilter, streamingFilter, search]);

  const total = items.length;
  const pending = items.filter((i) => !i.watched).length;

  if (!isLoading && total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      id="media-backlog"
      className="panel-card"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Film className="size-3" />
          {t("Backlog — Filmes & Séries", "Backlog — Movies & Series")}
          {!isLoading && (
            <span className="text-[9px] text-muted-foreground/60">
              ({pending} {t("pendente(s)", "pending")} / {total})
            </span>
          )}
        </div>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="media-backlog-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-4">
              {isLoading ? (
                <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
              ) : (
                <>
                  {/* Search + filters */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <input
                        className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
                        placeholder={t("Buscar por nome, gênero...", "Search by name, genre...")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Tipo", "Type")}:</span>
                        {(["all", "movie", "series"] as TypeFilter[]).map((f) => (
                          <button key={f} onClick={() => setTypeFilter(f)} className={chip(typeFilter === f)}>
                            {f === "all" ? t("Todos", "All") : f === "movie" ? t("Filme", "Movie") : t("Série", "Series")}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground uppercase mr-1">{t("Status", "Status")}:</span>
                        {(["all", "pending", "watched", "liked"] as StatusFilter[]).map((f) => (
                          <button key={f} onClick={() => setStatusFilter(f)} className={chip(statusFilter === f)}>
                            {f === "all" ? t("Todos", "All")
                              : f === "watched" ? t("Assistido", "Watched")
                              : f === "liked" ? t("Gostei", "Liked")
                              : t("Pendente", "Pending")}
                          </button>
                        ))}
                      </div>
                      {streamingOptions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[9px] text-muted-foreground uppercase mr-1">Streaming:</span>
                          <button onClick={() => setStreamingFilter("all")} className={chip(streamingFilter === "all")}>
                            {t("Todos", "All")}
                          </button>
                          {streamingOptions.map((s) => (
                            <button key={s} onClick={() => setStreamingFilter(s)} className={chip(streamingFilter === s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {search.trim() && (
                      <p className="text-[9px] text-muted-foreground">
                        {filtered.length === 0
                          ? t("Nenhum resultado", "No results")
                          : `${filtered.length} ${t("resultado(s) para", "result(s) for")} `}
                        <span className="text-signal">"{search}"</span>
                      </p>
                    )}
                  </div>

                  {/* Grid */}
                  {filtered.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {t("Nenhum item encontrado.", "No items found.")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className={`group relative rounded-sm overflow-hidden border transition-colors ${
                            item.watched
                              ? "border-border/30"
                              : "border-border hover:border-signal/40"
                          }`}
                        >
                          {/* Poster */}
                          <div className="aspect-[2/3] relative overflow-hidden bg-input">
                            {item.cover_path ? (
                              <img
                                src={`/api/media_backlog/${item.id}/cover`}
                                alt={item.name}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${
                                  item.watched ? "opacity-50 group-hover:opacity-70" : "group-hover:scale-[1.03] transition-transform"
                                }`}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.type === "series"
                                  ? <Tv className="size-6 text-border/50" />
                                  : <Film className="size-6 text-border/50" />}
                              </div>
                            )}

                            {/* Type badge — top left */}
                            <div className="absolute top-1.5 left-1.5">
                              <span className={`text-[7px] px-1 py-0.5 rounded-[2px] font-bold uppercase leading-none ${
                                item.type === "series"
                                  ? "bg-signal text-background"
                                  : "bg-phosphor text-background"
                              }`}>
                                {item.type === "series" ? t("S", "S") : t("F", "F")}
                              </span>
                            </div>

                            {/* Status — bottom right */}
                            {item.watched && (
                              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
                                {item.liked && (
                                  <ThumbsUp className="size-3 text-phosphor drop-shadow-sm" />
                                )}
                                <Eye className="size-3 text-foreground/70 drop-shadow-sm" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-1.5 bg-card">
                            <div className={`text-[9px] font-bold uppercase tracking-tighter leading-tight line-clamp-2 ${
                              item.watched ? "text-muted-foreground" : "text-foreground"
                            }`}>
                              {item.name}
                            </div>
                            {(item.genre || item.streaming) && (
                              <div className="mt-0.5 space-y-0.5">
                                {item.streaming && (
                                  <div className="text-[7px] text-signal/70 uppercase truncate leading-none font-bold">
                                    {item.streaming}
                                  </div>
                                )}
                                {item.genre && (
                                  <div className="text-[7px] text-muted-foreground/50 uppercase truncate leading-none">
                                    {item.genre}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
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
  );
};

export default MediaBacklogSection;
