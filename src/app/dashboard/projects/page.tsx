"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, X, Check, ExternalLink, Github,
  Search, SlidersHorizontal, Loader2, Image as ImageIcon, Upload,
} from "lucide-react";

interface Project {
  _id: string; title: string; description: string; category: string;
  techStack: string[]; status: string; liveUrl: string; repoUrl: string;
  featured: boolean; startDate?: string; endDate?: string; imageUrl?: string;
}

interface Category { _id: string; name: string; color: string; }

const STATUSES    = ["In Progress", "Completed", "Archived"];
const BUILTIN_CATS = ["Web App", "Mobile App", "API / Backend", "Open Source", "UI / Design", "Data / ML", "DevOps / Infra", "Other"];

const statusDotCls: Record<string, string>   = { "In Progress": "bg-amber-400", "Completed": "bg-green-400", "Archived": "bg-edge-2" };
const statusBadgeCls: Record<string, string> = {
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Completed":   "bg-green-50 text-green-700 border-green-200",
  "Archived":    "bg-canvas text-ink-3 border-edge",
};
const catColors: Record<string, string> = {
  "Web App": "bg-blue-50 text-blue-700 border-blue-200",
  "Mobile App": "bg-purple-50 text-purple-700 border-purple-200",
  "API / Backend": "bg-orange-50 text-orange-700 border-orange-200",
  "Open Source": "bg-lime/20 text-green-700 border-green-200",
  "UI / Design": "bg-pink-50 text-pink-700 border-pink-200",
  "Data / ML": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "DevOps / Infra": "bg-slate-100 text-slate-700 border-slate-200",
  "Other": "bg-canvas text-ink-3 border-edge",
};

const emptyForm = {
  title: "", description: "", category: "Web App", techStack: "", status: "In Progress",
  liveUrl: "", repoUrl: "", featured: false, startDate: "", endDate: "", imageUrl: "",
};

export default function ProjectsPage() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [customCats, setCustomCats] = useState<Category[]>([]);

  // Image upload for project
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Load custom categories
  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(setCustomCats)
      .catch(() => {});
  }, []);

  const allCategories = [...BUILTIN_CATS, ...customCats.map(c => c.name)];

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (search)      p.set("search",   search);
    if (filterCat)   p.set("category", filterCat);
    if (filterStat)  p.set("status",   filterStat);
    if (filterSkill) p.set("skill",    filterSkill);
    return p.toString();
  }, [search, filterCat, filterStat, filterSkill]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQuery();
      setProjects(await (await fetch(`/api/projects${q ? "?" + q : ""}`)).json());
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [buildQuery]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openAdd  = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Project) => {
    setEditId(p._id);
    setForm({
      title: p.title, description: p.description, category: p.category || "Other",
      techStack: p.techStack.join(", "), status: p.status,
      liveUrl: p.liveUrl || "", repoUrl: p.repoUrl || "", featured: p.featured,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
      imageUrl: p.imageUrl || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Upload project image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload-project", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { imageUrl } = await res.json();
      setForm(f => ({ ...f, imageUrl }));
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed"); }
    finally { setImgUploading(false); if (imgRef.current) imgRef.current.value = ""; }
  };

  const submit = async () => {
    if (!form.title.trim())       { toast.error("Title required");       return; }
    if (!form.description.trim()) { toast.error("Description required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(editId ? `/api/projects/${editId}` : "/api/projects", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editId ? "Updated." : "Project added.");
      setShowForm(false);
      fetch_();
    } catch { toast.error("Failed to save"); }
    finally { setSubmitting(false); }
  };

  const del = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}"?`)) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      toast.success("Removed.");
      setProjects(p => p.filter(x => x._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const f = (key: keyof typeof emptyForm) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const activeFilters = [filterCat, filterStat, filterSkill].filter(Boolean).length;
  const featured_ = projects.filter(p => p.featured);
  const rest_     = projects.filter(p => !p.featured);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Projects</p>
          <h1 className="text-3xl font-bold tracking-tightest text-ink">Work</h1>
          <p className="text-ink-3 text-sm mt-1">
            {loading ? "Loading…" :
              projects.length === 0
                ? (search || filterCat || filterStat || filterSkill ? "No matches found." : "No projects yet.")
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}${featured_.length ? ` · ${featured_.length} featured` : ""}`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={14} strokeWidth={2.5} /> Add project
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search projects, tech stack…"
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
          Filters
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilter && (
        <div className="card p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Category</label>
            <select className="input-base" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All categories</option>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Status</label>
            <select className="input-base" value={filterStat} onChange={e => setFilterStat(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Skill / Tech</label>
            <input
              className="input-base"
              placeholder="e.g. React, Python…"
              value={filterSkill}
              onChange={e => setFilterSkill(e.target.value)}
            />
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterCat(""); setFilterStat(""); setFilterSkill(""); }}
              className="btn-ghost text-red-500 hover:text-red-600"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-ink text-base">{editId ? "Edit project" : "New project"}</p>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5">
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Project image upload */}
          <div className="mb-5 pb-5 border-b border-edge">
            <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-2">Project Image</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-canvas border border-edge flex items-center justify-center shrink-0">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="Project" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-ink-3" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  onClick={() => imgRef.current?.click()}
                  disabled={imgUploading}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  {imgUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} strokeWidth={2} />}
                  {imgUploading ? "Uploading…" : "Upload image"}
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                    className="ml-2 btn-ghost text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
                <p className="text-ink-3 text-xs mt-1">PNG, JPG, WebP · max 3MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Title *</label>
              <input className="input-base font-semibold" placeholder="My Awesome Project" {...f("title")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Description *</label>
              <textarea className="input-base resize-none" rows={3}
                placeholder="What does this do? What problem does it solve?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Category</label>
              <select className="input-base" {...f("category")}>
                {allCategories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Status</label>
              <select className="input-base" {...f("status")}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Tech stack</label>
              <input className="input-base" placeholder="React, Node.js, MongoDB — comma separated" {...f("techStack")} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Live URL</label>
              <input className="input-base" type="url" placeholder="https://myproject.com" {...f("liveUrl")} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Repository</label>
              <input className="input-base" type="url" placeholder="https://github.com/…" {...f("repoUrl")} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Start date</label>
              <input className="input-base" type="date" {...f("startDate")} />
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">End date</label>
              <input className="input-base" type="date" {...f("endDate")} />
            </div>
          </div>

          {/* Featured toggle */}
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.featured ? "bg-lime" : "bg-edge-2"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${form.featured ? "left-6 bg-ink" : "left-1 bg-surface"}`} />
            </button>
            <span className="text-ink-2 text-sm font-medium">Featured project</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
              {submitting ? "Saving…" : editId ? "Save changes" : "Add project"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-ink-3" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">{search || filterCat || filterStat || filterSkill ? "🔍" : "📁"}</p>
          <p className="font-bold text-ink text-lg mb-1">
            {search || filterCat || filterStat || filterSkill ? "No results" : "No projects yet"}
          </p>
          <p className="text-ink-3 text-sm mb-5">
            {search || filterCat || filterStat || filterSkill
              ? "Try adjusting your search or filters."
              : "Start showcasing your work."}
          </p>
          {!search && !filterCat && !filterStat && !filterSkill && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={14} strokeWidth={2.5} /> Add first project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {featured_.length > 0 && (
            <div>
              <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-3 px-1">Featured</p>
              <div className="space-y-4">
                {featured_.map(p => (
                  <ProjectCard key={p._id} project={p} onEdit={openEdit} onDelete={del}
                    catColors={catColors} statusDotCls={statusDotCls} statusBadgeCls={statusBadgeCls} />
                ))}
              </div>
            </div>
          )}
          {rest_.length > 0 && (
            <div>
              {featured_.length > 0 && (
                <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-3 px-1">Other work</p>
              )}
              <div className="card overflow-hidden divide-y divide-edge">
                {rest_.map(p => (
                  <ProjectRow key={p._id} project={p} onEdit={openEdit} onDelete={del}
                    catColors={catColors} statusDotCls={statusDotCls} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, catColors, statusDotCls, statusBadgeCls }: {
  project: Project; onEdit: (p: Project) => void; onDelete: (id: string, title: string) => void;
  catColors: Record<string, string>; statusDotCls: Record<string, string>; statusBadgeCls: Record<string, string>;
}) {
  return (
    <div className="card card-hover group overflow-hidden">
      {/* Project image banner */}
      {project.imageUrl && (
        <div className="h-36 w-full overflow-hidden bg-canvas border-b border-edge">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotCls[project.status] ?? "bg-edge-2"}`} />
              <span className={`badge border ${statusBadgeCls[project.status] ?? ""}`}>{project.status}</span>
              {project.category && (
                <span className={`badge border ${catColors[project.category] ?? "bg-canvas text-ink-3 border-edge"}`}>
                  {project.category}
                </span>
              )}
              {project.featured && <span className="badge border bg-lime/20 text-ink border-lime/40">⭐ Featured</span>}
            </div>
            <h3 className="text-xl font-bold text-ink tracking-tightest mb-2">{project.title}</h3>
            <p className="text-ink-2 text-sm leading-relaxed mb-4">{project.description}</p>
            {project.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.map(t => (
                  <span key={t} className="text-xs font-mono font-medium text-ink-2 border border-edge bg-canvas px-2 py-0.5 rounded-lg">{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-ink font-semibold text-xs hover:underline">
                  <ExternalLink size={12} strokeWidth={2} /> Live demo
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-ink-3 text-xs hover:text-ink">
                  <Github size={12} strokeWidth={2} /> Repo
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(project)} className="btn-ghost p-2"><Pencil size={14} strokeWidth={2} /></button>
            <button onClick={() => onDelete(project._id, project.title)} className="btn-ghost p-2 hover:text-red-500"><Trash2 size={14} strokeWidth={2} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, onEdit, onDelete, catColors, statusDotCls }: {
  project: Project; onEdit: (p: Project) => void; onDelete: (id: string, title: string) => void;
  catColors: Record<string, string>; statusDotCls: Record<string, string>;
}) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors">
      {project.imageUrl && (
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-canvas border border-edge shrink-0">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotCls[project.status] ?? "bg-edge-2"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-ink font-semibold text-sm">{project.title}</p>
          {project.category && (
            <span className={`badge border text-[10px] ${catColors[project.category] ?? "bg-canvas text-ink-3 border-edge"}`}>
              {project.category}
            </span>
          )}
        </div>
        <p className="text-ink-3 text-xs truncate mt-0.5">{project.description}</p>
      </div>
      {project.techStack?.slice(0, 3).map(t => (
        <span key={t} className="hidden sm:block text-ink-3 text-xs font-mono shrink-0">{t}</span>
      ))}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
        <button onClick={() => onEdit(project)} className="btn-ghost p-1.5"><Pencil size={13} strokeWidth={2} /></button>
        <button onClick={() => onDelete(project._id, project.title)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={13} strokeWidth={2} /></button>
      </div>
    </div>
  );
}
