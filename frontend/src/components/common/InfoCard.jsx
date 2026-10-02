export default function InfoCard({ Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#a8dfb8] hover:shadow-xl">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
        <Icon size={23} />
      </div>

      <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}