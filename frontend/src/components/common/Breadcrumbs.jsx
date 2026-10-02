import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  const all = [{ label: "Home", to: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400">
      {all.map((item, index) => (
        <span key={`${item.to}-${item.label}`} className="inline-flex items-center gap-1.5">
          {index === 0 ? <Home size={12} /> : null}
          {index < all.length - 1 ? (
            <Link to={item.to} className="transition hover:text-indigo-600">{item.label}</Link>
          ) : (
            <span aria-current="page" className="text-slate-600">{item.label}</span>
          )}
          {index < all.length - 1 ? <ChevronRight size={11} /> : null}
        </span>
      ))}
    </nav>
  );
}
