"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`rl-app ${open ? "drawer-open" : ""}`}>
      <Sidebar drawerOpen={open} onClose={() => setOpen(false)} />
      <main className="rl-main">
        <div className="rl-mobilebar">
          <div className="rl-brand mini">
            <div className="rl-logo">A</div>
            <span className="rl-brand-text">Alpacross</span>
          </div>
          <button
            className="rl-hamburger"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <div className={`rl-drawer-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
        {children}
      </main>
    </div>
  );
}


