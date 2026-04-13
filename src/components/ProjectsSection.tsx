import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useProjects } from "@/hooks/use-api";

const ProjectsSection = () => {
  const { lang, t } = useLang();
  const { data, isLoading } = useProjects();

  const fallback = [
    { id: 1, name_pt: "Floov", name_en: "Floov", description_pt: "Plataforma escalável de gerenciamento de eventos com frontend React mobile-first e backend robusto para lidar com picos de tráfego.", description_en: "Scalable event management platform with mobile-first React frontend and robust backend designed for high-traffic spikes.", tags: ["React", "Mobile-first", "Events"], sort_order: 0 },
    { id: 2, name_pt: "TCC — Detecção de Ameaças com IA", name_en: "Capstone — AI Threat Detection", description_pt: "Sistema baseado em IA para detecção de ameaças em ambientes acadêmicos. Projeto de conclusão de curso no IFSP.", description_en: "AI-based system for threat detection in academic environments. Capstone project at IFSP.", tags: ["AI", "Python", "Computer Vision"], sort_order: 1 },
  ];

  const projects = data && data.length > 0 ? data : fallback;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel-card p-6">
      <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-6">{t("Projetos", "Projects")}</div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="group">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm text-foreground font-bold uppercase tracking-tighter group-hover:text-signal transition-colors">
                  {lang === "pt" ? project.name_pt : project.name_en}
                </h4>
                <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">{lang === "pt" ? project.description_pt : project.description_en}</p>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsSection;
