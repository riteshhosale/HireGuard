import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Layout from "../components/layout/Layout";
import Seo from "../components/common/Seo";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthPage({ mode }) {
  const [params] = useSearchParams();
  const isSignup = (mode || params.get("mode") || "login") === "signup";
  const seoTitle = isSignup ? "Create your account" : "Sign in";
  const seoDescription = isSignup
    ? "Create a JobGuard AI account to investigate job postings and review security reports."
    : "Sign in to JobGuard AI to continue investigating job postings and reviewing security reports.";
  return (
    <Layout variant="auth">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={isSignup ? "/signup" : "/login"}
        noindex
      />
      <div className="grid min-h-screen lg:grid-cols-[1fr_.85fr]">
        <section className="hidden bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block font-display text-xl font-bold">
                JobGuard<span className="text-indigo-200">AI</span>
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-200">
                Security console
              </span>
            </span>
          </Link>
          <div className="max-w-xl">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-100">
              AI-powered job safety
            </span>
            <h2 className="mt-6 font-display text-5xl font-bold tracking-tight">
              Investigate before you apply.
            </h2>
            <p className="mt-5 text-sm leading-7 text-indigo-100">
              Analyze job postings with a security-focused workflow designed to
              surface suspicious redirects, forms and scam indicators.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Browser evidence", "Risk scoring", "Clear reports"].map(
                (x) => (
                  <div
                    key={x}
                    className="rounded-2xl bg-white/10 p-4 text-xs font-bold"
                  >
                    {x}
                  </div>
                ),
              )}
            </div>
          </div>
          <p className="text-[10px] text-indigo-200">
            JobGuard AI · Web security workspace
          </p>
        </section>
        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="mb-7 text-center lg:text-left">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 lg:mx-0">
                <ShieldCheck size={21} />
              </div>
              <h1 className="mt-5 font-display text-3xl font-bold">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {isSignup
                  ? "Start investigating job postings safely."
                  : "Sign in to continue to your security workspace."}
              </p>
            </div>
            {isSignup ? <Signup /> : <Login />}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="font-extrabold text-indigo-600">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-extrabold text-indigo-600">
                    Create one
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
