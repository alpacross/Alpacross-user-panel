"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordThunk } from "@/store/slices/authSlice";

function ForgotPassword2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const error = useSelector((s) => s.auth.error);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = form.get("newPassword");
    const confirmPassword = form.get("confirmPassword");
    const token = searchParams.get("token");
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    setLocalError("");
    if (!token) return;
    const res = await dispatch(resetPasswordThunk({ token, newPassword }));
    if (res.meta.requestStatus === "fulfilled") {
      router.push("/signin");
    }
  }

  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">A</span><div className="Tag">Alpacross</div></div>
          <div className="auth-title">Set new password</div>
          <p className="auth-sub">Choose a strong password for your account.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input name="newPassword" className="auth-input" type="password" placeholder="New password" required />
            <input name="confirmPassword" className="auth-input" type="password" placeholder="Confirm new password" required />
            <button className="auth-btn" type="submit">Reset password</button>
          </form>
          {status === "loading" && <p style={{marginTop:8}}>Updating...</p>}
          {localError && <p style={{marginTop:8,color:'#ef4444'}}>{localError}</p>}
          {error && <p style={{marginTop:8,color:'#ef4444'}}>{error}</p>}
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">A</span><div className="Tag">Alpacross</div></div>
            <h2>Secure your account</h2>
            <p>Create a strong password to keep your crypto assets safe.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ForgotPassword2Page() {
  return (
    <Suspense fallback={
      <>
        <link rel="stylesheet" href="/custom-style.css" />
        <div className="auth-wrap">
          <div className="auth-side">
            <div className="auth-title">Set new password</div>
            <p>Loading...</p>
          </div>
        </div>
      </>
    }>
      <ForgotPassword2Content />
    </Suspense>
  );
}



