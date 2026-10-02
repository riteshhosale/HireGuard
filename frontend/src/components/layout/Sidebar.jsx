import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radar,
  History,
  UserRound,
  ShieldCheck,
  FileText,
  LogIn,
  UserPlus,
  X,
  UsersRound,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/scan", label: "Scan Job", icon: Radar },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/community", label: "Community", icon: UsersRound },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const loggedIn = Boolean(localStorage.getItem("jobguard_access_token"));

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[244px] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-900/5 transition-transform duration-200 md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck size={21} strokeWidth={2.4} />
            </span>
            <span>
              <span className="block font-display text-[17px] font-extrabold tracking-tight text-slate-900">
                HireGuard<span className="text-indigo-600">AI</span>
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Security console
              </span>
            </span>
          </NavLink>
          <button className="rounded-lg p-2 text-slate-400 md:hidden" onClick={onClose} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="mt-8">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Menu</p>
          <nav className="mt-2 space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => {
              const disabled = !loggedIn && to !== "/";
              if (disabled) return null;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-7">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Security</p>
          <div className="mt-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <ShieldCheck size={16} />
              <span className="text-xs font-extrabold">Protected scans</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Investigations are analyzed for suspicious redirects, forms and scam signals.
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          {!loggedIn && (
            <>
              <NavLink to="/login" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50">
                <LogIn size={17} /> Login
              </NavLink>
              <NavLink to="/signup" onClick={onClose} className="flex items-center gap-3 rounded-xl bg-indigo-600 px-3 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-600/20">
                <UserPlus size={17} /> Create account
              </NavLink>
            </>
          )}
          <div className="border-t border-slate-100 pt-3">
            <p className="px-3 text-[10px] leading-4 text-slate-400">HireGuard AI · Web security workspace</p>
          </div>
        </div>
      </aside>
    </>
  );
}
