import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SKILL_CATS    = ["Frontend","Backend","Database","DevOps","Mobile","Design","Other"];
const PROJECT_CATS  = ["Web App","Mobile App","API / Backend","Open Source","UI / Design","Data / ML","DevOps / Infra","Other"];
const PROJECT_STATS = ["In Progress","Completed","Archived"];

const statusColors:Record<string,string> = {
  "In Progress": "#F59E0B",
  "Completed":   "#22C55E",
  "Archived":    "#9CA3AF",
};
const catBarColor = "#C8F135";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId  = session!.user.id;

  await connectDB();
  const [portfolio, skills, projects] = await Promise.all([
    Portfolio.findOne({ userId }),
    Skill.find({ userId }),
    Project.find({ userId }),
  ]);

  const totalSkills   = skills.length;
  const totalProjects = projects.length;
  const featuredCount = projects.filter(p => p.featured).length;
  const profileScore  = [
    !!portfolio?.name, !!portfolio?.title, !!portfolio?.about,
    !!portfolio?.email, totalSkills > 0, totalProjects > 0,
  ].filter(Boolean).length;
  const profilePct = Math.round((profileScore / 6) * 100);

  // Skill breakdown by category
  const skillByCat = SKILL_CATS.map(cat => ({
    cat,
    count: skills.filter(s => s.category === cat).length,
  })).filter(d => d.count > 0).sort((a,b) => b.count - a.count);

  // Skill breakdown by level
  const skillByLevel = ["Beginner","Intermediate","Advanced","Expert"].map(level => ({
    level,
    count: skills.filter(s => s.level === level).length,
  })).filter(d => d.count > 0);

  // Project breakdown by category
  const projByCat = PROJECT_CATS.map(cat => ({
    cat,
    count: projects.filter(p => p.category === cat || (!p.category && cat === "Other")).length,
  })).filter(d => d.count > 0).sort((a,b) => b.count - a.count);

  // Project breakdown by status
  const projByStatus = PROJECT_STATS.map(status => ({
    status,
    count: projects.filter(p => p.status === status).length,
  })).filter(d => d.count > 0);

  const maxSkillCat  = Math.max(...skillByCat.map(d=>d.count), 1);
  const maxProjCat   = Math.max(...projByCat.map(d=>d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Analytics</p>
        <h1 className="text-3xl font-bold tracking-tightest text-ink">Dashboard analytics</h1>
        <p className="text-ink-3 text-sm mt-1">A breakdown of your portfolio content and profile completeness.</p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Total skills",    value: totalSkills,   sub: "technologies",  href:"/dashboard/skills",   accent: true  },
          { label:"Total projects",  value: totalProjects, sub: "in portfolio",  href:"/dashboard/projects", accent: false },
          { label:"Featured",        value: featuredCount, sub: "projects",      href:"/dashboard/projects", accent: false },
          { label:"Profile score",   value: `${profilePct}%`, sub:"complete",   href:"/dashboard/portfolio",accent: false },
        ].map(({ label, value, sub, href, accent }) => (
          <Link key={label} href={href}
            className={`group rounded-2xl p-5 flex flex-col justify-between min-h-[130px] transition-all hover:scale-[1.01] ${
              accent ? "text-ink" : "card card-hover"
            }`}
            style={accent ? {background:"#C8F135",border:"1px solid #B8E020"} : undefined}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold tracking-widest2 uppercase opacity-60">{label}</p>
              <ArrowUpRight size={14} className="opacity-30 group-hover:opacity-70 transition-opacity" strokeWidth={2}/>
            </div>
            <div>
              <p className="text-4xl font-black leading-none tracking-tightest">{value}</p>
              <p className="text-xs font-medium mt-1 opacity-50">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main analytics grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Skills by category */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-ink text-base">Skills by category</p>
              <p className="text-ink-3 text-xs mt-0.5">{totalSkills} total across {skillByCat.length} categories</p>
            </div>
            <Link href="/dashboard/skills" className="btn-ghost text-xs">Manage →</Link>
          </div>
          {skillByCat.length === 0 ? (
            <EmptyChart message="No skills added yet" href="/dashboard/skills"/>
          ) : (
            <div className="space-y-3">
              {skillByCat.map(({ cat, count }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-ink-2 text-sm font-medium">{cat}</span>
                    <span className="text-ink font-bold text-sm tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{width:`${(count/maxSkillCat)*100}%`, background: catBarColor}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills by level */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-ink text-base">Skills by level</p>
              <p className="text-ink-3 text-xs mt-0.5">Proficiency distribution</p>
            </div>
          </div>
          {skillByLevel.length === 0 ? (
            <EmptyChart message="No skills added yet" href="/dashboard/skills"/>
          ) : (
            <div className="space-y-3">
              {skillByLevel.map(({ level, count }) => {
                const pct = Math.round((count / totalSkills) * 100);
                const barW = ["Beginner","Intermediate","Advanced","Expert"].indexOf(level);
                const barColors = ["#E5E7EB","#93C5FD","#818CF8","#C8F135"];
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-ink-2 text-sm font-medium">{level}</span>
                      <span className="text-ink-3 text-xs tabular-nums">{count} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-canvas rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{width:`${(count/totalSkills)*100}%`, background: barColors[barW]}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects by category */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-ink text-base">Projects by category</p>
              <p className="text-ink-3 text-xs mt-0.5">{totalProjects} total across {projByCat.length} categories</p>
            </div>
            <Link href="/dashboard/projects" className="btn-ghost text-xs">Manage →</Link>
          </div>
          {projByCat.length === 0 ? (
            <EmptyChart message="No projects added yet" href="/dashboard/projects"/>
          ) : (
            <div className="space-y-3">
              {projByCat.map(({ cat, count }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-ink-2 text-sm font-medium">{cat}</span>
                    <span className="text-ink font-bold text-sm tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{width:`${(count/maxProjCat)*100}%`, background:"#111111"}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects by status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-ink text-base">Projects by status</p>
              <p className="text-ink-3 text-xs mt-0.5">Progress overview</p>
            </div>
          </div>
          {projByStatus.length === 0 ? (
            <EmptyChart message="No projects added yet" href="/dashboard/projects"/>
          ) : (
            <div className="space-y-4">
              {/* Visual donut-like segment row */}
              <div className="flex gap-1 h-8 rounded-xl overflow-hidden">
                {projByStatus.map(({ status, count }) => (
                  <div key={status}
                    className="flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{
                      flex: count,
                      background: statusColors[status] ?? "#9CA3AF",
                      minWidth: count > 0 ? "24px" : "0",
                    }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-4">
                {projByStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:statusColors[status]??""}}/>
                    <span className="text-ink-2 text-xs font-medium">{status}</span>
                    <span className="text-ink-3 text-xs">{count}</span>
                  </div>
                ))}
              </div>
              {/* Rows */}
              <div className="space-y-2 pt-1 border-t border-edge">
                {projByStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-ink-2 text-sm">{status}</span>
                    <span className="text-ink font-bold text-sm">{Math.round((count/totalProjects)*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile completion card ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-bold text-ink text-base">Profile completion</p>
            <p className="text-ink-3 text-xs mt-0.5">{profileScore} of 6 sections filled</p>
          </div>
          <Link href="/dashboard/portfolio" className="btn-primary text-xs px-3 py-2">
            <ArrowUpRight size={12} strokeWidth={2}/> Edit profile
          </Link>
        </div>
        {/* Big progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ink-3 text-2xs font-semibold tracking-widest2 uppercase">Overall</span>
            <span className="text-2xl font-black text-ink tracking-tightest">{profilePct}%</span>
          </div>
          <div className="h-3 bg-canvas rounded-full overflow-hidden">
            <div className="h-full bg-lime rounded-full transition-all duration-700"
              style={{width:`${profilePct}%`}}/>
          </div>
        </div>
        {/* Checklist grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label:"Name",        done: !!portfolio?.name,  href:"/dashboard/portfolio" },
            { label:"Job title",   done: !!portfolio?.title, href:"/dashboard/portfolio" },
            { label:"About / bio", done: !!portfolio?.about, href:"/dashboard/portfolio" },
            { label:"Contact info",done: !!portfolio?.email, href:"/dashboard/portfolio" },
            { label:"1+ skills",   done: totalSkills > 0,    href:"/dashboard/skills"   },
            { label:"1+ projects", done: totalProjects > 0,  href:"/dashboard/projects" },
          ].map(({ label, done, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-canvas transition-colors group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                done ? "border-lime-dim bg-lime" : "border-edge-2"
              }`}>
                {done && <span className="text-[9px] font-black text-ink">✓</span>}
              </div>
              <span className={`text-sm font-medium ${done ? "text-ink line-through decoration-ink-3" : "text-ink-2"}`}>
                {label}
              </span>
              {!done && <ArrowUpRight size={12} className="ml-auto text-ink-3 group-hover:text-ink transition-colors" strokeWidth={2}/>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message, href }: { message: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-ink-3 text-sm mb-3">{message}</p>
      <Link href={href} className="btn-secondary text-xs">Add now →</Link>
    </div>
  );
}
