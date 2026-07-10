"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Monitor, Tablet, Smartphone } from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportConfig: Record<ViewportSize, { width: string; label: string; icon: React.ReactNode }> = {
  desktop: { width: "100%",   label: "Desktop", icon: <Monitor size={14} strokeWidth={2} /> },
  tablet:  { width: "768px",  label: "Tablet",  icon: <Tablet size={14} strokeWidth={2} /> },
  mobile:  { width: "390px",  label: "Mobile",  icon: <Smartphone size={14} strokeWidth={2} /> },
};

export default function PreviewPage() {
  const [slug, setSlug]           = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [viewport, setViewport]   = useState<ViewportSize>("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetch("/api/portfolio")
      .then(r => r.json())
      .then(d => setSlug(d.slug || null))
      .catch(() => setSlug(null))
      .finally(() => setLoading(false));
  }, []);

  const previewUrl = slug ? `/p/${slug}` : null;

  const refresh = () => setIframeKey(k => k + 1);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!previewUrl) return (
    <div className="space-y-6">
      <div>
        <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-2">Preview</p>
        <h1 className="text-3xl font-bold tracking-tightest text-ink">Portfolio Preview</h1>
      </div>
      <div className="card p-16 text-center">
        <p className="text-4xl mb-3">👁️</p>
        <p className="font-bold text-ink text-lg mb-1">No portfolio yet</p>
        <p className="text-ink-3 text-sm mb-5">
          Save your name and info in the Portfolio tab to generate your public URL and preview.
        </p>
        <a href="/dashboard/portfolio" className="btn-primary inline-flex">
          Go to Portfolio →
        </a>
      </div>
    </div>
  );

  const cfg = viewportConfig[viewport];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-ink-3 text-xs font-semibold tracking-widest2 uppercase mb-1">Preview</p>
          <h1 className="text-2xl font-bold tracking-tightest text-ink">Live Portfolio Preview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="btn-secondary" title="Refresh preview">
            <RefreshCw size={14} strokeWidth={2} />
          </button>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <ExternalLink size={14} strokeWidth={2} /> Open live
          </a>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-surface border border-edge rounded-2xl px-4 py-3">
        {/* URL bar */}
        <div className="flex-1 bg-canvas border border-edge rounded-xl px-4 py-2 flex items-center gap-2 min-w-0">
          <div className="flex gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-ink-3 text-xs font-mono truncate flex-1">
            {typeof window !== "undefined" ? window.location.origin : ""}
            {previewUrl}
          </span>
        </div>

        {/* Viewport switcher */}
        <div className="flex gap-1 bg-canvas border border-edge rounded-xl p-1 shrink-0">
          {(Object.keys(viewportConfig) as ViewportSize[]).map(vp => (
            <button
              key={vp}
              onClick={() => setViewport(vp)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewport === vp
                  ? "bg-ink text-white"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {viewportConfig[vp].icon}
              <span className="hidden sm:inline">{viewportConfig[vp].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-ink-3 text-xs">
          Live preview — changes saved in the dashboard reflect here after refresh
        </span>
      </div>

      {/* iframe container */}
      <div className="flex-1 flex justify-center">
        <div
          className="relative rounded-2xl overflow-hidden border border-edge shadow-xl transition-all duration-300 bg-white"
          style={{
            width: cfg.width,
            minHeight: "600px",
            maxWidth: "100%",
          }}
        >
          <iframe
            key={iframeKey}
            src={previewUrl}
            className="w-full h-full"
            style={{ minHeight: "600px", border: "none" }}
            title="Portfolio Preview"
          />
        </div>
      </div>
    </div>
  );
}
