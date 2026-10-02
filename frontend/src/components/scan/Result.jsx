import { Link } from "react-router-dom";
import { ArrowUpRight, CircleAlert, ShieldCheck, TriangleAlert } from "lucide-react";

export default function Result({ scan, report, findings = [], score = 0, level = "EVALUATING" }) {
  const failed = String(scan?.status || "").toUpperCase() === "FAILED";
  const stopped = String(scan?.status || "").toUpperCase() === "STOPPED";
  const displayLevel = failed ? "SCAN FAILED" : String(level || "EVALUATING").toUpperCase();
  const danger = ["HIGH", "CRITICAL"].includes(displayLevel);
  const medium = displayLevel === "MEDIUM";
  const badge = failed || danger ? "bg-red-50 text-red-600" : medium ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600";
  const scoreColor = failed || danger ? "text-red-600" : medium ? "text-amber-600" : "text-indigo-600";
  const reportFindings = Array.isArray(report?.findings) ? report.findings : [];
  const allFindings = reportFindings.length ? reportFindings : findings;

  return (
    <section className="dashboard-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Scan result</p><h2 className="mt-1 font-display text-xl font-bold">Job safety analysis</h2><p className="mt-1 truncate text-[11px] text-slate-400">{scan?.jobUrl || scan?.url || "Investigation"}</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[9px] font-extrabold ${badge}`}>{failed ? <CircleAlert size={14}/> : danger ? <TriangleAlert size={14}/> : <ShieldCheck size={14}/>} {displayLevel}</span></div>
      <div className="grid gap-4 p-5 sm:grid-cols-[190px_1fr] sm:p-6"><div className="rounded-2xl bg-slate-50 p-5 text-center"><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Risk score</p><strong className={`mt-1 block font-display text-6xl font-bold ${scoreColor}`}>{failed ? "—" : score}</strong><p className="text-[10px] text-slate-400">out of 100</p></div><div className="flex flex-col justify-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Assessment</p><h3 className="mt-2 font-display text-2xl font-bold">{failed ? "The scan could not be completed." : stopped ? "The scan was stopped safely." : `${displayLevel} risk detected`}</h3><p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">{report?.summary || report?.aiAnalysis?.summary || scan?.error || (allFindings.length ? `${allFindings.length} suspicious signal${allFindings.length === 1 ? "" : "s"} detected.` : "No suspicious signals were reported.")}</p>{scan?.scanId && <Link to={`/report/${encodeURIComponent(scan.scanId)}`} className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white">Full report <ArrowUpRight size={14}/></Link>}</div></div>
      {allFindings.length > 0 && <div className="border-t border-slate-100 p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Findings</p><h3 className="mt-1 font-display text-lg font-bold">Suspicious signals</h3></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">{allFindings.length}</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{allFindings.map((finding, index) => <article key={finding?._id || finding?.id || index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-800">{finding?.title || finding?.name || finding?.type || "Suspicious activity"}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{finding?.explanation || finding?.description || finding?.message || finding?.evidence || "Suspicious signal detected."}</p></div>{typeof finding?.score === "number" && <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-extrabold text-slate-600">+{finding.score}</span>}</div>{finding?.severity && <span className="mt-3 inline-block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{finding.severity}</span>}</article>)}</div></div>}
    </section>
  );
}
