import { useLang } from "@/contexts/LanguageContext";
import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="max-w-7xl mx-auto mt-4 md:mt-6 panel-card p-3 md:p-4 flex items-center justify-between flex-wrap gap-3 md:gap-4">
      <div className="text-[8px] md:text-[9px] text-muted-foreground/40 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase">
        © 2025 Matheus_Ptasinski
      </div>
      <div className="flex gap-4 md:gap-6">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-signal transition-colors flex items-center gap-1.5">
          <Github className="size-3" />
          <span className="text-[8px] md:text-[9px] uppercase tracking-widest">GitHub</span>
        </a>
        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-signal transition-colors flex items-center gap-1.5">
          <Linkedin className="size-3" />
          <span className="text-[8px] md:text-[9px] uppercase tracking-widest">LinkedIn</span>
        </a>
        <a href="mailto:matheushpr9@gmail.com" className="text-muted-foreground hover:text-signal transition-colors flex items-center gap-1.5">
          <Mail className="size-3" />
          <span className="text-[8px] md:text-[9px] uppercase tracking-widest">Email</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
