import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useExperiences } from "@/hooks/use-api";

const ExperienceSection = () => {
  const { lang, t } = useLang();
  const { data, isLoading } = useExperiences();

  const fallback = [
    { id: 1, period_pt: "06/2025 — Atual", period_en: "06/2025 — Present", title_pt: "Software Engineer II (Fullstack)", title_en: "Software Engineer II (Fullstack)", company: "DAFITI GROUP", description_pt: "Liderando migração técnica de sistemas legados PHP para microserviços em Go, integrando interfaces React modernas e otimizando comunicação via APIs RESTful/gRPC. Ownership end-to-end do ciclo de vida das aplicações.", description_en: "Leading technical migration of PHP legacy systems to Go microservices, integrating modern React interfaces and optimizing communication via RESTful/gRPC APIs. End-to-end ownership of application lifecycle.", tags: ["Go", "React", "gRPC", "Clean Architecture", "DDD"], active: true, sort_order: 0 },
    { id: 2, period_pt: "01/2023 — 05/2025", period_en: "01/2023 — 05/2025", title_pt: "Software Engineer I", title_en: "Software Engineer I", company: "DAFITI GROUP", description_pt: "Criação de ferramentas de automação e dashboards com Node.js, React e MySQL. Desenvolvimento de CLIs em Go com Cobra e goroutines para otimizar deploys.", description_en: "Created automation tools and dashboards with Node.js, React and MySQL. Developed Go CLIs with Cobra and goroutines to optimize deployments.", tags: ["Node.js", "React", "Go", "MySQL", "Jest"], active: false, sort_order: 1 },
    { id: 3, period_pt: "07/2021 — 01/2023", period_en: "07/2021 — 01/2023", title_pt: "Analista Supply Chain", title_en: "Supply Chain Analyst", company: "DAFITI GROUP", description_pt: "Desenvolvimento de aplicação web full-stack em Django para controle de qualidade e gestão de devoluções. Automação de processos logísticos com Python.", description_en: "Developed full-stack Django web app for quality control and returns management. Automated logistics processes with Python.", tags: ["Python", "Django", "Automation"], active: false, sort_order: 2 },
  ];

  const experiences = data && data.length > 0 ? data : fallback;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="experience" className="panel-card p-5 md:p-8">
      <div className="absolute left-3 md:left-4 top-16 bottom-4 w-px bg-signal/30" />
      <h2 className="text-base md:text-xl font-bold text-foreground uppercase tracking-tighter mb-6 md:mb-8">
        {t("Experiência_Profissional", "Professional_Experience")}
      </h2>
      {isLoading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <div className="space-y-8 md:space-y-12 relative">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-8 md:pl-12">
              <div className={`absolute top-1 ${exp.active ? "left-1.5 md:left-2.5 size-3 rounded-full bg-background border-2 border-signal glow-signal" : "left-2 md:left-3 size-2 rounded-full bg-muted-foreground/30"}`} />
              <div className={`text-[10px] font-bold mb-1 ${exp.active ? "text-signal" : "text-muted-foreground"}`}>
                {lang === "pt" ? exp.period_pt : exp.period_en}
              </div>
              <h3 className="text-sm md:text-lg font-bold text-foreground">{lang === "pt" ? exp.title_pt : exp.title_en}</h3>
              <div className="text-[10px] md:text-xs text-muted-foreground mb-2">{exp.company}</div>
              <p className="text-xs md:text-sm text-muted-foreground/80 max-w-xl mb-3">{lang === "pt" ? exp.description_pt : exp.description_en}</p>
              <div className="flex flex-wrap gap-1.5">
                {exp.tags.map((tag) => (
                  <span key={tag} className="px-1.5 md:px-2 py-0.5 text-[8px] md:text-[9px] border border-border rounded-sm text-muted-foreground uppercase tracking-tighter">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ExperienceSection;
