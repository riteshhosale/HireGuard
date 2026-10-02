export default function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}

      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-normal outline-none transition placeholder:text-slate-400 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
      />
    </label>
  );
}