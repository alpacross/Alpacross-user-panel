"use client";

import { useEffect } from "react";
import { getAuthToken } from "@/lib/api";

export default function AuthCookieSync() {
  useEffect(() => {
    try {
      const token = getAuthToken();
      const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth="));
      if (token) {
        if (!hasAuthCookie || !document.cookie.split("; ").some((c) => c.startsWith("auth=1"))) {
          document.cookie = `auth=1; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
      } else if (hasAuthCookie) {
        document.cookie = "auth=; Max-Age=0; path=/";
      }
    } catch {}
  }, []);

  return null;
}


