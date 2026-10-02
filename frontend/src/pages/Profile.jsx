import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronRight, Mail, Radar, ShieldAlert, UserRound } from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { authApi } from "../services/auth.api";
import { scanApi } from "../services/scan.api";

const scansFrom = (response) => Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.scans) ? response.data.scans : [];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authApi.me(), scanApi.getAll()]).then(([me, scanResult]) => {
      const nextUser = me?.data?.user || me?.data || me?.user || me;
      setUser(nextUser);
      if (nextUser) localStorage.setItem("jobguard_user", JSON.stringify(nextUser));
      setScans(scansFrom(scanResult));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: scans.length,
    completed: scans.filter((s) => String(s.status).toUpperCase() === "COMPLETED").length,
    danger: scans.filter((s) => ["HIGH", "CRITICAL"].includes(String(s.riskLevel || s.risk_level || s.risk || "").toUpperCase())).length,
  }), [scans]);

  const initials = (user?.name || "User").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Layout>
      <Seo title="User Profile" description="Manage your JobGuard AI account and review your job-safety investigation activity." path="/profile" noindex />
        <Breadcrumbs items={[{ label: "Profile", to: "/profile" }]} />
      <div className="page-enter mx-auto max-w-[1280px]">
        <div className="mb-5"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Account center</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">User profile</h1><p className="mt-1 text-xs text-slate-400">Your account, scan activity and security workspace.</p></div>
        <div className="grid gap-4 xl:grid-cols-[.75fr_1.25fr]">
          <section className="dashboard-card overflow-hidden"><div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600"/><div className="px-6 pb-6"><div className="-mt-10 grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-indigo-100 font-display text-2xl font-bold text-indigo-700 shadow-lg">{initials}</div><h2 className="mt-4 font-display text-xl font-bold">{loading ? "Loading..." : user?.name || "User"}</h2><p className="mt-1 text-xs text-slate-400">{user?.email || "Account email"}</p><div className="mt-5 space-y-3"><div className="flex items-center gap-3 text-xs font-semibold text-slate-600"><Mail size={15} className="text-indigo-500"/>{user?.email || "—"}</div><div className="flex items-center gap-3 text-xs font-semibold text-slate-600"><CalendarDays size={15} className="text-indigo-500"/>{user?.createdAt ? `Member since ${new Date(user.createdAt).toLocaleDateString()}` : "Member since —"}</div><div className="flex items-center gap-3 text-xs font-semibold text-slate-600"><UserRound size={15} className="text-indigo-500"/>ID: <span className="truncate font-mono text-[10px]">{user?._id || user?.id || "—"}</span></div></div></div></section>
          <section className="grid gap-4 sm:grid-cols-2"><div className="dashboard-card p-5"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Radar size={18}/></span><span className="text-[9px] font-extrabold uppercase text-slate-400">All time</span></div><p className="mt-6 text-[10px] font-bold text-slate-400">TOTAL SCANS</p><p className="mt-1 font-display text-4xl font-bold">{loading ? "—" : stats.total}</p><p className="mt-1 text-[10px] text-slate-400">Job investigations</p></div><div className="dashboard-card p-5"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={18}/></span><span className="text-[9px] font-extrabold uppercase text-emerald-500">Ready</span></div><p className="mt-6 text-[10px] font-bold text-slate-400">COMPLETED</p><p className="mt-1 font-display text-4xl font-bold">{loading ? "—" : stats.completed}</p><p className="mt-1 text-[10px] text-slate-400">Reports available</p></div><div className="dashboard-card p-5 sm:col-span-2"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><ShieldAlert size={18}/></span><div><p className="text-[10px] font-bold text-slate-400">HIGH / CRITICAL FINDINGS</p><p className="mt-1 font-display text-3xl font-bold">{loading ? "—" : stats.danger}</p></div></div><p className="mt-3 text-xs leading-5 text-slate-400">These investigations contain a high or critical risk classification and may deserve a closer review before applying.</p></div></section>
        </div>
        <section className="dashboard-card mt-4 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-display text-lg font-bold">Recent activity</h2><p className="text-[11px] text-slate-400">Your latest investigations</p></div><Link to="/history" className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600">Full history <ChevronRight size={14}/></Link></div>{scans.length === 0 ? <div className="p-8 text-center text-xs text-slate-400">No scan activity yet. <Link to="/scan" className="font-bold text-indigo-600">Start a scan</Link></div> : <div className="divide-y divide-slate-100">{scans.slice(0, 6).map((scan) => <Link key={scan._id || scan.id || scan.scanId} to={scan.scanId ? `/report/${encodeURIComponent(scan.scanId)}` : "/history"} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Radar size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-slate-800">{scan.jobUrl || scan.url || scan.targetUrl || "Job posting"}</span><span className="mt-1 block text-[10px] text-slate-400">{scan.createdAt ? new Date(scan.createdAt).toLocaleString() : String(scan.status || "Scan")}</span></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-extrabold text-slate-500">{String(scan.status || "UNKNOWN")}</span><ChevronRight size={15} className="text-slate-300"/></Link>)}</div>}</section>
      </div>
    </Layout>
  );
}
