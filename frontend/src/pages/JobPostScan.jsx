import { useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { showToast } from "../components/common/ToastHost";
import { jobPostApi } from "../services/job-post.api";

const riskStyles = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-orange-200 bg-orange-50 text-orange-800",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-800",
};

export default function JobPostScan() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await jobPostApi.analyze(url.trim(), description.trim());
      setResult(response?.data || null);
      showToast("Job post assessment completed.", "success");
    } catch (err) {
      setError(err?.message || "Unable to assess this job post.");
    } finally {
      setLoading(false);
    }
  }

  const level = result?.riskLevel || "LOW";
  return (
    <Layout>
      <Seo title="LinkedIn Job Scam Checker" description="Assess a public LinkedIn job post for common job-scam warning signs." path="/job-post-scan" noindex />
      <Breadcrumbs items={[{ label: "LinkedIn job checker", to: "/job-post-scan" }]} />
      <div className="page-enter mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Job post investigation</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">LinkedIn Job Scam Checker</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Paste a public LinkedIn job URL. If LinkedIn blocks public access, paste the job description too. HireGuard checks the supplied text for common warning signs.</p>
        </div>

        <form onSubmit={submit} className="dashboard-card space-y-5 p-5 sm:p-7">
          <label className="block text-sm font-bold text-slate-700" htmlFor="linkedin-url">LinkedIn job URL</label>
          <input id="linkedin-url" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.linkedin.com/jobs/view/..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
          <label className="block text-sm font-bold text-slate-700" htmlFor="job-description">Job description <span className="font-normal text-slate-400">(recommended if the link is private)</span></label>
          <textarea id="job-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={30000} rows={7} placeholder="Paste the job description, salary, application instructions, recruiter contact, and any messages you received..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
          <p className="text-xs text-slate-400">{description.length}/30000 characters. The URL must be a LinkedIn /jobs/ link.</p>
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <><LoaderCircle size={17} className="animate-spin" /> Assessing post…</> : <><ShieldCheck size={17} /> Check job post</>}
          </button>
        </form>

        {result && <section className="dashboard-card mt-5 p-5 sm:p-7" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Assessment result</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">{result.jobTitle || "LinkedIn job post"}</h2><p className="mt-1 text-sm text-slate-500">{result.companyName || "Company not extracted from public metadata"}</p></div>
            <div className={`rounded-2xl border px-4 py-3 text-center ${riskStyles[level] || riskStyles.LOW}`}><div className="text-3xl font-black">{result.riskScore}/100</div><div className="text-xs font-extrabold">{level} RISK</div></div>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {result.extractionStatus === "FAILED" ? <><AlertTriangle size={17} className="mr-2 inline text-amber-600" />LinkedIn did not expose enough public information. {result.extractionMessage || "Paste the full job description and assess it again."}</> : <>{result.extractionStatus === "PARTIAL" ? <AlertTriangle size={17} className="mr-2 inline text-amber-600" /> : <CheckCircle2 size={17} className="mr-2 inline text-emerald-600" />}{result.extractionMessage || "Public job details were extracted."}</>}
          </div>
          <h3 className="mt-6 text-sm font-extrabold text-slate-800">Signals found</h3>
          {result.findings?.length ? <div className="mt-3 space-y-3">{result.findings.map((finding) => <div key={finding.code} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start gap-2"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-sm font-extrabold text-slate-800">{finding.title} <span className="ml-1 text-xs font-bold text-slate-400">+{finding.points}</span></p><p className="mt-1 text-sm leading-6 text-slate-500">{finding.description}</p></div></div></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No listed warning signs were found in the available information. This does not verify that the job is legitimate.</p>}
          <a href={result.sourceUrl || url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800">Open original LinkedIn post <ExternalLink size={15} /></a>
          <p className="mt-5 rounded-xl border border-slate-200 p-4 text-xs leading-5 text-slate-500">{result.disclaimer || "This automated assessment is not proof of fraud or legitimacy. Confirm the role on the company's official careers website and never pay to get hired or share OTPs/passwords."}</p>
        </section>}
      </div>
    </Layout>
  );
}
