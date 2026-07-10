import Link from "next/link";

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0c12] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-indigo-400 font-mono text-sm mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Portfolio not found</h1>
        <p className="text-gray-500 mb-8">This portfolio doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
          Go Home
        </Link>
      </div>
    </div>
  );
}
