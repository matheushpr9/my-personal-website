import { motion, AnimatePresence } from "framer-motion";
import { BookOpenCheck, ChevronDown, ExternalLink, FileText, Link2 } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useStudy, type StudyTopic } from "@/hooks/use-api";

const COLORS: Record<string, { dot: string; tab: string; tabActive: string }> = {
  blue:   { dot: "bg-blue-500",   tab: "border-border text-muted-foreground hover:border-blue-400/60 hover:text-blue-400",   tabActive: "border-blue-400 text-blue-400 bg-blue-400/10" },
  green:  { dot: "bg-green-500",  tab: "border-border text-muted-foreground hover:border-green-400/60 hover:text-green-400",  tabActive: "border-green-400 text-green-400 bg-green-400/10" },
  purple: { dot: "bg-purple-500", tab: "border-border text-muted-foreground hover:border-purple-400/60 hover:text-purple-400",tabActive: "border-purple-400 text-purple-400 bg-purple-400/10" },
  orange: { dot: "bg-orange-500", tab: "border-border text-muted-foreground hover:border-orange-400/60 hover:text-orange-400",tabActive: "border-orange-400 text-orange-400 bg-orange-400/10" },
  red:    { dot: "bg-red-500",    tab: "border-border text-muted-foreground hover:border-red-400/60 hover:text-red-400",     tabActive: "border-red-400 text-red-400 bg-red-400/10" },
  yellow: { dot: "bg-yellow-500", tab: "border-border text-muted-foreground hover:border-yellow-400/60 hover:text-yellow-400",tabActive: "border-yellow-400 text-yellow-400 bg-yellow-400/10" },
};

function TopicContent({ topic }: { topic: StudyTopic }) {
  const c = COLORS[topic.color] ?? COLORS.blue;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Links */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="size-3 text-muted-foreground" />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
            Links ({topic.links.length})
          </span>
        </div>
        {topic.links.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 italic">Nenhum link ainda.</p>
        ) : (
          <div className="space-y-2">
            {topic.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 p-2.5 rounded-sm border border-border hover:border-signal/40 group transition-colors"
              >
                <div className={`size-1.5 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-foreground group-hover:text-signal transition-colors flex items-center gap-1">
                    {link.title}
                    <ExternalLink className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {link.description && (
                    <div className="text-[9px] text-muted-foreground mt-0.5 truncate">{link.description}</div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-3 text-muted-foreground" />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
            Notas ({topic.notes.length})
          </span>
        </div>
        {topic.notes.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 italic">Nenhuma nota ainda.</p>
        ) : (
          <div className="space-y-2">
            {topic.notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-sm border border-border bg-input/40"
              >
                <p className="text-[10px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const StudySection = () => {
  const { t } = useLang();
  const { data, isLoading } = useStudy();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const topics = data ?? [];
  const totalLinks = topics.reduce((s, t) => s + t.links.length, 0);
  const totalNotes = topics.reduce((s, t) => s + t.notes.length, 0);

  if (!isLoading && topics.length === 0) return null;

  const active = topics[activeTab] ?? topics[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      id="study"
      className="panel-card"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <div className="size-1.5 rounded-full bg-border" />
        <div className="size-1.5 rounded-full bg-signal" />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <BookOpenCheck className="size-3" />
          {t("Estudos", "Study")}
          {!isLoading && topics.length > 0 && (
            <span className="text-[9px] text-muted-foreground/60">
              ({topics.length} {t("tópico(s)", "topic(s)")} · {totalLinks} links · {totalNotes} {t("nota(s)", "note(s)")})
            </span>
          )}
        </div>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="study-content"
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
                  {/* Topic tabs */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {topics.map((topic, idx) => {
                      const c = COLORS[topic.color] ?? COLORS.blue;
                      const isActive = idx === activeTab;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => setActiveTab(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border transition-colors ${
                            isActive ? c.tabActive : c.tab
                          }`}
                        >
                          <span className={`size-1.5 rounded-full shrink-0 ${c.dot}`} />
                          {topic.name}
                          <span className="text-[8px] opacity-60">
                            {topic.links.length + topic.notes.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active topic */}
                  {active && (
                    <div>
                      {active.description && (
                        <p className="text-[10px] text-muted-foreground mb-4 italic">{active.description}</p>
                      )}
                      <TopicContent topic={active} />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudySection;
