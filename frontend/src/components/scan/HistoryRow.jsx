import { ExternalLink, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HistoryRow({ scan }) {
  const level = (
    scan.riskLevel ||
    (scan.riskScore > 65
      ? "HIGH"
      : scan.riskScore > 30
        ? "MEDIUM"
        : "LOW")
  ).toUpperCase();

  const danger = ["HIGH", "CRITICAL"].includes(level);
  const warn = level === "MEDIUM";

  return (
    <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[1.5fr_.8fr_.65fr_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
          <ExternalLink size={20} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-display font-bold">
            {new URL(scan.jobUrl).hostname}
          </h3>

          <p className="truncate text-xs text-slate-500">
            {scan.jobUrl}
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        <span className="block uppercase tracking-wider">
          Scanned
        </span>

        <span className="font-semibold text-slate-700">
          {scan.createdAt
            ? new Date(scan.createdAt).toLocaleString()
            : "Recently"}
        </span>
      </div>

      <span
        className={`w-fit rounded-full px-3 py-2 text-xs font-bold ${
          danger
            ? "bg-red-50 text-red-700"
            : warn
              ? "bg-amber-50 text-amber-700"
              : "bg-[#eef2ff] text-[#4338ca]"
        }`}
      >
        {danger
          ? "High Risk"
          : warn
            ? "Suspicious"
            : level === "QUEUED"
              ? "Queued"
              : "Safe"}
      </span>

      <Link
        to={`/scan?scanId=${encodeURIComponent(scan.scanId)}`}
        className="inline-flex w-fit items-center gap-1 text-sm font-bold text-[#07843e]"
      >
        View <ChevronRight size={16} />
      </Link>
    </article>
  );
}