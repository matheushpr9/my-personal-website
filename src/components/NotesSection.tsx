import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useNotes } from "@/hooks/use-api";

const colorStyles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  yellow: { bg: "#fef9c3", border: "#fde047", text: "#713f12", shadow: "rgba(253,224,71,0.3)" },
  pink:   { bg: "#fce7f3", border: "#f9a8d4", text: "#831843", shadow: "rgba(249,168,212,0.3)" },
  blue:   { bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e", shadow: "rgba(125,211,252,0.3)" },
  green:  { bg: "#dcfce7", border: "#86efac", text: "#14532d", shadow: "rgba(134,239,172,0.3)" },
  orange: { bg: "#ffedd5", border: "#fdba74", text: "#7c2d12", shadow: "rgba(253,186,116,0.3)" },
  purple: { bg: "#f3e8ff", border: "#d8b4fe", text: "#581c87", shadow: "rgba(216,180,254,0.3)" },
};

const NotesSection = () => {
  const { t } = useLang();
  const { data, isLoading } = useNotes();
  const [open, setOpen] = useState(false);

  const notes = data && data.length > 0 ? data : [];

  if (!isLoading && notes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      id="notes"
      className="panel-card"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <div className="size-1.5 rounded-full bg-border" />
        <div className="size-1.5 rounded-full bg-phosphor" />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <StickyNote className="size-3" />
          {t("Notas", "Notes")}
          {!isLoading && (
            <span className="text-[9px] text-muted-foreground/60">({notes.length})</span>
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
            key="notes-content"
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
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {notes.map((note) => {
                    const style = colorStyles[note.color] ?? colorStyles.yellow;
                    const rotation = ((note.id ?? 0) % 7) - 3;
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="break-inside-avoid block"
                        style={{
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: "2px",
                          padding: "16px",
                          boxShadow: `2px 3px 8px ${style.shadow}, 0 1px 2px rgba(0,0,0,0.1)`,
                          transform: `rotate(${rotation}deg)`,
                          position: "relative",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: style.border,
                            position: "absolute",
                            top: "8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          }}
                        />
                        <p
                          style={{
                            color: style.text,
                            fontSize: "12px",
                            lineHeight: "1.6",
                            fontFamily: "var(--font-mono, monospace)",
                            marginTop: "8px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {note.content}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotesSection;
