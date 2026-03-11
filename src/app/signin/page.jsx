"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);

  // If token exists, redirect away from sign-in
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("authToken");
    const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth=1"));
    if (token && hasAuthCookie) {
      const next = searchParams.get("next");
      if (next) router.replace(next);
      else router.replace("/dashboard");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      twoFaCode: form.get("twoFactorCode") || "",
    };
    const res = await dispatch(loginThunk(payload));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Signed in successfully");
      const next = searchParams.get("next");
      router.push(next || "/dashboard");
    } else {
        toast.error(res.payload || "Sign in failed");
    }
  }
  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">A</span><div className="Tag">Alpacross</div></div>
          <div className="auth-title">Sign in</div>
          <p className="auth-sub">Welcome back! Access your account to continue trading.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input name="email" className="auth-input" type="email" placeholder="Email" required />
            <input name="password" className="auth-input" type="password" placeholder="Password" required />
            <input name="twoFactorCode" className="auth-input" type="text" placeholder="Two-factor code (optional)" inputMode="numeric" pattern="[0-9]*" />
            <button className="auth-btn" type="submit">Continue</button>
          </form>
          {authStatus === "loading" && <p style={{marginTop:8}}>Signing in...</p>}
          {authError && <p style={{marginTop:8,color:'red'}}>{authError}</p>}
          <div className="auth-alt">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">A</span><div className="Tag">Alpacross</div></div>
            <h2>Trade smarter with Alpacross</h2>
            <p>Bank-grade security, lightning-fast execution, and powerful analytics in one modern platform.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-side"><div className="auth-title">Sign in</div><p>Loading...</p></div></div>}>
      <SignInContent />
    </Suspense>
  );
}



