"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : "";
      if (token) {
        document.cookie = `auth=1; path=/; max-age=${60 * 60 * 24 * 7}`;
        router.replace("/dashboard");
      } else {
        router.replace("/signin");
      }
    } catch {
      router.replace("/signin");
    }
  }, [router]);
  return null;
}



