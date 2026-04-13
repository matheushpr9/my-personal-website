import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useAbout, useSkills, useTools } from "@/hooks/use-api";

const AboutSection = () => {
  const { lang, t } = useLang();
  const about = useAbout();
  const skills = useSkills();
  const toolsQuery = useTools();

  const bio = about.data?.[0];
  const bioText = bio
    ? (lang === "pt" ? bio.bio_pt : bio.bio_en)
    : t(
        "Engenheiro de software fullstack com sólida experiência em Go, especializado em modernização de sistemas e-commerce complexos. Foco em Spec-Driven Development com IA (Amazon Q Developer + Claude).",
        "Fullstack software engineer with solid Go experience, specializing in modernizing complex e-commerce systems. Focus on Spec-Driven Development with AI (Amazon Q Developer + Claude)."
      );
  const yearsExp = bio?.years_experience || "+3";
  const location = bio?.location || "São Paulo, BR";

  const skillsFallback = [
    { id: 1, name: "Go", level: 95, label_pt: "Expert", label_en: "Expert", sort_order: 0 },
    { id: 2, name: "React/TypeScript", level: 80, label_pt: "Avançado", label_en: "Advanced", sort_order: 1 },
    { id: 3, name: "Python", level: 75, label_pt: "Avançado", label_en: "Advanced", sort_order: 2 },
    { id: 4, name: "Node.js", level: 70, label_pt: "Avançado", label_en: "Advanced", sort_order: 3 },
  ];
  const skillList = skills.data && skills.data.length > 0 ? skills.data : skillsFallback;

  const toolsFallback = ["Docker", "Kubernetes", "AWS", "Kafka", "PostgreSQL", "Redis", "Terraform", "gRPC"];
  const toolList = toolsQuery.data && toolsQuery.data.length > 0 ? toolsQuery.data.map((t) => t.name) : toolsFallback;

  return (
    <aside className="lg:col-span-4 space-y-4 md:space-y-6">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="panel-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-2 bg-phosphor rounded-full animate-pulse glow-phosphor" />
          <span className="text-[10px] text-phosphor uppercase tracking-widest font-bold">{t("Disponível", "Available")}</span>
        </div>
        <p className="text-xs md:text-sm leading-relaxed text-foreground font-display">{bioText}</p>
        <div className="pt-4 mt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] uppercase text-muted-foreground">{t("Experiência", "Experience")}</div>
            <div className="text-xs md:text-sm text-foreground">{yearsExp} {t("Anos", "Years")}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase text-muted-foreground">{t("Localização", "Location")}</div>
            <div className="text-xs md:text-sm text-foreground">{location}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="panel-card p-5 md:p-6">
        <div className="text-[10px] uppercase text-muted-foreground mb-4 tracking-widest">Stack</div>
        <div className="space-y-3">
          {skillList.map((skill) => (
            <div key={skill.id}>
              <div className="flex justify-between text-[10px] md:text-xs mb-1">
                <span className="text-foreground">{skill.name}</span>
                <span className={skill.level >= 90 ? "text-signal" : "text-muted-foreground"}>
                  {lang === "pt" ? skill.label_pt : skill.label_en}
                </span>
              </div>
              <div className="skill-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className={`skill-bar-fill ${skill.level >= 90 ? "bg-signal" : "bg-muted-foreground/40"}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="panel-card p-5 md:p-6">
        <div className="text-[10px] uppercase text-muted-foreground mb-4 tracking-widest">{t("Ferramentas", "Tools")}</div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {toolList.map((tool) => (
            <span key={tool} className="px-1.5 md:px-2 py-1 text-[9px] md:text-[10px] border border-border rounded-sm text-muted-foreground">{tool}</span>
          ))}
        </div>
      </motion.div>
    </aside>
  );
};

export default AboutSection;
