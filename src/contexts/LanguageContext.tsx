import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "pt" | "en";

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
  t: (pt: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("pt");

  const toggle = () => setLang((l) => (l === "pt" ? "en" : "pt"));
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
