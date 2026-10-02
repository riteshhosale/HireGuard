import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Cta() {
  return (
    <section className="mx-5 mb-16 flex flex-col justify-between gap-6 rounded-3xl bg-[linear-gradient(120deg,#067b3b,#0cbd5b)] p-8 text-white sm:p-12 lg:mx-10 lg:flex-row lg:items-center">
      <div>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          Don't apply blindly.
          <br />
          Check it first.
        </h2>

        <p className="mt-3 text-sm text-[#d9f8e5]">
          Investigate job postings and make safer career decisions.
        </p>
      </div>

      <Link
        to="/scan"
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#4338ca]"
      >
        Start a Job Scan <ArrowRight size={17} />
      </Link>
    </section>
  );
}