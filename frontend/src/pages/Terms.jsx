import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";

export default function Terms() {
  return <Layout><Seo title="Terms and Conditions" description="Terms and conditions for using HireGuard AI investigation services." path="/terms" />
    <article className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="dashboard-card p-6 sm:p-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: September 28, 2026</p>
        <div className="prose mt-8 max-w-none text-sm leading-7 text-slate-600">
          <h2>Service</h2><p>HireGuard AI provides automated investigation tools intended to help users identify suspicious signals in public job postings. Results are informational and should not be treated as a guarantee that a job, employer, domain, or offer is safe or fraudulent.</p>
          <h2>Acceptable use</h2><p>Use the service only for lawful investigations of public URLs that you are authorized to inspect. Do not attempt to scan private systems, bypass access controls, submit credentials, or abuse the service.</p>
          <h2>Accuracy</h2><p>Automated browser observations, rule-based findings, and AI-generated explanations can contain false positives or false negatives. Verify important findings independently before taking action.</p>
          <h2>Accounts</h2><p>You are responsible for keeping your account credentials secure and for activity performed through your account. Do not share authentication tokens.</p>
          <h2>Availability</h2><p>The service may change, be interrupted, or be rate-limited to protect users and infrastructure.</p>
          <h2>Contact</h2><p>Support contact information is available in the site footer when configured by the service operator.</p>
        </div>
      </div>
    </article>
  </Layout>;
}
