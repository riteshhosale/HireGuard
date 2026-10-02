import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, FileText, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import { scanApi } from "../services/scan.api";
import { reportApi } from "../services/report.api";
import { findingApi } from "../services/finding.api";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";

export default function Report() {
  const { scanId } = useParams();
  const reportPath = scanId ? `/report/${encodeURIComponent(scanId)}` : "/report";
  const [scan, setScan] = useState(null);
  const [report, setReport] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scanId) { setError("Scan ID is missing."); setLoading(false); return; }
    Promise.all([scanApi.get(scanId), reportApi.get(scanId), findingApi.get(scanId).catch(() => ({ data: [] }))]).then(([s, r, f]) => { setScan(s?.data || null); setReport(r?.data || null); setFindings(Array.isArray(f?.data) ? f.data : []); }).catch((e) => setError(e?.message || "Unable to load the scan report.")).finally(() => setLoading(false));
  }, [scanId]);

  const allFindings = Array.isArray(report?.findings) && report.findings.length ? report.findings : findings;
  const score = useMemo(() => typeof report?.riskScore === "number" ? report.riskScore : typeof report?.risk_score === "number" ? report.risk_score : allFindings.reduce((t, f) => t + (typeof f?.score === "number" ? f.score : 0), 0), [report, allFindings]);
  const level = String(report?.riskLevel ?? report?.risk_level ?? scan?.riskLevel ?? scan?.risk_level ?? "EVALUATING").toUpperCase();
  const danger = ["HIGH", "CRITICAL"].includes(level);
  const medium = level === "MEDIUM";

  if (loading) return <Layout><div className="grid min-h-[60vh] place-items-center"><div className="text-center"><LoaderCircle size={35} className="mx-auto animate-spin text-indigo-600"/><p className="mt-3 text-xs font-bold text-slate-400">Loading report...</p></div></div></Layout>;
  if (error) return <Layout>
    <Seo title="Security Report" description="JobGuard AI security report for a scanned job posting." path={reportPath} noindex />
    <Breadcrumbs items={[{ label: "History", to: "/history" }, { label: "Report", to: reportPath }]} /><div className="mx-auto max-w-xl py-16"><div className="dashboard-card p-8 text-center"><CircleAlert size={40} className="mx-auto text-red-500"/><h1 className="mt-4 font-display text-2xl font-bold">Unable to load report</h1><p className="mt-2 text-xs text-slate-500">{error}</p><Link to="/history" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white"><ArrowLeft size={14}/> Back to history</Link></div></div></Layout>;

  return (
    <Layout>
      <Seo title="Security Report" description="Review the evidence, findings and risk assessment for a JobGuard AI investigation." path={reportPath} noindex />
      <Breadcrumbs items={[{ label: "History", to: "/history" }, { label: "Report", to: reportPath }]} />
      <div className="page-enter mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><Link to="/history" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400 hover:text-indigo-600"><ArrowLeft size={13}/> Back to history</Link><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Security report</h1><p className="mt-1 truncate text-xs text-slate-400">{scan?.jobUrl || scan?.url || "Job posting investigation"}</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[9px] font-extrabold ${danger ? "bg-red-50 text-red-600" : medium ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{danger ? <TriangleAlert size={14}/> : <ShieldCheck size={14}/>} {level}</span></div>
        <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
          <section className="dashboard-card p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FileText size={18}/></span><div><h2 className="font-display text-lg font-bold">Risk score</h2><p className="text-[10px] text-slate-400">Final backend assessment</p></div></div><div className="mt-7 text-center"><div className="mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(${danger ? "#ef4444" : medium ? "#f59e0b" : "#4f46e5"} ${Math.max(0, Math.min(100, score)) * 3.6}deg, #e8e8ef 0deg)` }}><div className="grid h-32 w-32 place-items-center rounded-full bg-white"><div><strong className={`font-display text-5xl font-bold ${danger ? "text-red-600" : medium ? "text-amber-600" : "text-indigo-600"}`}>{score}</strong><p className="text-[9px] font-extrabold text-slate-400">OUT OF 100</p></div></div></div></div><div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Status</p><p className="mt-1 text-sm font-extrabold">{scan?.status || "—"}</p><p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Scan ID</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">{scan?.scanId || scanId}</p></div></section>
          <section className="dashboard-card p-6"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Assessment</p><h2 className="mt-2 font-display text-2xl font-bold">{danger ? "Review this posting carefully." : medium ? "Some signals need attention." : "No major risk signals reported."}</h2><p className="mt-3 text-xs leading-6 text-slate-500">{report?.summary || report?.aiAnalysis?.summary || "The scanner completed its investigation. Review the evidence below before taking action on the job posting."}</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-extrabold text-slate-400">FINDINGS</p><p className="mt-1 font-display text-2xl font-bold">{allFindings.length}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-extrabold text-slate-400">STATUS</p><p className="mt-1 text-sm font-bold">{scan?.status || "—"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-extrabold text-slate-400">COMPLETED</p><p className="mt-1 text-sm font-bold">{scan?.completedAt ? new Date(scan.completedAt).toLocaleDateString() : "—"}</p></div></div></section>
        </div>
        <section className="dashboard-card mt-4 overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-display text-lg font-bold">Evidence & findings</h2><p className="text-[11px] text-slate-400">Signals returned by the scanner and report engine.</p></div>{allFindings.length === 0 ? <div className="p-10 text-center"><ShieldCheck size={30} className="mx-auto text-emerald-500"/><p className="mt-3 text-sm font-bold text-slate-700">No findings reported</p><p className="mt-1 text-xs text-slate-400">The backend did not return suspicious signals for this investigation.</p></div> : <div className="grid gap-3 p-5 md:grid-cols-2">{allFindings.map((finding, i) => <article key={finding?._id || finding?.id || i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-800">{finding?.title || finding?.name || finding?.type || "Suspicious signal"}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{finding?.explanation || finding?.description || finding?.message || finding?.evidence || "No additional explanation provided."}</p></div>{typeof finding?.score === "number" && <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-extrabold">+{finding.score}</span>}</div>{finding?.severity && <span className="mt-3 inline-block rounded-md bg-white px-2 py-1 text-[8px] font-extrabold uppercase text-slate-400">{finding.severity}</span>}</article>)}</div>}</section>
      </div>
    </Layout>
  );
}
