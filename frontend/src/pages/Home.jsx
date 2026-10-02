import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileSearch,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import { scanApi } from "../services/scan.api";

const normalizeScans = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.scans)) return data.scans;
  if (Array.isArray(response?.scans)) return response.scans;
  return [];
};

const riskOf = (scan) =>
  String(scan?.riskLevel || scan?.risk_level || scan?.risk || "").toUpperCase();
const statusOf = (scan) => String(scan?.status || "").toUpperCase();

const localBusinessSchema = {
  "@type": "LocalBusiness",
  "@id": "https://job-guardai-musa.vercel.app/#local-business",
  name: "HireGuard AI",
  url: "https://job-guardai-musa.vercel.app/",
  description:
    "Web security and job-scam investigation service for safer online job applications.",
  image: "https://job-guardai-musa.vercel.app/og-image.png",
};

function StatCard({ icon: Icon, label, value, change, tone = "indigo", note }) {
  const tones = {
    indigo: "bg-indigo-600 text-white",
    white: "bg-white text-slate-900",
    red: "bg-white text-slate-900",
    green: "bg-white text-slate-900",
  };
  return (
    <div
      className={`dashboard-card relative overflow-hidden p-5 ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${tone === "indigo" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          <Icon size={18} />
        </span>
        {change && (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${tone === "indigo" ? "bg-emerald-300/20 text-emerald-100" : change.startsWith("-") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
          >
            {change}
          </span>
        )}
      </div>
      <p
        className={`mt-5 text-[11px] font-bold ${tone === "indigo" ? "text-indigo-100" : "text-slate-400"}`}
      >
        {label}
      </p>
      <div className="mt-1 flex items-end gap-2">
        <strong
          className={`font-display text-3xl font-bold ${tone === "indigo" ? "text-white" : "text-slate-900"}`}
        >
          {value}
        </strong>
        {note && (
          <span
            className={`mb-1 text-[10px] ${tone === "indigo" ? "text-indigo-100" : "text-slate-400"}`}
          >
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const loggedIn = Boolean(localStorage.getItem("jobguard_access_token"));
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(loggedIn);

  useEffect(() => {
    if (!loggedIn) return;
    scanApi
      .getAll()
      .then((response) => setScans(normalizeScans(response)))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  const stats = useMemo(() => {
    const completed = scans.filter((s) => statusOf(s) === "COMPLETED").length;
    const dangerous = scans.filter((s) =>
      ["HIGH", "CRITICAL"].includes(riskOf(s)),
    ).length;
    const safe = scans.filter((s) =>
      ["LOW", "SAFE"].includes(riskOf(s)),
    ).length;
    const scores = scans
      .map((s) => Number(s.riskScore ?? s.risk_score))
      .filter(Number.isFinite);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return { completed, dangerous, safe, avg };
  }, [scans]);

  const recent = scans.slice(0, 5);
  const ringScore = Math.min(100, Math.max(0, stats.avg));
  const ringDeg = ringScore * 3.6;

  if (!loggedIn) {
    return (
      <Layout>
        <Seo
          title="AI Job Scam Investigation"
          description="Investigate job postings for suspicious redirects, unsafe URLs, credential collection and scam indicators with HireGuard AI."
          path="/"
          schema={localBusinessSchema}
        />
        <div className="page-enter mx-auto max-w-[1280px]">
          <div className="grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
            <section className="dashboard-card relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-7 text-white sm:p-10">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100">
                  <Sparkles size={13} /> AI security workspace
                </span>
                <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl">
                  Find risky jobs before they find you.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-indigo-100">
                  HireGuard AI investigates job postings, observes suspicious
                  behaviour and turns the evidence into a clear safety report.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 shadow-lg"
                  >
                    Start scanning <ArrowUpRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </section>
            <section className="dashboard-card flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShieldCheck size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">Security overview</p>
                    <p className="text-[11px] text-slate-400">
                      What HireGuard checks
                    </p>
                  </div>
                </div>
                <div className="mt-7 space-y-4">
                  {[
                    "Redirects & domains",
                    "Suspicious forms",
                    "Scam indicators",
                    "AI-assisted analysis",
                  ].map((x) => (
                    <div
                      key={x}
                      className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                    >
                      <CheckCircle2 size={17} className="text-indigo-500" />
                      {x}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-extrabold text-slate-800">
                  Built for safer applications
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Run an investigation before you share personal information
                  with a recruiter or job site.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Radar}
              label="Automated investigations"
              value="24/7"
              change="AI"
              tone="indigo"
              note="ready"
            />
            <StatCard
              icon={ShieldCheck}
              label="Security signals"
              value="20+"
              change="Rules"
              note="checks"
            />
            <StatCard
              icon={FileSearch}
              label="Evidence based"
              value="100%"
              change="Traceable"
              note="reports"
            />
            <StatCard
              icon={Target}
              label="Workflow"
              value="3 steps"
              change="Fast"
              note="scan → analyze → report"
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title="Security Dashboard"
        description="Review HireGuard AI job-safety investigations, risk levels and recent scan activity."
        path="/"
        noindex
      />
      <div className="page-enter mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              HireGuard workspace
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Monitor your job-safety investigations from one place.
            </p>
          </div>
          <Link
            to="/scan"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/20"
          >
            <Radar size={15} /> New scan
          </Link>
        </div>

        <div className="mt-4 dashboard-card flex flex-col gap-4 border-indigo-100 bg-indigo-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Share a job-scam experience
              </h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
                Help other job seekers recognize warning signs. You can attach a
                HireGuard AI scan to a community report.
              </p>
            </div>
          </div>
          <Link
            to="/community/create"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[10px] font-extrabold text-white"
          >
            <UsersRound size={14} /> Community
          </Link>
        </div>

        <div className="mt-4">
          <section className="dashboard-card p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Risk overview
                </h2>
                <p className="text-[11px] text-slate-400">
                  Average score from reports
                </p>
              </div>
              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400">
                All time
              </span>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="risk-ring grid h-32 w-32 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#4f46e5 0deg ${ringDeg}deg, #ef4444 ${ringDeg}deg ${Math.min(360, ringDeg + 35)}deg, #d8d9e2 ${Math.min(360, ringDeg + 35)}deg 360deg)`,
                }}
              >
                <div className="risk-ring-inner grid h-24 w-24 place-items-center rounded-full">
                  <div className="text-center">
                    <strong className="font-display text-2xl">
                      {loading ? "—" : ringScore}
                    </strong>
                    <p className="text-[9px] font-bold text-slate-400">
                      AVG SCORE
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-[11px] font-bold text-slate-600">
                <p>
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  Low / safe <b className="ml-3">{stats.safe}</b>
                </p>
                <p>
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Medium{" "}
                  <b className="ml-3">
                    {scans.filter((s) => riskOf(s) === "MEDIUM").length}
                  </b>
                </p>
                <p>
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  High / critical <b className="ml-3">{stats.dangerous}</b>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
          <section className="dashboard-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Recent investigations
                </h2>
                <p className="text-[11px] text-slate-400">
                  Latest job URLs and outcomes
                </p>
              </div>
              <Link
                to="/history"
                className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-600"
              >
                History
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No investigations yet. Start your first scan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((scan) => {
                  const risk = riskOf(scan) || "EVALUATING";
                  const isDanger = ["HIGH", "CRITICAL"].includes(risk);
                  return (
                    <Link
                      key={scan._id || scan.id || scan.scanId}
                      to={
                        scan.scanId
                          ? `/report/${encodeURIComponent(scan.scanId)}`
                          : "/history"
                      }
                      className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isDanger ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        <FileSearch size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-slate-800">
                          {scan.jobUrl ||
                            scan.url ||
                            scan.targetUrl ||
                            "Job posting scan"}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {scan.createdAt
                            ? new Date(scan.createdAt).toLocaleString()
                            : statusOf(scan) || "Scan"}
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${isDanger ? "bg-red-50 text-red-600" : risk === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {risk}
                      </span>
                      <ExternalLink size={14} className="text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dashboard-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={19} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">
                  Safety checklist
                </h2>
                <p className="text-[11px] text-slate-400">Before you apply</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                "Never pay to receive a job",
                "Check the employer domain",
                "Avoid sharing OTPs or banking PINs",
                "Review the scan evidence",
              ].map((x) => (
                <div key={x} className="flex gap-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-indigo-500"
                  />
                  <p className="text-xs font-semibold leading-5 text-slate-600">
                    {x}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
