import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";
import { Category } from "@/models/Category";
import { Activity } from "@/models/Activity";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const activityIcons: Record<string, string> = {
  project_created:   "📁",
  project_updated:   "✏️",
  project_deleted:   "🗑️",
  skill_created:     "⚡",
  skill_updated:     "✏️",
  skill_deleted:     "🗑️",
  portfolio_updated: "👤",
  category_created:  "🏷️",
  category_updated:  "✏️",
  category_deleted:  "🗑️",
  image_uploaded:    "🖼️",
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId  = session!.user.id;

  await connectDB();
  const [portfolio, skillCount, projectCount, categoryCount, skillCats, projCats, recentActivities, featuredCount] = await Promise.all([
    Portfolio.findOne({ userId }),
    Skill.countDocuments({ userId }),
    Project.countDocuments({ userId }),
    Category.countDocuments({ userId }),
    Skill.distinct("category", { userId }),
    Project.distinct("category", { userId }),
    Activity.find({ userId }).sort({ createdAt: -1 }).limit(8),
    Project.countDocuments({ userId, featured: true }),
  ]);

  const uniqueSkillCats = skillCats.filter(Boolean).length;
  const uniqueProjCats  = projCats.filter(Boolean).length;
  const publicUrl       = portfolio?.slug ? `/p/${portfolio.slug}` : null;
  const firstName       = session!.user.name?.split(" ")[0] ?? "there";
  const profileDone     = !!portfolio?.name && !!portfolio?.title;
  const initials        = (session!.user.name ?? session!.user.email ?? "U")
    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const profileItems = [!!portfolio?.name, !!portfolio?.title, !!portfolio?.about, !!portfolio?.email, skillCount > 0, projectCount > 0];
  const profilePct   = Math.round((profileItems.filter(Boolean).length / profileItems.length) * 100);

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-ink-3 text-xs font-medium tracking-widest2 uppercase mb-2">Dashboard</p>
          <h1 className="text-4xl font-bold tracking-tightest text-ink leading-none">
            Hey {firstName},<br />
            <span className="text-ink-3">welcome back.</span>
          </h1>
        </div>
        <Link href="/dashboard/projects" className="btn-primary shrink-0 mt-1">
          <Plus size={15} strokeWidth={2.5} />
          Add project
        </Link>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 bg-surface border border-edge rounded-2xl p-1.5 overflow-x-auto shadow-card">
        {[
          { label: "Overview",    href: "/dashboard",            active: true  },
          { label: "Portfolio",   href: "/dashboard/portfolio",  active: false },
          { label: "Skills",      href: "/dashboard/skills",     active: false },
          { label: "Projects",    href: "/dashboard/projects",   active: false },
          { label: "Categories",  href: "/dashboard/categories", active: false },
          { label: "Analytics",   href: "/dashboard/analytics",  active: false },
          { label: "Preview",     href: "/dashboard/preview",    active: false },
        ].map(({ label, href, active }) => (
          <Link key={label} href={href} className={`tab-item ${active ? "active" : ""}`}>
            {label}
          </Link>
        ))}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Skills */}
        <Link href="/dashboard/skills"
          className="block rounded-2xl p-5 group transition-all duration-200 hover:scale-[1.01]"
          style={{ background: "#C8F135", border: "1px solid #B8E020" }}>
          <p className="text-ink/50 text-2xs font-semibold tracking-widest2 uppercase mb-3">Skills</p>
          <p className="text-[2.5rem] font-black leading-none text-ink tracking-tightest">{skillCount}</p>
          <p className="text-ink/60 text-xs font-medium mt-1">technologies</p>
        </Link>

        {/* Projects */}
        <Link href="/dashboard/projects"
          className="block rounded-2xl p-5 group transition-all duration-200 hover:scale-[1.01]"
          style={{ background: "#111111", border: "1px solid #222" }}>
          <p className="text-white/40 text-2xs font-semibold tracking-widest2 uppercase mb-3">Projects</p>
          <p className="text-[2.5rem] font-black leading-none text-white tracking-tightest">{projectCount}</p>
          <p className="text-white/50 text-xs font-medium mt-1">{featuredCount} featured</p>
        </Link>

        {/* Categories */}
        <Link href="/dashboard/categories"
          className="card card-hover block rounded-2xl p-5 group">
          <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-3">Categories</p>
          <p className="text-[2.5rem] font-black leading-none text-ink tracking-tightest">{categoryCount}</p>
          <p className="text-ink-3 text-xs font-medium mt-1">custom</p>
        </Link>

        {/* Profile score */}
        <Link href="/dashboard/portfolio"
          className="card card-hover block rounded-2xl p-5 group">
          <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase mb-3">Profile</p>
          <p className="text-[2.5rem] font-black leading-none text-ink tracking-tightest">{profilePct}%</p>
          <div className="mt-2 h-1.5 bg-canvas rounded-full overflow-hidden">
            <div className="h-full bg-lime rounded-full" style={{ width: `${profilePct}%` }} />
          </div>
        </Link>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Recent Activity */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-edge">
              <p className="font-semibold text-ink text-sm">Recent activity</p>
              <span className="text-ink-3 text-xs font-medium">{recentActivities.length} events</span>
            </div>
            {recentActivities.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-ink-3 text-sm">No activity yet. Start by adding skills or projects.</p>
              </div>
            ) : (
              <div className="divide-y divide-edge">
                {recentActivities.map((activity) => (
                  <div key={String(activity._id)} className="flex items-center gap-4 px-6 py-3.5 hover:bg-canvas transition-colors">
                    <span className="text-lg shrink-0">{activityIcons[activity.type] ?? "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm font-medium truncate">{activity.title}</p>
                      {activity.description && (
                        <p className="text-ink-3 text-xs mt-0.5 truncate">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-ink-3 text-xs shrink-0 tabular-nums">
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User statistics */}
          <div className="card p-6">
            <p className="font-semibold text-ink text-sm mb-4">Portfolio stats</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total projects",      value: projectCount,                 sub: "created" },
                { label: "Featured projects",   value: featuredCount,                sub: "highlighted" },
                { label: "Total skills",        value: skillCount,                   sub: "listed" },
                { label: "Skill categories",    value: uniqueSkillCats,              sub: "disciplines" },
                { label: "Project categories",  value: uniqueProjCats + categoryCount, sub: "types" },
                { label: "Profile complete",    value: `${profilePct}%`,             sub: "of checklist" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-canvas rounded-xl px-4 py-3 border border-edge">
                  <p className="text-[1.6rem] font-black text-ink leading-none tracking-tightest">{value}</p>
                  <p className="text-ink-2 text-xs font-semibold mt-1">{label}</p>
                  <p className="text-ink-3 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Public URL banner */}
          {publicUrl && (
            <div className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "#C8F135", border: "1px solid #B8E020" }}>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-bold text-sm">Your portfolio is live</p>
                <p className="text-ink/60 text-xs font-mono mt-0.5 truncate">
                  {typeof window !== "undefined" ? window.location.origin : ""}{publicUrl}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/dashboard/preview" className="btn-secondary text-xs px-3 py-2 bg-white/40 border-white/30">
                  Preview
                </Link>
                <Link href={publicUrl} target="_blank" className="btn-primary shrink-0">
                  <ArrowUpRight size={14} strokeWidth={2.5} /> View
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          <p className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase px-1">Your sections</p>

          {[
            {
              icon: "👤", label: "Portfolio",  sub: "Edit name, bio & contact",   href: "/dashboard/portfolio",  done: profileDone,
            },
            {
              icon: "⚡", label: "Skills",     sub: `${skillCount} tech skills`,  href: "/dashboard/skills",     done: skillCount > 0,
            },
            {
              icon: "📁", label: "Projects",   sub: `${projectCount} projects`,   href: "/dashboard/projects",   done: projectCount > 0,
            },
            {
              icon: "🏷️", label: "Categories", sub: `${categoryCount} custom`,    href: "/dashboard/categories", done: true,
            },
            {
              icon: "📊", label: "Analytics",  sub: "Charts & breakdowns",        href: "/dashboard/analytics",  done: true,
            },
            ...(publicUrl ? [{
              icon: "👁️", label: "Preview",   sub: "Live portfolio preview",      href: "/dashboard/preview",    done: true, external: false,
            }] : []),
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="card card-hover flex items-center gap-4 px-5 py-4 group"
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-semibold text-sm">{item.label}</p>
                <p className="text-ink-3 text-xs mt-0.5 truncate">{item.sub}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${item.done ? "bg-lime-dim" : "bg-edge-2"}`} />
                <ArrowUpRight size={14} className="text-ink-3 group-hover:text-ink transition-colors" strokeWidth={2} />
              </div>
            </Link>
          ))}

          {/* Profile completion checklist */}
          <div className="card p-5 mt-2">
            <p className="text-ink font-semibold text-sm mb-4">Completion checklist</p>
            <div className="space-y-3">
              {[
                { label: "Add your name",    done: !!portfolio?.name  },
                { label: "Set a job title",  done: !!portfolio?.title  },
                { label: "Write a bio",      done: !!portfolio?.about  },
                { label: "Add contact info", done: !!portfolio?.email  },
                { label: "Add a skill",      done: skillCount > 0      },
                { label: "Add a project",    done: projectCount > 0    },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    done ? "border-lime-dim bg-lime" : "border-edge-2 bg-transparent"
                  }`}>
                    {done && <span className="text-[8px] font-black text-ink">✓</span>}
                  </div>
                  <span className={`text-xs font-medium ${done ? "text-ink line-through decoration-ink-3" : "text-ink-2"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xs text-ink-3 font-medium tracking-widest2 uppercase">Progress</span>
                <span className="text-xs font-bold text-ink">{profilePct}%</span>
              </div>
              <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
                <div className="h-full bg-lime rounded-full transition-all duration-500" style={{ width: `${profilePct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
