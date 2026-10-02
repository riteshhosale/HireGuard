import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Clock3, FileSearch, RefreshCw, Search, ShieldAlert } from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { scanApi } from "../services/scan.api";
import { showToast } from "../components/common/ToastHost";

const listFrom = (response) => Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.scans) ? response.data.scans : [];
const risk = (s) => String(s?.riskLevel || s?.risk_level || s?.risk || "EVALUATING").toUpperCase();

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = () => { setLoading(true); scanApi.getAll().then((r) => { setScans(listFrom(r)); showToast("History refreshed.", "success"); }).catch(() => { setScans([]); showToast("Could not load scan history.", "error"); }).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = useMemo(() => scans.filter((s) => {
    const text = `${s?.jobUrl || s?.url || s?.targetUrl || ""}`.toLowerCase();
    const matchesText = text.includes(query.toLowerCase());
    const matchesRisk = filter === "ALL" || risk(s) === filter;
    return matchesText && matchesRisk;
  }), [scans, query, filter]);

  const badge = (level) => {
    if (["HIGH", "CRITICAL"].includes(level)) return "bg-red-50 text-red-600";
    if (level === "MEDIUM") return "bg-amber-50 text-amber-600";
    if (["LOW", "SAFE"].includes(level)) return "bg-emerald-50 text-emerald-600";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <Layout>
      <Seo title="Scan History" description="Review previous JobGuard AI job investigations and reopen security reports." path="/history" noindex />
        <Breadcrumbs items={[{ label: "History", to: "/history" }]} />
      <div className="page-enter mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Investigation archive</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Scan history</h1><p className="mt-1 text-xs text-slate-400">Review every job investigation and reopen its report.</p></div><button onClick={load} className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-200"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh</button></div>

        <div className="mb-4 grid gap-4 sm:grid-cols-3"><div className="dashboard-card p-4"><p className="text-[10px] font-bold text-slate-400">TOTAL INVESTIGATIONS</p><p className="mt-1 font-display text-2xl font-bold">{scans.length}</p></div><div className="dashboard-card p-4"><p className="text-[10px] font-bold text-slate-400">COMPLETED</p><p className="mt-1 font-display text-2xl font-bold">{scans.filter((s) => String(s.status).toUpperCase() === "COMPLETED").length}</p></div><div className="dashboard-card p-4"><p className="text-[10px] font-bold text-slate-400">HIGH / CRITICAL</p><p className="mt-1 font-display text-2xl font-bold text-red-600">{scans.filter((s) => ["HIGH", "CRITICAL"].includes(risk(s))).length}</p></div></div>

        <section className="dashboard-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative sm:w-80"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search job URL..." className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-xs font-semibold outline-none ring-1 ring-transparent focus:bg-white focus:ring-indigo-200"/></div><div className="flex flex-wrap gap-1.5">{["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-2.5 py-2 text-[9px] font-extrabold ${filter === item ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{item}</button>)}</div></div>
          {loading ? <div className="p-12 text-center text-sm text-slate-400">Loading investigation history...</div> : filtered.length === 0 ? <div className="p-12 text-center"><FileSearch size={30} className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-600">No matching investigations</p><p className="mt-1 text-xs text-slate-400">Start a new scan or adjust your filters.</p><Link to="/scan" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white">Scan a job <ArrowUpRight size={14}/></Link></div> : <div className="divide-y divide-slate-100">{filtered.map((scan) => { const level = risk(scan); const danger = ["HIGH", "CRITICAL"].includes(level); const id = scan.scanId || scan._id || scan.id; return <Link key={id} to={id ? `/report/${encodeURIComponent(id)}` : "/history"} className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_150px_120px_24px] sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${danger ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}>{danger ? <ShieldAlert size={16}/> : <FileSearch size={16}/>}</span><span className="min-w-0"><span className="block truncate text-xs font-extrabold text-slate-800">{scan.jobUrl || scan.url || scan.targetUrl || "Job posting"}</span><span className="mt-1 block text-[10px] text-slate-400">{scan.createdAt ? new Date(scan.createdAt).toLocaleString() : "Date unavailable"}</span></span></div><span className="text-[10px] font-bold uppercase text-slate-400">{String(scan.status || "unknown")}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-extrabold ${badge(level)}`}>{level}</span><ArrowUpRight size={15} className="text-slate-300"/></Link>})}</div>}
        </section>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-[11px] font-semibold text-indigo-800"><Clock3 size={15}/><span>Reports remain available through the scan history API. Reopen any completed investigation to inspect its findings.</span><CheckCircle2 size={15} className="ml-auto text-indigo-500"/></div>
      </div>
    </Layout>
  );
}
