import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Clock, Users, ChefHat } from "lucide-react";
import { useRecipes, type Recipe } from "@/hooks/use-api";
import { useSearchPagination } from "@/hooks/use-search-pagination";
import SearchPagination from "./SearchPagination";

const RecipesSection = () => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Recipe | null>(null);
  const { data, isLoading } = useRecipes();

  const fallback: Recipe[] = [
    { id: 1, emoji: "🍝", name_pt: "Carbonara Clássica", name_en: "Classic Carbonara", detail_pt: "Guanciale / Pecorino / Sem creme", detail_en: "Guanciale / Pecorino / No cream", tag_pt: "Italiana", tag_en: "Italian", prep_time: "25 min", servings: "2", difficulty_pt: "Médio", difficulty_en: "Medium", ingredients_pt: ["200g guanciale", "400g spaghetti", "4 gemas", "100g Pecorino Romano", "Pimenta preta a gosto"], ingredients_en: ["200g guanciale", "400g spaghetti", "4 egg yolks", "100g Pecorino Romano", "Black pepper to taste"], steps_pt: ["Corte o guanciale em cubos e frite em fogo médio até dourar e ficar crocante.", "Cozinhe o spaghetti al dente. Reserve 1 xícara da água do cozimento.", "Misture as gemas com o Pecorino ralado e pimenta preta generosa.", "Fora do fogo, misture o spaghetti com o guanciale. Adicione a mistura de ovos e mexa rapidamente.", "Ajuste a cremosidade com a água do cozimento. Sirva imediatamente."], steps_en: ["Cut guanciale into cubes and fry on medium heat until golden and crispy.", "Cook spaghetti al dente. Reserve 1 cup of pasta water.", "Mix egg yolks with grated Pecorino and generous black pepper.", "Off heat, toss spaghetti with guanciale. Add egg mixture and toss quickly.", "Adjust creaminess with pasta water. Serve immediately."], sort_order: 0 },
    { id: 2, emoji: "🍖", name_pt: "Costela no Bafo", name_en: "Slow-Cooked Ribs", detail_pt: "12h fogo baixo / Molho BBQ caseiro", detail_en: "12h low heat / Homemade BBQ sauce", tag_pt: "BBQ", tag_en: "BBQ", prep_time: "12h", servings: "6", difficulty_pt: "Fácil", difficulty_en: "Easy", ingredients_pt: ["2kg costela bovina", "Sal grosso", "Alho em pó", "Páprica defumada", "Molho BBQ caseiro"], ingredients_en: ["2kg beef ribs", "Coarse salt", "Garlic powder", "Smoked paprika", "Homemade BBQ sauce"], steps_pt: ["Tempere a costela com sal grosso, alho em pó e páprica na véspera.", "Embrulhe em papel alumínio bem vedado.", "Leve ao forno a 120°C por 10-12 horas.", "Abra o alumínio, pincele com molho BBQ e gratine por 15 minutos."], steps_en: ["Season ribs with coarse salt, garlic powder and paprika the day before.", "Wrap tightly in aluminum foil.", "Bake at 120°C for 10-12 hours.", "Open foil, brush with BBQ sauce and broil for 15 minutes."], sort_order: 1 },
    { id: 3, emoji: "☕", name_pt: "V60 Precision Brew", name_en: "V60 Precision Brew", detail_pt: "22g / 340g H2O / 93°C", detail_en: "22g / 340g H2O / 93°C", tag_pt: "Café", tag_en: "Coffee", prep_time: "5 min", servings: "1", difficulty_pt: "Médio", difficulty_en: "Medium", ingredients_pt: ["22g café moído médio-fino", "340g H2O @ 93°C", "Filtro V60 pré-lavado"], ingredients_en: ["22g medium-fine ground coffee", "340g H2O @ 93°C", "Pre-rinsed V60 filter"], steps_pt: ["Aqueça a água a 93°C. Lave o filtro com água quente.", "Adicione o café e faça o bloom com 60g de água por 45 segundos.", "Despeje em movimentos circulares até 340g total em 2:30 min.", "Tempo total de extração: ~3:30. Sirva e aprecie."], steps_en: ["Heat water to 93°C. Rinse filter with hot water.", "Add coffee and bloom with 60g water for 45 seconds.", "Pour in circular motions until 340g total in 2:30 min.", "Total brew time: ~3:30. Serve and enjoy."], sort_order: 2 },
  ];

  const recipes = data && data.length > 0 ? data : fallback;

  const searchFn = useCallback((r: Recipe, q: string) =>
    [r.name_pt, r.name_en, r.tag_pt, r.tag_en, r.emoji, r.detail_pt, r.detail_en].some((f) => f.toLowerCase().includes(q)),
  []);

  const { search, onSearch, page, setPage, totalPages, paginated, total } = useSearchPagination(recipes, searchFn);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} id="recipes" className="panel-card p-5 md:p-6">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 md:mb-6">{t("Receitas", "Recipes")}</div>

        {isLoading ? (
          <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
        ) : (
          <>
            <SearchPagination
              search={search} onSearch={onSearch} page={page} setPage={setPage}
              totalPages={totalPages} total={total}
              placeholder={t("Buscar por nome, tag, ingrediente...", "Search by name, tag, ingredient...")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {paginated.map((recipe) => (
                <div key={recipe.id} onClick={() => setSelected(recipe)} className="group cursor-pointer panel-card p-4 hover:border-signal/40 transition-all">
                  <div className="text-2xl md:text-3xl mb-3">{recipe.emoji}</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] md:text-xs text-foreground font-bold uppercase tracking-tighter group-hover:text-signal transition-colors">
                      {lang === "pt" ? recipe.name_pt : recipe.name_en}
                    </span>
                  </div>
                  <span className="inline-block text-[8px] px-1.5 py-0.5 border border-border rounded-sm text-muted-foreground uppercase mb-2">
                    {lang === "pt" ? recipe.tag_pt : recipe.tag_en}
                  </span>
                  <div className="text-[9px] text-muted-foreground">{lang === "pt" ? recipe.detail_pt : recipe.detail_en}</div>
                  <div className="flex items-center gap-3 mt-3 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-2.5" /> {recipe.prep_time}</span>
                    <span className="flex items-center gap-1"><Users className="size-2.5" /> {recipe.servings}</span>
                  </div>
                  <div className="text-[8px] text-signal/60 mt-3 uppercase tracking-widest group-hover:text-signal transition-colors">→ {t("Ver receita", "View recipe")}</div>
                </div>
              ))}
            </div>

            {paginated.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{t("Nenhuma receita encontrada.", "No recipes found.")}</p>
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
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl md:text-3xl">{selected.emoji}</span>
                  <div>
                    <DialogTitle className="text-lg md:text-xl font-bold text-foreground uppercase tracking-tighter">
                      {lang === "pt" ? selected.name_pt : selected.name_en}
                    </DialogTitle>
                    <span className="text-[9px] px-2 py-0.5 border border-border rounded-sm text-muted-foreground uppercase">
                      {lang === "pt" ? selected.tag_pt : selected.tag_en}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-[10px] md:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="size-3" /> {selected.prep_time}</span>
                  <span className="flex items-center gap-1.5"><Users className="size-3" /> {selected.servings} {t("porções", "servings")}</span>
                  <span className="flex items-center gap-1.5"><ChefHat className="size-3" /> {lang === "pt" ? selected.difficulty_pt : selected.difficulty_en}</span>
                </div>
              </div>
              <div className="p-5 md:p-6 space-y-5">
                <div>
                  <div className="text-[10px] text-signal uppercase tracking-widest mb-3 font-bold">{t("Ingredientes", "Ingredients")}</div>
                  <ul className="space-y-1.5">
                    {(lang === "pt" ? selected.ingredients_pt : selected.ingredients_en).map((ing, i) => (
                      <li key={i} className="text-[10px] md:text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-signal mt-0.5">▸</span> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] text-signal uppercase tracking-widest mb-3 font-bold">{t("Modo de Preparo", "Instructions")}</div>
                  <ol className="space-y-3">
                    {(lang === "pt" ? selected.steps_pt : selected.steps_en).map((step, i) => (
                      <li key={i} className="text-[10px] md:text-xs text-foreground/80 flex items-start gap-3">
                        <span className="text-[10px] text-signal font-bold shrink-0 w-4 text-right">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-display">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipesSection;
