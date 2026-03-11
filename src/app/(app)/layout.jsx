"use client";

import AppShell from "@/components/AppShell";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppGroupLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth=1"));
      const hasLocalToken = typeof window !== "undefined" && !!window.localStorage.getItem("authToken");
      if (!hasAuthCookie && !hasLocalToken) {
        const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/dashboard";
        router.replace(`/signin?next=${encodeURIComponent(next)}`);
      }
    } catch {}
  }, [router]);

  return <AppShell>{children}</AppShell>;
}


