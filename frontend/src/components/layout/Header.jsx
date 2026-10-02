import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, Menu, Search, LogOut, UserRound } from "lucide-react";
import { authApi } from "../../services/auth.api";

export default function Header({ onMenu }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem("jobguard_user");
      if (!raw) return setUser(null);
      try { setUser(JSON.parse(raw)); } catch { setUser(null); }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const loggedIn = Boolean(localStorage.getItem("jobguard_access_token"));
  const initials = (user?.name || "User").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    ["jobguard_access_token", "jobguard_refresh_token", "jobguard_user"].forEach((key) => localStorage.removeItem(key));
    setUser(null);
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-[74px] border-b border-slate-200/80 bg-[#f5f5fb]/90 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 md:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={19} />
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">HireGuard workspace</p>
          <p className="truncate text-sm font-extrabold text-slate-800">AI Job Safety Console</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button title="Search workspace" aria-label="Search workspace" className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400 shadow-sm sm:flex">
            <Search size={16} /> Search
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px]">⌘ K</span>
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm" aria-label="Notifications">
            <Bell size={17} />
          </button>
          {loggedIn ? (
            <div className="group relative">
              <button onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-[11px] font-extrabold text-indigo-700">{initials}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[130px] truncate text-xs font-extrabold text-slate-800">{user?.name || "User"}</span>
                  <span className="block text-[10px] text-slate-400">Account</span>
                </span>
              </button>
              <div className="pointer-events-none absolute right-0 top-12 w-40 translate-y-1 rounded-xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><UserRound size={14}/> Profile</Link>
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><LogOut size={14}/> Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/20">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
