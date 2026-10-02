import { useEffect, useState } from "react";
import { Cookie, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "jobguard_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(STORAGE_KEY));
  }, []);

  const choose = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent("jobguard:cookie-consent", { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-5 sm:flex sm:items-center sm:gap-5" role="dialog" aria-label="Cookie consent">
      <div className="flex min-w-0 flex-1 gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Cookie size={18} /></span>
        <div>
          <p className="text-sm font-extrabold text-slate-900">Privacy choices</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">JobGuard uses essential storage to keep you signed in. Optional analytics is only enabled after you allow it. Read our <a href="/privacy" className="font-bold text-indigo-600 hover:underline">Privacy Policy</a>.</p>
        </div>
      </div>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button onClick={() => choose("essential")} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50">Essential only</button>
        <button onClick={() => choose("all")} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-indigo-700"><ShieldCheck size={14} /> Allow analytics</button>
      </div>
    </aside>
  );
}
