"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Save, Copy, ArrowUpRight, Camera, Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface PortfolioData {
  name: string; title: string; about: string; email: string;
  phone: string; location: string; website: string;
  github: string; linkedin: string; twitter: string;
  slug?: string; avatar?: string;
}
const defaultData: PortfolioData = {
  name:"",title:"",about:"",email:"",phone:"",location:"",
  website:"",github:"",linkedin:"",twitter:"",slug:"",avatar:"",
};

export default function PortfolioPage() {
  const [data, setData]           = useState<PortfolioData>(defaultData);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  // Change password
  const [pwForm, setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving]   = useState(false);
  const [showPw, setShowPw]       = useState(false);

  useEffect(() => {
    fetch("/api/portfolio").then(r=>r.json())
      .then(d => setData({...defaultData,...d}))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(p => ({...p, slug: updated.slug}));
      toast.success("Saved.");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { avatar } = await res.json();
      setData(p => ({...p, avatar}));
      toast.success("Photo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error("Fill in all password fields"); return;
    }
    if (pwForm.next.length < 8) { toast.error("New password must be 8+ characters"); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error("Passwords don't match"); return; }

    setPwSaving(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        revokeOtherSessions: true,
      });
      if (error) { toast.error(error.message || "Failed to change password"); return; }
      toast.success("Password updated. Other sessions were signed out.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPwSaving(false);
    }
  };

  const f = (key: keyof PortfolioData) => ({
    value: data[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setData({...data, [key]: e.target.value}),
  });

  const publicUrl = data.slug
    ? (typeof window !== "undefined" ? `${window.location.origin}/p/${data.slug}` : `/p/${data.slug}`)
    : null;

  const initials = data.name
    ? data.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)
    : "?";

  if (loading) return (
    <div className="max-w-2xl space-y-5 animate-pulse">
      <div className="h-8 bg-surface rounded-xl w-40"/>
      {[1,2,3].map(i=><div key={i} className="card p-6 h-32"/>)}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Portfolio</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tightest text-ink">Personal info</h1>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} strokeWidth={2}/>}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Public URL */}
      {publicUrl ? (
        <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{background:"#C8F135",border:"1px solid #B8E020"}}>
          <div className="flex-1 min-w-0">
            <p className="text-ink font-bold text-xs tracking-widest2 uppercase mb-0.5">Live URL</p>
            <p className="text-ink/70 text-sm font-mono truncate">{publicUrl}</p>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(publicUrl);toast.success("Copied!");}}
            className="btn-secondary text-xs px-3 py-2 bg-white/40 border-white/30">
            <Copy size={12} strokeWidth={2}/> Copy
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-2">
            <ArrowUpRight size={12} strokeWidth={2}/> View
          </a>
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-4 bg-surface border border-edge">
          <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-0.5">Public URL</p>
          <p className="text-ink-3 text-sm">Save your name to generate your shareable link.</p>
        </div>
      )}

      {/* ── Avatar Upload ── */}
      <div className="card p-6">
        <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-canvas border border-edge flex items-center justify-center">
              {data.avatar ? (
                <img src={data.avatar} alt="Profile" className="w-full h-full object-cover"/>
              ) : (
                <span className="text-2xl font-black text-ink-3">{initials}</span>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-ink"/>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink font-semibold text-sm mb-1">Upload a profile photo</p>
            <p className="text-ink-3 text-xs mb-3">PNG, JPG, or WebP. Max 2MB. Shown on your public portfolio.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-xs px-3 py-2"
              >
                <Camera size={13} strokeWidth={2}/> {uploading ? "Uploading…" : "Choose photo"}
              </button>
              {data.avatar && (
                <button
                  onClick={() => setData(p=>({...p, avatar:""}))}
                  className="btn-ghost text-xs px-3 py-2 text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="card p-6 space-y-4">
        <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Identity</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name"><input className="input-base" placeholder="Alex Johnson" {...f("name")}/></Field>
          <Field label="Job title"><input className="input-base" placeholder="Full-Stack Developer" {...f("title")}/></Field>
        </div>
        <Field label="About">
          <textarea className="input-base resize-none" rows={4}
            placeholder="A few sentences about who you are, what you build, and what drives you."
            {...f("about")}/>
        </Field>
      </div>

      {/* Contact */}
      <div className="card p-6 space-y-4">
        <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email"><input className="input-base" type="email" placeholder="alex@example.com" {...f("email")}/></Field>
          <Field label="Phone"><input className="input-base" placeholder="+1 234 567 8900" {...f("phone")}/></Field>
          <Field label="Location"><input className="input-base" placeholder="Islamabad, PK" {...f("location")}/></Field>
          <Field label="Website"><input className="input-base" placeholder="https://yoursite.dev" {...f("website")}/></Field>
        </div>
      </div>

      {/* Social */}
      <div className="card p-6 space-y-4">
        <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Social links</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GitHub"><input className="input-base" placeholder="github.com/username" {...f("github")}/></Field>
          <Field label="LinkedIn"><input className="input-base" placeholder="linkedin.com/in/username" {...f("linkedin")}/></Field>
          <Field label="Twitter / X"><input className="input-base" placeholder="twitter.com/username" {...f("twitter")}/></Field>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-ink-3" strokeWidth={2}/>
          <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Security</p>
        </div>
        <p className="text-ink-3 text-xs -mt-2">Change your password. You&apos;ll stay signed in here, but other devices will be signed out.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current password">
            <div className="relative">
              <input
                className="input-base pr-10" type={showPw ? "text" : "password"}
                placeholder="Your current password"
                value={pwForm.current}
                onChange={e => setPwForm({...pwForm, current: e.target.value})}
              />
              <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"/>
            </div>
          </Field>
          <div />
          <Field label="New password">
            <input
              className="input-base" type={showPw ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={pwForm.next}
              onChange={e => setPwForm({...pwForm, next: e.target.value})}
            />
          </Field>
          <Field label="Confirm new password">
            <input
              className="input-base" type={showPw ? "text" : "password"}
              placeholder="Repeat new password"
              value={pwForm.confirm}
              onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="btn-ghost text-xs px-2 py-1.5"
          >
            {showPw ? <EyeOff size={13} strokeWidth={2}/> : <Eye size={13} strokeWidth={2}/>}
            {showPw ? "Hide passwords" : "Show passwords"}
          </button>
          <button onClick={changePassword} disabled={pwSaving} className="btn-secondary">
            {pwSaving ? <Loader2 size={14} className="animate-spin"/> : <Lock size={14} strokeWidth={2}/>}
            {pwSaving ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>

      <div className="flex justify-end pb-4">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} strokeWidth={2}/>}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({label,children}:{label:string;children:React.ReactNode}){
  return (
    <div>
      <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}
