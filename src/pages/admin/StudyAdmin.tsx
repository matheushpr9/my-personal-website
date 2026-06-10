import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ExternalLink, Edit2, Check, X } from "lucide-react";
import { useStudy, type StudyTopic, type StudyLink, type StudyNote } from "@/hooks/use-api";

const COLORS = ["blue", "green", "purple", "orange", "red", "yellow"] as const;
type Color = typeof COLORS[number];

const COLOR_STYLES: Record<Color, { dot: string; active: string; border: string }> = {
  blue:   { dot: "bg-blue-500",   active: "bg-blue-500/10 border-blue-400 text-blue-400",   border: "border-blue-400" },
  green:  { dot: "bg-green-500",  active: "bg-green-500/10 border-green-400 text-green-400",  border: "border-green-400" },
  purple: { dot: "bg-purple-500", active: "bg-purple-500/10 border-purple-400 text-purple-400",border: "border-purple-400" },
  orange: { dot: "bg-orange-500", active: "bg-orange-500/10 border-orange-400 text-orange-400",border: "border-orange-400" },
  red:    { dot: "bg-red-500",    active: "bg-red-500/10 border-red-400 text-red-400",    border: "border-red-400" },
  yellow: { dot: "bg-yellow-500", active: "bg-yellow-500/10 border-yellow-400 text-yellow-400",border: "border-yellow-400" },
};

// Inline editable text
function Editable({
  value,
  onSave,
  className = "",
  multiline = false,
  placeholder = "Editar...",
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => { if (draft.trim() !== value) onSave(draft.trim()); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value); setEditing(true); }}
        className={`cursor-text hover:text-signal transition-colors group/edit ${className}`}
        title="Clique para editar"
      >
        {value || <span className="opacity-40 italic">{placeholder}</span>}
        <Edit2 className="inline size-2.5 ml-1 opacity-0 group-hover/edit:opacity-40 transition-opacity" />
      </span>
    );
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") cancel();
  };

  const sharedProps = {
    ref: ref as any,
    value: draft,
    onChange: (e: React.ChangeEvent<any>) => setDraft(e.target.value),
    onKeyDown,
    onBlur: commit,
    placeholder,
    className: `w-full bg-input border border-signal/40 rounded-sm px-2 py-1 text-xs text-foreground focus:outline-none resize-none ${className}`,
  };

  return multiline
    ? <textarea {...sharedProps} rows={3} />
    : <input {...sharedProps} type="text" />;
}

// New topic form
function NewTopicForm({ onCreate }: { onCreate: (name: string, color: Color) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<Color>("blue");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
    setName("");
  };

  return (
    <div className="border-t border-border pt-3 space-y-2">
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`size-4 rounded-full ${COLOR_STYLES[c].dot} ring-offset-1 transition-all ${color === c ? "ring-2 ring-signal" : "opacity-50 hover:opacity-100"}`}
          />
        ))}
      </div>
      <div className="flex gap-1">
        <input
          className="flex-1 bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-signal/50"
          placeholder="Nome do tópico..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="bg-signal text-primary-foreground px-2.5 py-1.5 rounded-sm text-xs font-bold disabled:opacity-40"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  );
}

// Quick-add link form
function AddLinkForm({ onAdd }: { onAdd: (title: string, url: string, desc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    if (!title.trim() || !url.trim()) return;
    onAdd(title.trim(), url.trim(), desc.trim());
    setTitle(""); setUrl(""); setDesc(""); setOpen(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground hover:text-signal border border-border hover:border-signal/40 rounded-sm px-2 py-1 transition-colors"
    >
      <Plus className="size-2.5" /> Link
    </button>
  );

  return (
    <div className="border border-signal/30 rounded-sm p-3 space-y-2 bg-input/30">
      <input className="w-full bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-signal/50" placeholder="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="w-full bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-signal/50" placeholder="URL *" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input className="w-full bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-signal/50" placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <div className="flex gap-1.5">
        <button onClick={submit} disabled={!title.trim() || !url.trim()} className="flex items-center gap-1 bg-signal text-primary-foreground px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase disabled:opacity-40">
          <Check className="size-2.5" /> Salvar
        </button>
        <button onClick={() => setOpen(false)} className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground border border-border rounded-sm px-3 py-1.5 hover:border-destructive/40 hover:text-destructive transition-colors">
          <X className="size-2.5" /> Cancelar
        </button>
      </div>
    </div>
  );
}

// Quick-add note form
function AddNoteForm({ onAdd }: { onAdd: (content: string) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const submit = () => {
    if (!content.trim()) return;
    onAdd(content.trim());
    setContent(""); setOpen(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground hover:text-signal border border-border hover:border-signal/40 rounded-sm px-2 py-1 transition-colors"
    >
      <Plus className="size-2.5" /> Nota
    </button>
  );

  return (
    <div className="border border-signal/30 rounded-sm p-3 space-y-2 bg-input/30">
      <textarea
        className="w-full bg-input border border-border rounded-sm px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-signal/50 resize-none"
        placeholder="Escreva sua anotação..."
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submit(); }}
      />
      <div className="flex gap-1.5 items-center">
        <button onClick={submit} disabled={!content.trim()} className="flex items-center gap-1 bg-signal text-primary-foreground px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase disabled:opacity-40">
          <Check className="size-2.5" /> Salvar
        </button>
        <button onClick={() => setOpen(false)} className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground border border-border rounded-sm px-3 py-1.5 hover:border-destructive/40 hover:text-destructive transition-colors">
          <X className="size-2.5" /> Cancelar
        </button>
        <span className="text-[8px] text-muted-foreground/50 ml-1">Ctrl+Enter para salvar</span>
      </div>
    </div>
  );
}

const StudyAdmin = () => {
  const study = useStudy();
  const topics = study.data ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = topics.find((t) => t.id === selectedId) ?? topics[0] ?? null;

  const c = selected ? (COLOR_STYLES[selected.color as Color] ?? COLOR_STYLES.blue) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left: topic list */}
      <div className="panel-card p-4 space-y-2 md:col-span-1">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Tópicos</h3>

        {topics.map((topic) => {
          const tc = COLOR_STYLES[topic.color as Color] ?? COLOR_STYLES.blue;
          const isSelected = topic.id === (selected?.id);
          return (
            <div
              key={topic.id}
              onClick={() => setSelectedId(topic.id!)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border cursor-pointer transition-colors ${
                isSelected ? tc.active : "border-border hover:border-signal/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`size-2 rounded-full shrink-0 ${tc.dot}`} />
              <span className="flex-1 text-xs font-bold uppercase tracking-tighter truncate">{topic.name}</span>
              <span className="text-[8px] opacity-50">{topic.links.length + topic.notes.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); study.deleteTopic.mutate(topic.id!); if (selected?.id === topic.id) setSelectedId(null); }}
                className="opacity-0 hover:opacity-100 text-destructive/60 hover:text-destructive transition-all p-0.5 rounded"
              >
                <Trash2 className="size-2.5" />
              </button>
            </div>
          );
        })}

        {topics.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic py-2">Nenhum tópico ainda.</p>
        )}

        <NewTopicForm
          onCreate={(name, color) =>
            study.createTopic.mutate({ name, color, description: "", sort_order: topics.length })
          }
        />
      </div>

      {/* Right: topic content */}
      <div className="panel-card p-5 md:col-span-2">
        {!selected ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[10px] text-muted-foreground/50">Selecione ou crie um tópico.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Topic header */}
            <div className={`flex items-center gap-3 pb-4 border-b ${c!.border} border-opacity-30`} style={{ borderBottomColor: undefined }}>
              <span className={`size-3 rounded-full ${c!.dot}`} />
              <div className="flex-1 min-w-0">
                <Editable
                  value={selected.name}
                  onSave={(v) => study.updateTopic.mutate({ ...selected, id: selected.id!, name: v })}
                  className="text-sm font-bold uppercase tracking-tighter text-foreground"
                  placeholder="Nome do tópico"
                />
                <Editable
                  value={selected.description}
                  onSave={(v) => study.updateTopic.mutate({ ...selected, id: selected.id!, description: v })}
                  className="text-[10px] text-muted-foreground mt-0.5 block"
                  placeholder="Descrição opcional..."
                />
              </div>
              {/* Color picker */}
              <div className="flex gap-1">
                {COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => study.updateTopic.mutate({ ...selected, id: selected.id!, color: col })}
                    className={`size-3.5 rounded-full ${COLOR_STYLES[col].dot} ring-offset-1 transition-all ${selected.color === col ? "ring-2 ring-signal" : "opacity-40 hover:opacity-80"}`}
                  />
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                  Links ({selected.links.length})
                </span>
                <AddLinkForm
                  onAdd={(title, url, desc) =>
                    study.createLink.mutate({
                      topicId: selected.id!,
                      topic_id: selected.id!,
                      title, url,
                      description: desc,
                      sort_order: selected.links.length,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                {selected.links.map((link) => (
                  <div key={link.id} className="flex items-start gap-2 p-2.5 border border-border rounded-sm group hover:border-signal/30 transition-colors">
                    <div className={`size-1.5 rounded-full mt-1.5 shrink-0 ${c!.dot}`} />
                    <div className="flex-1 min-w-0">
                      <Editable
                        value={link.title}
                        onSave={(v) => study.updateLink.mutate({ ...link, title: v })}
                        className="text-[10px] font-bold text-foreground"
                        placeholder="Título"
                      />
                      <Editable
                        value={link.url}
                        onSave={(v) => study.updateLink.mutate({ ...link, url: v })}
                        className="text-[9px] text-signal/70 truncate block"
                        placeholder="URL"
                      />
                      {link.description && (
                        <Editable
                          value={link.description}
                          onSave={(v) => study.updateLink.mutate({ ...link, description: v })}
                          className="text-[9px] text-muted-foreground"
                          placeholder="Descrição"
                        />
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1 text-muted-foreground hover:text-signal">
                        <ExternalLink className="size-3" />
                      </a>
                      <button onClick={() => study.deleteLink.mutate(link.id!)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {selected.links.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 italic py-1">Nenhum link. Adicione um acima.</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                  Notas ({selected.notes.length})
                </span>
                <AddNoteForm
                  onAdd={(content) =>
                    study.createNote.mutate({
                      topicId: selected.id!,
                      topic_id: selected.id!,
                      content,
                      sort_order: selected.notes.length,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                {selected.notes.map((note) => (
                  <div key={note.id} className="group flex gap-2 p-3 border border-border rounded-sm bg-input/30 hover:border-signal/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <Editable
                        value={note.content}
                        onSave={(v) => study.updateNote.mutate({ ...note, content: v })}
                        className="text-[10px] text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap block w-full"
                        multiline
                        placeholder="Anotação..."
                      />
                    </div>
                    <button
                      onClick={() => study.deleteNote.mutate(note.id!)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                {selected.notes.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 italic py-1">Nenhuma nota. Adicione uma acima.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyAdmin;
