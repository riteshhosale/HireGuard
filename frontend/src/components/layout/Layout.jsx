import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children, variant = "app" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (variant === "auth") {
    return (
      <div className="min-h-screen bg-[#f3f3fa] text-slate-900">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3fa] text-slate-900">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="md:pl-61">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="min-h-[calc(100vh-74px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
