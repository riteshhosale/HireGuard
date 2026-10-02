import { Link } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";

export default function NotFound() {
  return (
    <Layout>
      <Seo title="Page not found" description="The JobGuard AI page you requested could not be found." path="/404" noindex />
      <section className="mx-auto max-w-xl py-16 text-center">
        <div className="dashboard-card p-8 sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><SearchX size={28} /></div>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">404 error</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">This JobGuard AI route does not exist. Return to the dashboard or start a new investigation.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white"><Home size={14} /> Home</Link>
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200"><ArrowLeft size={14} /> Scan a job</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
