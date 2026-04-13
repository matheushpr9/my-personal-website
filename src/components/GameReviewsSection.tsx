import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Gamepad2, Dice5 } from "lucide-react";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGameReviews, type GameReview } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";

const GameReviewsSection = () => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<GameReview | null>(null);
  const { data, isLoading } = useGameReviews();

  const fallback: GameReview[] = [
    { id: 1, name: "Baldur's Gate 3", type: "videogame", genre: "RPG", platform_pt: "PC / PS5", platform_en: "PC / PS5", score: "10/10", score_num: 100, short_comment_pt: "Obra-prima de RPG com liberdade narrativa sem igual.", short_comment_en: "RPG masterpiece with unmatched narrative freedom.", full_review_pt: "Larian redefiniu o que significa um CRPG moderno. A liberdade de escolha é absurda — cada decisão importa e o mundo reage de formas que você não espera. O combate por turnos é estratégico e satisfatório, e a narrativa é das mais ricas que já vi em games. O multiplayer cooperativo funciona perfeitamente e adiciona uma camada extra de diversão.", full_review_en: "Larian redefined what a modern CRPG means. The freedom of choice is absurd — every decision matters and the world reacts in ways you don't expect. Turn-based combat is strategic and satisfying, and the narrative is one of the richest I've seen in games. Co-op multiplayer works perfectly and adds an extra layer of fun.", pros_pt: ["Narrativa excepcional", "Liberdade total", "Combate estratégico"], pros_en: ["Exceptional narrative", "Total freedom", "Strategic combat"], cons_pt: ["Algumas bugs no lançamento", "Ato 3 um pouco apressado"], cons_en: ["Some bugs at launch", "Act 3 slightly rushed"], sort_order: 0 },
    { id: 2, name: "Elden Ring", type: "videogame", genre: "Action RPG", platform_pt: "PC / PS5 / Xbox", platform_en: "PC / PS5 / Xbox", score: "9.5/10", score_num: 95, short_comment_pt: "Open world que respeita o jogador. Dificuldade justa.", short_comment_en: "Open world that respects the player. Fair difficulty.", full_review_pt: "FromSoftware entregou seu mundo mais ambicioso. Cada caverna, cada castelo esconde algo que vale a pena descobrir. A sensação de conquista ao derrotar cada boss é incomparável. O design de mundo aberto funciona perfeitamente com a fórmula Souls, criando uma experiência de exploração orgânica e recompensadora.", full_review_en: "FromSoftware delivered their most ambitious world. Every cave, every castle hides something worth discovering. The sense of achievement when defeating each boss is unmatched. The open world design works perfectly with the Souls formula, creating an organic and rewarding exploration experience.", pros_pt: ["World design incrível", "Combate refinado", "Exploração orgânica"], pros_en: ["Incredible world design", "Refined combat", "Organic exploration"], cons_pt: ["Performance no PC irregular", "Alguns bosses repetidos"], cons_en: ["Inconsistent PC performance", "Some repeated bosses"], sort_order: 1 },
    { id: 3, name: "Gloomhaven", type: "boardgame", genre: "Dungeon Crawler", platform_pt: "Jogo de Tabuleiro", platform_en: "Board Game", score: "9/10", score_num: 90, short_comment_pt: "Dungeon crawler de mesa com estratégia pura.", short_comment_en: "Tabletop dungeon crawler with pure strategy.", full_review_pt: "Gloomhaven é uma experiência massiva que compete com qualquer RPG digital. O sistema de cartas para combate é brilhante — cada turno é um puzzle de otimização. A progressão de personagem é viciante e as escolhas narrativas têm peso real. É um compromisso de tempo considerável, mas cada sessão é recompensadora.", full_review_en: "Gloomhaven is a massive experience that competes with any digital RPG. The card system for combat is brilliant — each turn is an optimization puzzle. Character progression is addictive and narrative choices carry real weight. It's a considerable time commitment, but every session is rewarding.", pros_pt: ["Sistema de combate único", "Progressão viciante", "Narrativa com peso"], pros_en: ["Unique combat system", "Addictive progression", "Weighty narrative"], cons_pt: ["Setup demorado", "Regras complexas"], cons_en: ["Long setup time", "Complex rules"], sort_order: 2 },
    { id: 4, name: "Wingspan", type: "boardgame", genre: "Engine Building", platform_pt: "Jogo de Tabuleiro", platform_en: "Board Game", score: "8.5/10", score_num: 85, short_comment_pt: "Engine building elegante. Perfeito para sessões relaxantes.", short_comment_en: "Elegant engine building. Perfect for relaxing sessions.", full_review_pt: "Wingspan prova que jogos de tabuleiro podem ser ao mesmo tempo bonitos, temáticos e mecanicamente satisfatórios. Coletar pássaros e construir seu habitat é surpreendentemente envolvente. A arte é deslumbrante e cada partida flui de forma diferente. Ótimo para introduzir novos jogadores ao hobby.", full_review_en: "Wingspan proves board games can be beautiful, thematic, and mechanically satisfying all at once. Collecting birds and building your habitat is surprisingly engaging. The art is stunning and each game flows differently. Great for introducing new players to the hobby.", pros_pt: ["Arte deslumbrante", "Fácil de ensinar", "Alta rejogabilidade"], pros_en: ["Stunning art", "Easy to teach", "High replayability"], cons_pt: ["Pouca interação entre jogadores", "Pode parecer solitário"], cons_en: ["Low player interaction", "Can feel solitary"], sort_order: 3 },
  ];

  const reviews = data && data.length > 0 ? data : fallback;

  const searchFn = useCallback((r: GameReview, q: string) =>
    [r.name, r.genre, r.type, r.platform_pt, r.platform_en].some((f) => f.toLowerCase().includes(q)),
  []);

  const { search, onSearch, page, setPage, totalPages, paginated, total } = useSearchPagination(reviews, searchFn);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} id="games" className="panel-card p-5 md:p-6">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="size-1.5 rounded-full bg-border" />
          <div className="size-1.5 rounded-full bg-signal" />
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 md:mb-6">Game_Reviews</div>

        {isLoading ? (
          <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
        ) : (
          <>
            <SearchPagination
              search={search} onSearch={onSearch} page={page} setPage={setPage}
              totalPages={totalPages} total={total}
              placeholder={t("Buscar por nome, gênero, plataforma...", "Search by name, genre, platform...")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {paginated.map((review) => (
                <div key={review.id} onClick={() => setSelected(review)} className="group cursor-pointer panel-card p-4 hover:border-signal/40 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {review.type === "videogame" ? <Gamepad2 className="size-3.5 text-signal shrink-0" /> : <Dice5 className="size-3.5 text-signal shrink-0" />}
                      <span className="text-xs md:text-sm text-foreground font-bold group-hover:text-signal transition-colors uppercase tracking-tighter truncate">{review.name}</span>
                    </div>
                    <span className="text-[10px] text-phosphor font-bold shrink-0 ml-2">{review.score}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-1.5 py-0.5 text-[8px] border border-signal/30 rounded-sm text-signal uppercase">{review.type === "videogame" ? "Videogame" : "Board Game"}</span>
                    <span className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground uppercase">{review.genre}</span>
                    <span className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground uppercase">{lang === "pt" ? review.platform_pt : review.platform_en}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{lang === "pt" ? review.short_comment_pt : review.short_comment_en}</p>
                  <div className="skill-bar">
                    <div className="skill-bar-fill bg-signal/60 group-hover:bg-signal transition-all" style={{ width: `${review.score_num}%` }} />
                  </div>
                  <div className="text-[8px] text-signal/60 mt-2 uppercase tracking-widest group-hover:text-signal transition-colors">→ {t("Ver review completa", "View full review")}</div>
                </div>
              ))}
            </div>

            {paginated.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{t("Nenhum jogo encontrado.", "No games found.")}</p>
            )}

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
                <div className="flex items-center gap-3 mb-3">
                  {selected.type === "videogame" ? <Gamepad2 className="size-5 text-signal" /> : <Dice5 className="size-5 text-signal" />}
                  <DialogTitle className="text-lg md:text-xl font-bold text-foreground uppercase tracking-tighter">{selected.name}</DialogTitle>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-[9px] border border-signal/40 rounded-sm text-signal uppercase font-bold">{selected.type === "videogame" ? "Videogame" : "Board Game"}</span>
                  <span className="px-2 py-1 text-[9px] border border-border rounded-sm text-muted-foreground uppercase">{selected.genre}</span>
                  <span className="px-2 py-1 text-[9px] border border-border rounded-sm text-muted-foreground uppercase">{lang === "pt" ? selected.platform_pt : selected.platform_en}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl md:text-2xl font-bold text-phosphor">{selected.score}</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-phosphor uppercase tracking-widest mb-2 font-bold">+ {t("Prós", "Pros")}</div>
                    <ul className="space-y-1">
                      {(lang === "pt" ? selected.pros_pt : selected.pros_en).map((p) => (
                        <li key={p} className="text-[10px] md:text-xs text-foreground/70 flex items-start gap-1.5"><span className="text-phosphor mt-0.5">▸</span> {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] text-destructive uppercase tracking-widest mb-2 font-bold">− {t("Contras", "Cons")}</div>
                    <ul className="space-y-1">
                      {(lang === "pt" ? selected.cons_pt : selected.cons_en).map((c) => (
                        <li key={c} className="text-[10px] md:text-xs text-foreground/70 flex items-start gap-1.5"><span className="text-destructive mt-0.5">▸</span> {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameReviewsSection;
