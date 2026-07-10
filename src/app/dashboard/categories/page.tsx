"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Check, Loader2, Tag } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
}

const PRESET_COLORS = [
  "#C8F135", "#111111", "#6366F1", "#F59E0B", "#EF4444",
  "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F97316",
];

const emptyForm = { name: "", color: "#C8F135", description: "" };

export default function CategoriesPage() {
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [submitting, setSubmitting]   = useState(false);

  const fetch_ = async () => {
    try {
      setLoading(true);
      setCategories(await (await fetch("/api/categories")).json());
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c: Category) => {
    setEditId(c._id);
    setForm({ name: c.name, color: c.color, description: c.description });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      toast.success(editId ? "Category updated." : "Category created.");
      setShowForm(false);
      fetch_();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setSubmitting(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Projects using it won't be affected.`)) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Deleted.");
      setCategories(c => c.filter(x => x._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Categories</p>
          <h1 className="text-3xl font-bold tracking-tightest text-ink">Project Categories</h1>
          <p className="text-ink-3 text-sm mt-1">
            {loading ? "Loading…" : `${categories.length} custom categor${categories.length !== 1 ? "ies" : "y"}`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={14} strokeWidth={2.5} /> New category
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl p-4 bg-surface border border-edge flex items-start gap-3">
        <Tag size={16} className="text-ink-3 mt-0.5 shrink-0" strokeWidth={2} />
        <div>
          <p className="text-ink text-sm font-semibold">Custom categories</p>
          <p className="text-ink-3 text-xs mt-0.5">
            Create your own categories to organise projects beyond the defaults. These appear as filter options on your public portfolio.
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-ink text-base">{editId ? "Edit category" : "New category"}</p>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5">
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Name *</label>
              <input
                className="input-base"
                placeholder="e.g. Freelance, Hackathon, Client Work…"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Description</label>
              <input
                className="input-base"
                placeholder="Optional short description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-2">Color</label>
              <div className="flex flex-wrap gap-2 items-center">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-xl transition-transform hover:scale-110 ${
                      form.color === color ? "ring-2 ring-offset-2 ring-ink scale-110" : ""
                    }`}
                    style={{ background: color, border: color === "#FFFFFF" ? "1px solid #E2E2DC" : "none" }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-8 h-8 rounded-xl cursor-pointer border border-edge overflow-hidden"
                  title="Custom color"
                />
              </div>

              {/* Preview badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-ink-3 text-xs">Preview:</span>
                <span
                  className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: form.color + "20",
                    color: form.color === "#C8F135" || form.color === "#FFFFFF" ? "#111" : form.color,
                    border: `1px solid ${form.color}40`,
                  }}
                >
                  {form.name || "Category Name"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
              {submitting ? "Saving…" : editId ? "Save changes" : "Create category"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Category list */}
      {loading ? (
        <div className="card overflow-hidden divide-y divide-edge animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-bold text-ink text-lg mb-1">No custom categories yet</p>
          <p className="text-ink-3 text-sm mb-5">Create categories to organise your projects your way.</p>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={14} strokeWidth={2.5} /> Create first category
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-edge">
          {categories.map(cat => (
            <div key={cat._id} className="group flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors">
              {/* Color swatch */}
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: cat.color + "20", border: `1.5px solid ${cat.color}60` }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-ink font-semibold text-sm">{cat.name}</p>
                  <span
                    className="text-xs font-mono text-ink-3 bg-canvas px-2 py-0.5 rounded-lg border border-edge"
                  >
                    /{cat.slug}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-ink-3 text-xs mt-0.5 truncate">{cat.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5">
                  <Pencil size={13} strokeWidth={2} />
                </button>
                <button onClick={() => del(cat._id, cat.name)} className="btn-ghost p-1.5 hover:text-red-500">
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
