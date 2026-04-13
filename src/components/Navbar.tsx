import { useLang } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { lang, toggle, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="max-w-7xl mx-auto mb-6">
      <div className="flex items-stretch gap-3 md:gap-4 h-16 md:h-20">
        <div className="panel-card flex-1 p-3 md:p-4 flex items-center justify-between overflow-hidden">
          <div className="absolute top-2 left-2 screw hidden md:block" />
          <div className="absolute top-2 right-2 screw hidden md:block" />

          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <div className="size-8 md:size-10 bg-signal rounded-sm flex items-center justify-center font-bold text-primary-foreground text-base md:text-xl glow-signal shrink-0">
              MP
            </div>
            <div className="min-w-0">
              <h1 className="text-foreground font-bold uppercase tracking-tighter text-xs md:text-base truncate">
                Matheus_Ptasinski
              </h1>
              <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                {t("Engenheiro Fullstack / Especialista Go", "Fullstack Engineer / Go Specialist")}
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
            <button onClick={() => scrollTo("experience")} className="text-foreground hover:text-signal transition-colors">
              {t("Experiência", "Experience")}
            </button>
            <button onClick={() => scrollTo("books")} className="text-foreground hover:text-signal transition-colors">
              {t("Livros", "Books")}
            </button>
            <button onClick={() => scrollTo("games")} className="text-foreground hover:text-signal transition-colors">
              Games
            </button>
            <button onClick={() => scrollTo("recipes")} className="text-foreground hover:text-signal transition-colors">
              {t("Receitas", "Recipes")}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground p-1 shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div className="panel-card w-24 md:w-48 p-2 md:p-4 flex flex-col justify-between shrink-0">
          <div className="text-[8px] md:text-[9px] uppercase tracking-tighter text-muted-foreground">
            {t("Idioma", "Language")}
          </div>
          <div className="flex bg-input rounded-sm p-0.5 md:p-1 mt-1">
            <button
              onClick={() => lang !== "pt" && toggle()}
              className={`flex-1 text-center py-1 text-[9px] md:text-[10px] rounded-sm transition-colors ${
                lang === "pt" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => lang !== "en" && toggle()}
              className={`flex-1 text-center py-1 text-[9px] md:text-[10px] rounded-sm transition-colors ${
                lang === "en" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden panel-card mt-2 p-4 flex flex-col gap-3">
          <button onClick={() => scrollTo("experience")} className="text-left text-xs font-bold uppercase tracking-widest text-foreground hover:text-signal transition-colors">
            {t("Experiência", "Experience")}
          </button>
          <button onClick={() => scrollTo("books")} className="text-left text-xs font-bold uppercase tracking-widest text-foreground hover:text-signal transition-colors">
            {t("Livros", "Books")}
          </button>
          <button onClick={() => scrollTo("games")} className="text-left text-xs font-bold uppercase tracking-widest text-foreground hover:text-signal transition-colors">
            Games
          </button>
          <button onClick={() => scrollTo("recipes")} className="text-left text-xs font-bold uppercase tracking-widest text-foreground hover:text-signal transition-colors">
            {t("Receitas", "Recipes")}
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
