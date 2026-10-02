export default function SectionIntro({ tag, title, text }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl px-5 text-center">
      <span className="text-[11px] font-extrabold tracking-[.14em] text-[#4f46e5]">
        {tag}
      </span>

      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}