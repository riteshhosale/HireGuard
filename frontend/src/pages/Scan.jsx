import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert, ExternalLink, Link2, LoaderCircle, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { scanApi } from "../services/scan.api";
import { reportApi } from "../services/report.api";
import { findingApi } from "../services/finding.api";
import { validateJobUrl } from "../utils/validators";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { showToast } from "../components/common/ToastHost";
import Result from "../components/scan/Result";

const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "STOPPED"];

export default function Scan() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState(null);
  const [report, setReport] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const loadResult = async (scanId) => {
    const [scanResponse, reportResponse, findingsResponse] = await Promise.all([
      scanApi.get(scanId),
      reportApi.get(scanId).catch(() => ({ data: null })),
      findingApi.get(scanId).catch(() => ({ data: [] })),
    ]);
    const nextScan = scanResponse?.data ?? null;
    const nextReport = reportResponse?.data ?? null;
    const nextFindings = Array.isArray(findingsResponse?.data) ? findingsResponse.data : [];
    setScan(nextScan);
    setReport(nextReport);
    setFindings(nextFindings);
    return { scan: nextScan, report: nextReport, findings: nextFindings };
  };

  useEffect(() => {
    const scanId = params.get("scanId");
    if (!scanId) return;
    setError("");
    loadResult(scanId).catch((err) => setError(err?.message || "Unable to load scan result."));
  }, [params]);

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setScan(null); setReport(null); setFindings([]); setProgress(0);
    const validation = validateJobUrl(url);
    if (!validation.valid) return setError(validation.message);
    setLoading(true); setProgress(10);
    try {
      const created = await scanApi.create(url.trim());
      const scanId = created?.data?.scanId || created?.data?.scan_id;
      if (!scanId) throw new Error("Backend did not return a scan ID.");
      setProgress(15);
      let completed = false;
      for (let attempt = 0; attempt < 60 && !completed; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setProgress(Math.min(92, 18 + attempt * 4));
        const response = await scanApi.get(scanId);
        const current = response?.data ?? null;
        if (!current) throw new Error("Invalid scan response from backend.");
        setScan(current);
        completed = TERMINAL_STATUSES.includes(String(current.status).toUpperCase());
      }
      if (!completed) throw new Error("Scan timed out. Check History for the result.");
      await loadResult(scanId);
      setProgress(100);
      showToast("Investigation completed successfully.", "success");
    } catch (err) {
      setError(err?.message || "Something went wrong while scanning the job.");
    } finally { setLoading(false); }
  };

  const reportFindings = Array.isArray(report?.findings) ? report.findings : [];
  const allFindings = reportFindings.length ? reportFindings : findings;
  const reportScore = typeof report?.riskScore === "number" ? report.riskScore : typeof report?.risk_score === "number" ? report.risk_score : allFindings.reduce((t, f) => t + (typeof f?.score === "number" ? f.score : 0), 0);
  const score = Math.max(0, Math.min(100, reportScore || Number(scan?.riskScore ?? scan?.risk_score ?? 0)));
  const level = String(report?.riskLevel ?? report?.risk_level ?? scan?.riskLevel ?? scan?.risk_level ?? "EVALUATING").toUpperCase();

  return (
    <Layout>
      <Seo title="Scan a Job Posting" description="Scan a public job posting URL with HireGuard AI for suspicious redirects, forms, domains and scam signals." path="/scan" noindex />
        <Breadcrumbs items={[{ label: "Scan a job", to: "/scan" }]} />
      <div className="page-enter mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Security scanner</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Scan a job posting</h1><p className="mt-1 text-xs text-slate-400">Paste a public job URL and let HireGuard investigate it.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-extrabold text-slate-500 shadow-sm"><ShieldCheck size={14} className="text-indigo-500"/> Safe investigation mode</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <section className="dashboard-card overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:p-7">
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><Radar size={21}/></span><div><h2 className="font-display text-xl font-bold">New investigation</h2><p className="text-[11px] text-indigo-100">Browser observation + rule engine + AI analysis</p></div></div>
            </div>
            <form onSubmit={submit} autoComplete="off" className="p-6 sm:p-7">
              <input aria-hidden="true" tabIndex="-1" name="website" className="sr-only" autoComplete="off" />
              <label className="text-xs font-extrabold text-slate-700">Job posting URL</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Link2 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a public job posting URL" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" disabled={loading}/></div><button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><LoaderCircle size={17} className="animate-spin"/> Scanning...</> : <><Radar size={17}/> Start scan</>}</button></div>
              {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"><CircleAlert size={16} className="shrink-0"/>{error}</div>}
              {loading && <div className="mt-6"><div className="flex justify-between text-[10px] font-bold text-slate-400"><span>Investigation progress</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}/></div><p className="mt-2 text-[10px] text-slate-400">The scanner may take a little while while the target page is observed.</p></div>}
              <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><Radar size={15} className="text-indigo-500"/><p className="mt-2 text-[11px] font-extrabold">Observe</p><p className="mt-1 text-[10px] leading-4 text-slate-400">Redirects and page behaviour</p></div><div className="rounded-xl bg-slate-50 p-3"><ShieldCheck size={15} className="text-indigo-500"/><p className="mt-2 text-[11px] font-extrabold">Detect</p><p className="mt-1 text-[10px] leading-4 text-slate-400">Suspicious security signals</p></div><div className="rounded-xl bg-slate-50 p-3"><Sparkles size={15} className="text-indigo-500"/><p className="mt-2 text-[11px] font-extrabold">Explain</p><p className="mt-1 text-[10px] leading-4 text-slate-400">AI-assisted report summary</p></div></div>
            </form>
          </section>

          <section className="dashboard-card p-6">
            <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">How it works</h2><p className="text-[11px] text-slate-400">Three layers of protection</p></div><span className="rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-extrabold text-indigo-600">SECURE</span></div>
            <div className="mt-6 space-y-5">{[["01", "Safe browser", "The target is opened in an isolated investigation flow."], ["02", "Evidence", "Redirects, forms and suspicious signals are collected."], ["03", "Risk report", "The findings are combined into a readable risk assessment."]].map(([n, title, text]) => <div key={n} className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-[10px] font-extrabold text-indigo-600">{n}</span><div><p className="text-sm font-extrabold text-slate-800">{title}</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{text}</p></div></div>)}</div>
            <div className="mt-7 rounded-2xl bg-slate-900 p-4 text-white"><p className="flex items-center gap-2 text-xs font-extrabold"><ShieldCheck size={15} className="text-indigo-300"/> Investigation policy</p><p className="mt-2 text-[10px] leading-5 text-slate-400">Use HireGuard to inspect job postings. Do not submit passwords, payment details or private credentials to a suspicious site.</p></div>
          </section>
        </div>

        {scan && <div className="mt-4"><Result scan={scan} report={report} findings={findings} score={score} level={level}/><div className="mt-3 flex justify-end">{scan.scanId && <button onClick={() => navigate(`/report/${encodeURIComponent(scan.scanId)}`)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-indigo-600 shadow-sm ring-1 ring-slate-200">Open full report <ExternalLink size={14}/></button>}</div></div>}
      </div>
    </Layout>
  );
}
