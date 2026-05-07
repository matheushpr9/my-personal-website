import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useProjects } from "@/hooks/use-api";

const ProjectsSection = () => {
  const { lang, t } = useLang();
  const { data, isLoading } = useProjects();

  const fallback = [
    { id: 1, name_pt: "Site de Casamento", name_en: "Wedding Website", description_pt: "Site personalizado para o casamento com convite digital, localizações, lista de presentes e todas as informações do evento.", description_en: "Custom wedding website with digital invitation, venue locations, gift registry, and all event details.", tags: ["React", "Vite", "Personal"], url: "https://laura-e-matheus.bymatheus.com.br/", sort_order: 0 },
    { id: 2, name_pt: "TCC — Detecção de Ameaças com IA", name_en: "Capstone — AI Threat Detection", description_pt: "Sistema baseado em IA para detecção de ameaças em ambientes acadêmicos. Projeto de conclusão de curso no IFSP.", description_en: "AI-based system for threat detection in academic environments. Capstone project at IFSP.", tags: ["AI", "Python", "Computer Vision"], url: "https://www.computersciencejournals.com/ijcit/archives/2024.v5.i2.B.97", sort_order: 1 },
  ];

  const projects = data && data.length > 0 ? data : fallback;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel-card p-6">
      <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-6">{t("Projetos", "Projects")}</div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const Wrapper = project.url ? "a" : "div";
            const wrapperProps = project.url ? { href: project.url, target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Wrapper key={project.id} {...wrapperProps} className="group block">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm text-foreground font-bold uppercase tracking-tighter group-hover:text-signal transition-colors">
                    {lang === "pt" ? project.name_pt : project.name_en}
                  </h4>
                  {project.url && <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{lang === "pt" ? project.description_pt : project.description_en}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 text-[8px] border border-border rounded-sm text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsSection;
