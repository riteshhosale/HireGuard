import { Bookmark, ExternalLink, Heart, MessageCircle, MoreVertical, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const label = (value) => String(value || "OTHER").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
const riskClass = (risk) => ({ CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-red-50 text-red-600", MEDIUM: "bg-amber-50 text-amber-700", LOW: "bg-emerald-50 text-emerald-700", SAFE: "bg-emerald-50 text-emerald-700" }[risk] || "bg-slate-100 text-slate-600");

export default function PostCard({ post, onLike, onBookmark, onReport }) {
  return (
    <article className="dashboard-card overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-700">{post.author?.name?.slice(0, 1)?.toUpperCase() || "J"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-sm font-extrabold text-slate-800">{post.author?.name || "HireGuard user"}</p><p className="mt-0.5 text-[10px] text-slate-400">{post.createdAt ? new Date(post.createdAt).toLocaleString() : "Recently"} · {label(post.category)}</p></div>
            <button onClick={() => onReport?.(post)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-600" aria-label="Report post"><MoreVertical size={16}/></button>
          </div>
          <h2 className="mt-4 text-base font-extrabold text-slate-900">{post.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{post.description}</p>
          {post.suspiciousUrl && <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-600"><ExternalLink size={14} className="shrink-0 text-slate-400"/><span className="min-w-0 truncate">{post.suspiciousUrl}</span></div>}
          {post.scanAttached && <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">{["HIGH", "CRITICAL"].includes(post.riskLevel) ? <ShieldAlert size={17}/> : <ShieldCheck size={17}/>}</span><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-indigo-900">HireGuard AI security analysis</p><p className="mt-1 text-[10px] text-indigo-700">Attached scan{post.riskLevel ? ` · ${post.riskLevel} risk` : " · Results available"}</p></div>{post.scanId && <Link to={`/report/${encodeURIComponent(post.scanId)}`} className="text-[10px] font-extrabold text-indigo-700">View report</Link>}</div>}
          <div className="mt-5 flex items-center gap-1 border-t border-slate-100 pt-4"><button onClick={() => onLike?.(post)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${post.likedByMe ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-slate-50"}`}><Heart size={15} fill={post.likedByMe ? "currentColor" : "none"}/>{post.likesCount || 0}</button><Link to={`/community/post/${post.id}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"><MessageCircle size={15}/>{post.commentsCount || 0}</Link><button onClick={() => onBookmark?.(post)} className={`ml-auto rounded-lg p-2 ${post.savedByMe ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`} aria-label="Save post"><Bookmark size={15} fill={post.savedByMe ? "currentColor" : "none"}/></button></div>
        </div>
      </div>
    </article>
  );
}
