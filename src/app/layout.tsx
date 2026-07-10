import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  description: "Manage your developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#111111",
              border: "1px solid #E2E2DC",
              borderRadius: "12px",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: "500",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
            success: { iconTheme: { primary: "#C8F135", secondary: "#111111" } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
