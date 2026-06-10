import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useEducation } from "@/hooks/use-api";

const EducationSection = () => {
  const { lang, t } = useLang();
  const { data, isLoading } = useEducation();

  const fallback = [
    { id: 1, title_pt: "Análise e Desenvolvimento de Sistemas", title_en: "Systems Analysis and Development", institution: "Instituto Federal de São Paulo", period: "2022–2024", sort_order: 0 },
  ];

  const items = data && data.length > 0 ? data : fallback;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel-card p-5 md:p-6">
      <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
        <GraduationCap className="size-3" />
        {t("Formação", "Education")}
      </div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <GraduationCap className="size-4 text-signal mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm text-foreground font-bold">{lang === "pt" ? item.title_pt : item.title_en}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.institution} — {item.period}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EducationSection;
