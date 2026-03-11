"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { FaTachometerAlt, FaWallet, FaClipboardList, FaCog, FaSignOutAlt } from "react-icons/fa";

const NAV_TOP = [
  { href: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/wallets", label: "Wallets", icon: FaWallet },
  { href: "/orders", label: "Orders", icon: FaClipboardList },
];

const NAV_BOTTOM = [
  { href: "/settings", label: "Settings", icon: FaCog },
];

export default function Sidebar({ drawerOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logout());
    router.push("/signin");
  }

  return (
    <aside className={`rl-sidebar ${drawerOpen ? "open" : ""}`}>
      <div className="rl-brand">
        <div className="rl-logo">A</div>
        <span className="rl-brand-text">Alpacross</span>
      </div>
      <nav className="rl-nav">
        {NAV_TOP.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rl-nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="rl-nav-icon" aria-hidden>
                <Icon />
              </span>
              <span className="rl-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>
      <nav className="rl-nav rl-nav-bottom">
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rl-nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="rl-nav-icon" aria-hidden>
                <Icon />
              </span>
              <span className="rl-nav-label">{label}</span>
            </Link>
          );
        })}
        <button className="rl-nav-item" onClick={() => { onClose?.(); handleLogout(); }}>
          <span className="rl-nav-icon" aria-hidden>
            <FaSignOutAlt />
          </span>
          <span className="rl-nav-label">Log Out</span>
        </button>
      </nav>
    </aside>
  );
}


