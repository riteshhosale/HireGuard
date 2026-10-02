import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "";
const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || "";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-extrabold">JobGuard<span className="text-[#4f46e5]"> AI</span></p>
            <p className="mt-1 text-xs text-slate-500">AI-powered job scam investigation and risk analysis.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/login" className="hover:text-indigo-600">Sign in</Link>
            <Link to="/signup" className="hover:text-indigo-600">Create account</Link>
            <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span>© {new Date().getFullYear()} JobGuard AI</span>
          </nav>
        </div>

        {(SUPPORT_EMAIL || SUPPORT_PHONE) && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500" aria-label="Support contact information">
            {SUPPORT_EMAIL && (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-600">
                <Mail size={14} /> <span className="break-all">{SUPPORT_EMAIL}</span>
              </a>
            )}
            {SUPPORT_PHONE && (
              <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-600">
                <Phone size={14} /> {SUPPORT_PHONE}
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
