import { useLang } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Clock, Users, ChefHat, ChevronDown } from "lucide-react";
import { useRecipes, type Recipe } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";

const RecipesSection = () => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useRecipes();

  const fallback: Recipe[] = [
    { id: 1, emoji: "🍝", name_pt: "Carbonara Clássica", name_en: "Classic Carbonara", detail_pt: "Guanciale / Pecorino / Sem creme", detail_en: "Guanciale / Pecorino / No cream", tag_pt: "Italiana", tag_en: "Italian", prep_time: "25 min", servings: "2", ingredients_pt: ["200g guanciale", "400g spaghetti", "4 gemas", "100g Pecorino Romano", "Pimenta preta a gosto"], ingredients_en: ["200g guanciale", "400g spaghetti", "4 egg yolks", "100g Pecorino Romano", "Black pepper to taste"], steps_pt: ["Corte o guanciale em cubos e frite em fogo médio até dourar e ficar crocante.", "Cozinhe o spaghetti al dente. Reserve 1 xícara da água do cozimento.", "Misture as gemas com o Pecorino ralado e pimenta preta generosa.", "Fora do fogo, misture o spaghetti com o guanciale. Adicione a mistura de ovos e mexa rapidamente.", "Ajuste a cremosidade com a água do cozimento. Sirva imediatamente."], steps_en: ["Cut guanciale into cubes and fry on medium heat until golden and crispy.", "Cook spaghetti al dente. Reserve 1 cup of pasta water.", "Mix egg yolks with grated Pecorino and generous black pepper.", "Off heat, toss spaghetti with guanciale. Add egg mixture and toss quickly.", "Adjust creaminess with pasta water. Serve immediately."], sort_order: 0 },
    { id: 2, emoji: "🥩", name_pt: "Costela no Bafo", name_en: "Slow-Cooked Ribs", detail_pt: "12h fogo baixo / Molho BBQ caseiro", detail_en: "12h low heat / Homemade BBQ sauce", tag_pt: "BBQ", tag_en: "BBQ", prep_time: "12h", servings: "6", ingredients_pt: ["2kg costela bovina", "Sal grosso", "Alho em pó", "Páprica defumada", "Molho BBQ caseiro"], ingredients_en: ["2kg beef ribs", "Coarse salt", "Garlic powder", "Smoked paprika", "Homemade BBQ sauce"], steps_pt: ["Tempere a costela com sal grosso, alho em pó e páprica na véspera.", "Embrulhe em papel alumínio bem vedado.", "Leve ao forno a 120°C por 10-12 horas.", "Abra o alumínio, pincele com molho BBQ e gratine por 15 minutos."], steps_en: ["Season ribs with coarse salt, garlic powder and paprika the day before.", "Wrap tightly in aluminum foil.", "Bake at 120°C for 10-12 hours.", "Open foil, brush with BBQ sauce and broil for 15 minutes."], sort_order: 1 },
    { id: 3, emoji: "☕", name_pt: "V60 Precision Brew", name_en: "V60 Precision Brew", detail_pt: "22g / 340g H2O / 93°C", detail_en: "22g / 340g H2O / 93°C", tag_pt: "Café", tag_en: "Coffee", prep_time: "5 min", servings: "1", ingredients_pt: ["22g café moído médio-fino", "340g H2O @ 93°C", "Filtro V60 pré-lavado"], ingredients_en: ["22g medium-fine ground coffee", "340g H2O @ 93°C", "Pre-rinsed V60 filter"], steps_pt: ["Aqueça a água a 93°C. Lave o filtro com água quente.", "Adicione o café e faça o bloom com 60g de água por 45 segundos.", "Despeje em movimentos circulares até 340g total em 2:30 min.", "Tempo total de extração: ~3:30. Sirva e aprecie."], steps_en: ["Heat water to 93°C. Rinse filter with hot water.", "Add coffee and bloom with 60g water for 45 seconds.", "Pour in circular motions until 340g total in 2:30 min.", "Total brew time: ~3:30. Serve and enjoy."], sort_order: 2 },
  ];

  const recipes = data && data.length > 0 ? data : fallback;

  const searchFn = useCallback((r: Recipe, q: string) =>
    [r.name_pt, r.name_en, r.tag_pt, r.tag_en, r.detail_pt, r.detail_en].some((f) => f?.toLowerCase().includes(q)),
  []);

  const { search, onSearch, page, setPage, totalPages, paginated, total } = useSearchPagination(recipes, searchFn);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} id="recipes" className="panel-card">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5 md:p-6 text-left"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ChefHat className="size-3" />
            {t("Receitas", "Recipes")}
          </div>
          <ChevronDown
            className="size-3.5 text-muted-foreground transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="recipes-content"
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
                    <SearchPagination
                      search={search} onSearch={onSearch} page={page} setPage={setPage}
                      totalPages={totalPages} total={total}
                      placeholder={t("Buscar por nome, tag...", "Search by name, tag...")}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {paginated.map((recipe) => {
                        const name = lang === "pt" ? recipe.name_pt : recipe.name_en;
                        const tag = lang === "pt" ? recipe.tag_pt : recipe.tag_en;
                        const detail = lang === "pt" ? recipe.detail_pt : recipe.detail_en;
                        return (
                          <div
                            key={recipe.id}
                            onClick={() => setSelected(recipe)}
                            className="group cursor-pointer panel-card overflow-hidden hover:border-signal/40 transition-all duration-200"
                          >
                            {recipe.photo_path ? (
                              <img
                                src={`/api/recipes/${recipe.id}/photo`}
                                alt={name}
                                className="w-full h-32 object-cover"
                                loading="lazy"
                              />
                            ) : recipe.emoji ? (
                              <div className="w-full h-32 bg-gradient-to-br from-card to-input border-b border-border/40 flex items-center justify-center">
                                <span className="text-5xl leading-none select-none">{recipe.emoji}</span>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-input border-b border-border/40 flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest">{tag}</span>
                              </div>
                            )}

                            <div className="p-3.5">
                              <span className="inline-block text-[8px] px-1.5 py-0.5 bg-signal/8 border border-signal/20 rounded-sm text-signal/80 uppercase tracking-wider mb-2">
                                {tag}
                              </span>
                              <div className="text-[10px] font-bold uppercase tracking-tighter text-foreground group-hover:text-signal transition-colors line-clamp-2 mb-1.5">
                                {name}
                              </div>
                              <div className="text-[9px] text-muted-foreground/60 line-clamp-1 mb-3">
                                {detail}
                              </div>
                              <div className="flex items-center gap-3 text-[9px] text-muted-foreground/50">
                                <span className="flex items-center gap-1"><Clock className="size-2.5" />{recipe.prep_time}</span>
                                <span className="flex items-center gap-1"><Users className="size-2.5" />{recipe.servings}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {paginated.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">{t("Nenhuma receita encontrada.", "No recipes found.")}</p>
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const name = lang === "pt" ? selected.name_pt : selected.name_en;
            const tag = lang === "pt" ? selected.tag_pt : selected.tag_en;
            const ingredients = lang === "pt" ? selected.ingredients_pt : selected.ingredients_en;
            const steps = lang === "pt" ? selected.steps_pt : selected.steps_en;
            return (
              <>
                {selected.photo_path ? (
                  <img src={`/api/recipes/${selected.id}/photo`} alt={name} className="w-full h-48 object-cover" />
                ) : selected.emoji ? (
                  <div className="w-full h-36 bg-gradient-to-br from-card to-input flex items-center justify-center border-b border-border/40">
                    <span className="text-7xl leading-none select-none">{selected.emoji}</span>
                  </div>
                ) : (
                  <div className="w-full h-20 bg-input border-b border-border" />
                )}

                <div className="p-5 md:p-6 border-b border-border/60">
                  <span className="inline-block text-[8px] px-1.5 py-0.5 bg-signal/8 border border-signal/20 rounded-sm text-signal/80 uppercase tracking-wider mb-2">
                    {tag}
                  </span>
                  <DialogTitle className="text-base md:text-lg font-bold text-foreground uppercase tracking-tighter mb-3">
                    {name}
                  </DialogTitle>
                  <div className="flex gap-4 text-[10px] text-muted-foreground/70">
                    <span className="flex items-center gap-1.5"><Clock className="size-3" />{selected.prep_time}</span>
                    <span className="flex items-center gap-1.5"><Users className="size-3" />{selected.servings} {t("porções", "servings")}</span>
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-6">
                  <div>
                    <div className="text-[9px] text-signal uppercase tracking-widest mb-3 font-bold">{t("Ingredientes", "Ingredients")}</div>
                    <ul className="space-y-1.5">
                      {ingredients.map((ing, i) => (
                        <li key={i} className="text-[10px] md:text-xs text-foreground/75 flex items-start gap-2">
                          <span className="text-signal/60 mt-0.5 shrink-0">▸</span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-border/40 pt-6">
                    <div className="text-[9px] text-signal uppercase tracking-widest mb-3 font-bold">{t("Modo de Preparo", "Instructions")}</div>
                    <ol className="space-y-4">
                      {steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="size-5 shrink-0 rounded-sm border border-signal/30 bg-signal/5 text-[9px] text-signal font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-[10px] md:text-xs text-foreground/75 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipesSection;
