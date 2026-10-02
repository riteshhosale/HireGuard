import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error("HireGuard UI error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f3fa] px-5 py-10">
        <section className="dashboard-card w-full max-w-lg p-8 text-center sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-500">Something went wrong</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">The page could not be displayed</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">A temporary interface error occurred. Reload the page or return to the HireGuard dashboard.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white">
              <RefreshCw size={14} /> Reload page
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
              <Home size={14} /> Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
