/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode surface system
        canvas:   "#EFEFEA",   // page background
        surface:  "#FFFFFF",   // card background
        "surface-2": "#F7F7F4", // subtle card variant
        edge:     "#E2E2DC",   // borders
        "edge-2": "#CACAC4",   // stronger border
        // Text
        ink:      "#111111",   // primary text
        "ink-2":  "#555550",   // secondary text
        "ink-3":  "#99998F",   // muted text
        // Sidebar
        void:     "#111111",   // sidebar bg
        "void-2": "#1E1E1E",   // sidebar hover
        // Accent
        lime:     "#C8F135",   // primary accent (from image)
        "lime-dim":"#A8D020",  // lime hover/darker
        // Keep brand colors for public pages
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans:    ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
      },
      fontWeight: {
        black: "900",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card":      "0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-md":   "0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)",
        "card-hover":"0 4px 16px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.1)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter2: "-0.02em",
        widest2:   "0.14em",
      },
    },
  },
  plugins: [],
};
