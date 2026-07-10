import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Code2, LayoutDashboard, Shield, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-surface to-surface pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-700/40 rounded-full px-4 py-1.5 text-brand-300 text-sm font-medium mb-8">
          <Zap size={13} className="fill-brand-400 stroke-brand-400" />
          Full-Stack Portfolio Manager
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Your portfolio,
          <br />
          <span className="text-brand-400">perfectly managed</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Register once. Manage your skills, projects, and personal brand from
          a single, powerful dashboard.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="btn-primary text-base px-6 py-3">
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left">
          {[
            {
              icon: Shield,
              title: "Secure Auth",
              desc: "Better Auth with session management and encrypted storage",
            },
            {
              icon: Code2,
              title: "Skills & Projects",
              desc: "Add, edit, and delete skills and projects with full CRUD support",
            },
            {
              icon: LayoutDashboard,
              title: "Clean Dashboard",
              desc: "Intuitive interface to manage all your portfolio information",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <div className="w-9 h-9 rounded-lg bg-brand-900/50 border border-brand-700/30 flex items-center justify-center mb-3">
                <Icon size={17} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
