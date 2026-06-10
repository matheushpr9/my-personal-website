import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useGameBacklog } from "@/hooks/use-api";

const GameBacklogSection = () => {
  const { t } = useLang();
  const { data, isLoading } = useGameBacklog();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const items = data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) =>
      [i.name, i.genre ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [items, search]);

  if (!isLoading && items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      id="game-backlog"
      className="panel-card"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Gamepad2 className="size-3" />
          {t("Backlog — Jogos", "Backlog — Games")}
          {!isLoading && (
            <span className="text-[9px] text-muted-foreground/60">({items.length})</span>
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
            key="game-backlog-content"
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
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <input
                      className="w-full bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50"
                      placeholder={t("Buscar por nome, gênero...", "Search by name, genre...")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {t("Nenhum jogo encontrado.", "No games found.")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className="group relative rounded-sm overflow-hidden border border-border hover:border-signal/40 transition-colors"
                        >
                          <div className="aspect-[3/4] relative overflow-hidden bg-input">
                            {item.cover_path ? (
                              <img
                                src={`/api/game_backlog/${item.id}/cover`}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gamepad2 className="size-6 text-border/50" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-card">
                            <div className="text-[9px] font-bold uppercase tracking-tighter leading-tight line-clamp-2 text-foreground">
                              {item.name}
                            </div>
                            {item.genre && (
                              <div className="mt-0.5 text-[7px] text-muted-foreground/50 uppercase truncate leading-none">
                                {item.genre}
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

export default GameBacklogSection;
