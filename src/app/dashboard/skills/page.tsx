"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Check, Search, SlidersHorizontal } from "lucide-react";

interface Skill { _id: string; name: string; level: string; category: string; yearsOfExperience?: number; }

const LEVELS     = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "Mobile", "Design", "Other"];
const levelPct: Record<string, number> = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
const emptyForm = { name: "", level: "Intermediate", category: "Other", yearsOfExperience: "" };

export default function SkillsPage() {
  const [skills, setSkills]         = useState<Skill[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (search)    p.set("search",   search);
    if (filterCat) p.set("category", filterCat);
    return p.toString();
  }, [search, filterCat]);

  const fetch_ = useCallback(async () => {
    try {
      setLoading(true);
      const q = buildQuery();
      setSkills(await (await fetch(`/api/skills${q ? "?" + q : ""}`)).json());
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [buildQuery]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openAdd  = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s: Skill) => {
    setEditId(s._id);
    setForm({ name: s.name, level: s.level, category: s.category, yearsOfExperience: s.yearsOfExperience?.toString() || "" });
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined };
      const res = await fetch(editId ? `/api/skills/${editId}` : "/api/skills", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editId ? "Updated." : "Added.");
      setShowForm(false);
      fetch_();
    } catch { toast.error("Failed to save"); }
    finally { setSubmitting(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      toast.success("Removed.");
      setSkills(p => p.filter(s => s._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    const list = skills.filter(s => s.category === cat);
    if (list.length) acc[cat] = list;
    return acc;
  }, {});

  const activeFilters = [filterCat].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Skills</p>
          <h1 className="text-3xl font-bold tracking-tightest text-ink">Tech stack</h1>
          <p className="text-ink-3 text-sm mt-1">
            {loading ? "Loading…" :
              skills.length === 0
                ? (search || filterCat ? "No matches." : "No skills yet.")
                : `${skills.length} skill${skills.length !== 1 ? "s" : ""} · ${Object.keys(grouped).length} categories`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={14} strokeWidth={2.5} /> Add skill
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search skills…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 pr-4"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink">
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`btn-secondary flex items-center gap-2 shrink-0 relative ${showFilter ? "border-ink" : ""}`}
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
          Filter
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="card p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Category</label>
            <select className="input-base" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => setFilterCat("")} className="btn-ghost text-red-500 hover:text-red-600">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-ink text-base">{editId ? "Edit skill" : "New skill"}</p>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={16} strokeWidth={2} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Skill name *</label>
              <input className="input-base" placeholder="e.g. React, Python, Docker…"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Category</label>
              <select className="input-base" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Level</label>
              <select className="input-base" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Years of exp.</label>
              <input className="input-base" type="number" min="0" max="50" placeholder="e.g. 3"
                value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} />
            </div>
          </div>
          {/* Level preview bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Proficiency</span>
              <span className="text-ink-2 text-xs font-semibold">{form.level}</span>
            </div>
            <div className="h-2 bg-canvas rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${levelPct[form.level] ?? 50}%`, background: "#C8F135" }} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={submit} disabled={submitting} className="btn-primary">
              <Check size={14} strokeWidth={2.5} /> {submitting ? "Saving…" : editId ? "Save changes" : "Add skill"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-5 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="card p-0 overflow-hidden">
              {[1, 2, 3].map(j => <div key={j} className="h-14 border-b border-edge last:border-0" />)}
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">⚡</p>
          <p className="font-bold text-ink text-lg mb-1">{search || filterCat ? "No matches" : "No skills yet"}</p>
          <p className="text-ink-3 text-sm mb-5">
            {search || filterCat ? "Try adjusting your search or filter." : "Add the technologies you work with."}
          </p>
          {!search && !filterCat && (
            <button onClick={openAdd} className="btn-primary"><Plus size={14} strokeWidth={2.5} /> Add first skill</button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catSkills]) => (
            <div key={cat}>
              <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-2 px-1">{cat}</p>
              <div className="card overflow-hidden divide-y divide-edge">
                {catSkills.map(skill => (
                  <div key={skill._id} className="group flex items-center gap-5 px-5 py-4 hover:bg-canvas transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-ink font-semibold text-sm">{skill.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${levelPct[skill.level] ?? 50}%`, background: "#C8F135" }} />
                        </div>
                        <span className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase shrink-0 w-24 text-right">{skill.level}</span>
                      </div>
                    </div>
                    {skill.yearsOfExperience && (
                      <span className="text-ink-3 text-xs font-mono shrink-0">{skill.yearsOfExperience}y</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(skill)} className="btn-ghost p-1.5 text-ink-3 hover:text-ink"><Pencil size={13} strokeWidth={2} /></button>
                      <button onClick={() => del(skill._id, skill.name)} className="btn-ghost p-1.5 text-ink-3 hover:text-red-500"><Trash2 size={13} strokeWidth={2} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
