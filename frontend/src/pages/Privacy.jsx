import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";

export default function Privacy() {
  return <Layout><Seo title="Privacy Policy" description="Learn how HireGuard AI handles account, scan and analytics data." path="/privacy" />
    <article className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="dashboard-card p-6 sm:p-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: September 28, 2026</p>
        <div className="prose mt-8 max-w-none text-sm leading-7 text-slate-600">
          <h2>Information we process</h2><p>HireGuard AI processes account information such as your name and email address, authentication tokens, and the public job URLs you submit for investigation. Scan evidence and reports are stored to provide the investigation history and report features.</p>
          <h2>How we use information</h2><p>We use this information to authenticate users, run requested security investigations, produce reports, maintain service security, and improve reliability. We do not ask you to submit passwords, payment credentials, OTPs, or other private secrets from a job site.</p>
          <h2>Analytics and cookies</h2><p>Essential browser storage may be used for authentication and privacy preferences. Optional analytics is loaded only after you choose to allow analytics in the cookie banner. You can clear the consent value from your browser storage to be asked again.</p>
          <h2>Security</h2><p>Secrets such as database credentials and API keys belong on the server environment and are not intentionally exposed to the frontend. Authentication uses access and refresh tokens and protected API routes.</p>
          <h2>Third parties</h2><p>Submitted public URLs may be accessed by the scanner infrastructure to perform the investigation. Optional analytics may use Google Analytics when configured by the service operator and accepted by the visitor.</p>
          <h2>Your choices</h2><p>You can request account or data-related changes through the support contact configured on the site. Do not submit confidential credentials to HireGuard AI or to the job site being investigated.</p>
        </div>
      </div>
    </article>
  </Layout>;
}
