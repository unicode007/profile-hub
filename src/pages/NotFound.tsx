import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#bfdbfe_0%,transparent_45%),radial-gradient(circle_at_bottom,#ccfbf1_0%,transparent_45%)]" />
      <div className="pointer-events-none absolute -left-16 top-12 h-60 w-60 rounded-full bg-sky-200/70 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-teal-200/70 blur-3xl float-slow [animation-delay:1.2s]" />

      <section className="relative z-10 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          <Building2 className="h-4 w-4" /> ERP Software
        </div>

        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-left">
            <p className="mb-2 text-sm font-semibold text-slate-500">Error Code</p>
            <h1 className="glow-pulse mb-4 text-6xl font-black leading-none text-sky-600 sm:text-7xl md:text-8xl">404</h1>
            <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">Page not found</h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-600 sm:text-base">
              We couldn&apos;t find <span className="font-semibold text-slate-900">{location.pathname}</span>. The
              page may have been moved, renamed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
              <a
                href="mailto:support@erp.local"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Contact support
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Home className="h-4 w-4 text-sky-600" /> Navigation help
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Use the button to return to the main dashboard and continue working in your ERP modules.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
