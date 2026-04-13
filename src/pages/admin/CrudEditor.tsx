import { useState } from "react";
import { Trash2, Plus, Save, X } from "lucide-react";

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select" | "json-array";
  options?: { value: string; label: string }[];
}

interface Props<T> {
  title: string;
  fields: FieldDef[];
  data: T[] | undefined;
  isLoading: boolean;
  onCreate: (item: any) => void;
  onUpdate: (item: any) => void;
  onDelete: (id: number) => void;
}

function CrudEditor<T extends { id?: number }>({ title, fields, data, isLoading, onCreate, onUpdate, onDelete }: Props<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);

  const empty = fields.reduce((acc, f) => {
    if (f.type === "number") acc[f.key] = 0;
    else if (f.type === "boolean") acc[f.key] = false;
    else if (f.type === "json-array") acc[f.key] = [];
    else acc[f.key] = "";
    return acc;
  }, {} as any);

  const startNew = () => { setEditing({ ...empty } as T); setIsNew(true); };
  const startEdit = (item: T) => { setEditing({ ...item }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing) return;
    if (isNew) onCreate(editing);
    else onUpdate(editing);
    cancel();
  };

  const setField = (key: string, value: any) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const renderField = (f: FieldDef) => {
    const val = (editing as any)?.[f.key];
    const cls = "w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground";

    if (f.type === "boolean") {
      return (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={!!val} onChange={(e) => setField(f.key, e.target.checked)} />
          {f.label}
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <select className={cls} value={val || ""} onChange={(e) => setField(f.key, e.target.value)}>
          <option value="">--</option>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === "textarea") {
      return <textarea className={cls} rows={3} value={val || ""} onChange={(e) => setField(f.key, e.target.value)} />;
    }
    if (f.type === "json-array") {
      const arr: string[] = Array.isArray(val) ? val : [];
      return (
        <div className="space-y-1">
          {arr.map((item, i) => (
            <div key={i} className="flex gap-1">
              <input className={cls} value={item} onChange={(e) => {
                const next = [...arr]; next[i] = e.target.value; setField(f.key, next);
              }} />
              <button type="button" className="text-destructive p-1" onClick={() => setField(f.key, arr.filter((_, j) => j !== i))}>
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button type="button" className="text-[10px] text-signal uppercase" onClick={() => setField(f.key, [...arr, ""])}>
            + Add item
          </button>
        </div>
      );
    }
    if (f.type === "number") {
      return <input className={cls} type="number" value={val ?? 0} onChange={(e) => setField(f.key, Number(e.target.value))} />;
    }
    return <input className={cls} value={val || ""} onChange={(e) => setField(f.key, e.target.value)} />;
  };

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading...</div>;

  return (
    <div className="panel-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-foreground">{title}</h2>
        <button onClick={startNew} className="flex items-center gap-1 text-[10px] text-signal uppercase font-bold">
          <Plus className="size-3" /> New
        </button>
      </div>

      {editing && (
        <div className="border border-signal/30 rounded-sm p-4 space-y-3 bg-input/30">
          {fields.map((f) => (
            <div key={f.key}>
              {f.type !== "boolean" && (
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 block">{f.label}</label>
              )}
              {renderField(f)}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex items-center gap-1 bg-signal text-primary-foreground px-3 py-1.5 rounded-sm text-xs font-bold uppercase">
              <Save className="size-3" /> Save
            </button>
            <button onClick={cancel} className="flex items-center gap-1 border border-border px-3 py-1.5 rounded-sm text-xs text-muted-foreground uppercase">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between border border-border rounded-sm p-3">
            <div className="text-xs text-foreground truncate flex-1">
              <span className="text-muted-foreground mr-2">#{item.id}</span>
              {item.name || item.title || item.name_pt || item.title_pt || item.bio_pt?.slice(0, 60) || JSON.stringify(item).slice(0, 60)}
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              <button onClick={() => startEdit(item)} className="text-[10px] text-signal uppercase px-2 py-1 border border-signal/30 rounded-sm">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="text-destructive p-1">
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-xs text-muted-foreground">No items yet.</p>}
      </div>
    </div>
  );
}

export default CrudEditor;
