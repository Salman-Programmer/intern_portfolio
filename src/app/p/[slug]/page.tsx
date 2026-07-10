import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";
import {
  Mail, Phone, MapPin, Globe, Github, Linkedin,
  Twitter, ExternalLink, Star, ArrowUpRight,
} from "lucide-react";

interface PageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();
  const portfolio = await Portfolio.findOne({ slug }).lean() as { name?: string; title?: string } | null;
  if (!portfolio) return { title: "Portfolio Not Found" };
  return {
    title: `${portfolio.name} — Portfolio`,
    description: `${portfolio.name} is a ${portfolio.title}`,
  };
}

const CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "Mobile", "Design", "Other"];

const levelWidth: Record<string, string> = {
  Beginner: "w-1/4", Intermediate: "w-1/2", Advanced: "w-3/4", Expert: "w-full",
};
const levelColor: Record<string, string> = {
  Beginner: "bg-gray-500", Intermediate: "bg-blue-500", Advanced: "bg-violet-500", Expert: "bg-green-500",
};

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const portfolio = await Portfolio.findOne({ slug: slug.toLowerCase() }).lean() as Record<string, unknown> | null;
  if (!portfolio) notFound();

  const [skills, projects] = await Promise.all([
    Skill.find({ userId: portfolio.userId }).sort({ category: 1, name: 1 }).lean(),
    Project.find({ userId: portfolio.userId }).sort({ featured: -1, createdAt: -1 }).lean(),
  ]);

  const grouped = CATEGORIES.reduce<Record<string, typeof skills>>((acc, cat) => {
    const list = skills.filter(s => s.category === cat);
    if (list.length) acc[cat] = list;
    return acc;
  }, {});

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects    = projects.filter(p => !p.featured);

  const name     = portfolio.name     as string;
  const title    = portfolio.title    as string;
  const about    = portfolio.about    as string;
  const email    = portfolio.email    as string;
  const phone    = portfolio.phone    as string;
  const location = portfolio.location as string;
  const website  = portfolio.website  as string;
  const github   = portfolio.github   as string;
  const linkedin = portfolio.linkedin as string;
  const twitter  = portfolio.twitter  as string;
  const avatar   = portfolio.avatar   as string | undefined;

  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0a0c12] text-gray-100">
      {/* HERO */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/10 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-indigo-900/40">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="text-center sm:text-left">
              <p className="text-indigo-400 font-mono text-sm font-medium mb-2 tracking-wider uppercase">Portfolio</p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-3">{name}</h1>
              <p className="text-xl text-gray-400 font-light mb-5">{title}</p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/[0.08] rounded-full px-3 py-1 text-[13px] text-gray-400 hover:text-gray-200 transition-colors no-underline">
                    <Mail size={13} /> {email}
                  </a>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/[0.08] rounded-full px-3 py-1 text-[13px] text-gray-400">
                    <MapPin size={13} /> {location}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/[0.08] rounded-full px-3 py-1 text-[13px] text-gray-400">
                    <Phone size={13} /> {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 flex-wrap justify-center sm:justify-start">
            {github   && <SocialLink href={github.startsWith("http")   ? github   : `https://${github}`}   icon={<Github size={16} />}   label="GitHub"   />}
            {linkedin && <SocialLink href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} icon={<Linkedin size={16} />} label="LinkedIn" />}
            {twitter  && <SocialLink href={twitter.startsWith("http")  ? twitter  : `https://${twitter}`}  icon={<Twitter size={16} />}  label="Twitter"  />}
            {website  && <SocialLink href={website.startsWith("http")  ? website  : `https://${website}`}  icon={<Globe size={16} />}    label="Website"  />}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* ABOUT */}
        {about && (
          <section>
            <SectionLabel>About</SectionLabel>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{about}</p>
          </section>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <section>
            <SectionLabel>Skills</SectionLabel>
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, catSkills]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catSkills.map(skill => (
                      <div key={String(skill._id)} className="group flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-gray-200 text-sm">{skill.name}</span>
                            <span className="text-xs text-gray-500">{skill.level}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${levelWidth[skill.level]} ${levelColor[skill.level]}`} />
                          </div>
                        </div>
                        {skill.yearsOfExperience && (
                          <span className="shrink-0 text-xs text-gray-600 font-mono">{skill.yearsOfExperience}y</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <section>
            <SectionLabel>Projects</SectionLabel>
            {featuredProjects.length > 0 && (
              <div className="space-y-5 mb-8">
                {featuredProjects.map(project => (
                  <ProjectCard key={String(project._id)} project={project} featured />
                ))}
              </div>
            )}
            {otherProjects.length > 0 && (
              <>
                {featuredProjects.length > 0 && (
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Other Projects</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherProjects.map(project => (
                    <ProjectCard key={String(project._id)} project={project} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* CONTACT */}
        {(email || phone || website) && (
          <section>
            <SectionLabel>Get in Touch</SectionLabel>
            <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
              <p className="text-gray-300 mb-6 text-lg">Interested in working together? Reach out anytime.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Mail size={15} /> Send an Email
                  </a>
                )}
                {website && (
                  <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Globe size={15} /> Visit Website
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        Built with Portfolio CMS
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-2xl font-bold text-white">{children}</h2>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-indigo-500/40 text-gray-400 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
      {icon} {label}
    </a>
  );
}

function ProjectCard({ project, featured }: { project: Record<string, unknown>; featured?: boolean }) {
  const techStack   = project.techStack as string[];
  const status      = project.status as string;
  const title       = project.title as string;
  const description = project.description as string;
  const liveUrl     = project.liveUrl as string;
  const repoUrl     = project.repoUrl as string;
  const imageUrl    = project.imageUrl as string | undefined;
  const category    = project.category as string | undefined;

  const statusColors: Record<string, string> = {
    "Completed":   "text-green-400 bg-green-900/20 border-green-800/30",
    "In Progress": "text-amber-400 bg-amber-900/20 border-amber-800/30",
    "Archived":    "text-gray-500 bg-gray-800/20 border-gray-700/30",
  };

  return (
    <div className={`group relative bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all ${featured ? "sm:col-span-2" : ""}`}>
      {/* Project image */}
      {imageUrl && (
        <div className={`overflow-hidden bg-white/5 ${featured ? "h-52" : "h-36"}`}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-6">
        {featured && (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-3">
            <Star size={11} className="fill-amber-400" /> Featured Project
          </div>
        )}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className={`font-bold text-white ${featured ? "text-xl" : "text-base"}`}>{title}</h3>
            {category && (
              <p className="text-xs text-indigo-400/70 font-medium mt-0.5">{category}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <ExternalLink size={14} />
              </a>
            )}
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Github size={14} />
              </a>
            )}
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
        <div className="flex items-center flex-wrap gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[status] || statusColors["In Progress"]}`}>
            {status}
          </span>
          {techStack?.map(tech => (
            <span key={tech} className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-gray-500">{tech}</span>
          ))}
        </div>
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            View live <ArrowUpRight size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
