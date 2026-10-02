import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const EVENT = "jobguard:toast";

export function showToast(message, type = "info") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, type } }));
}

export default function ToastHost() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const onToast = (event) => {
      setToast(event.detail || null);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      window.clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-indigo-200 bg-indigo-50 text-indigo-800",
  };
  const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? CircleAlert : Info;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] flex justify-center sm:inset-x-auto sm:right-5 sm:left-auto sm:w-[min(420px,calc(100vw-2rem))]" role="status" aria-live="polite">
      <div className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl shadow-slate-900/15 ${styles[toast.type] || styles.info}`}>
        <Icon size={17} className="mt-0.5 shrink-0" />
        <span className="min-w-0 flex-1 leading-5">{toast.message}</span>
        <button type="button" onClick={() => setToast(null)} className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100" aria-label="Dismiss message">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
