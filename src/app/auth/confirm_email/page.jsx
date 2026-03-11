"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { confirmEmailThunk } from "@/store/slices/authSlice";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const error = useSelector((s) => s.auth.error);
  const [done, setDone] = useState(false);
  const email = searchParams.get("email");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    (async () => {
      const res = await dispatch(confirmEmailThunk({ token }));
      if (res.meta.requestStatus === "fulfilled") {
        setDone(true);
        setTimeout(() => router.push("/signin"), 1200);
      }
    })();
  }, [dispatch, router, searchParams]);

  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">A</span><div className="Tag">Alpacross</div></div>
          <div className="auth-title">Email confirmation</div>
          {!searchParams.get("token") && (
            <>
              <p className="auth-sub">
                We have sent a confirmation link to {email ? <b>{email}</b> : "your email"}. Please open the link from your inbox to activate your account.
              </p>
              <p className="auth-sub">If you don't see the email, check your spam folder.</p>
            </>
          )}
          {status === "loading" && <p style={{marginTop:8}}>Confirming...</p>}
          {done && <p style={{marginTop:8,color:'#10b981'}}>Confirmed! Redirecting to sign in...</p>}
          {error && <p style={{marginTop:8,color:'#ef4444'}}>{error}</p>}
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">A</span><div className="Tag">Alpacross</div></div>
            <h2>Welcome aboard!</h2>
            <p>Just one more step to activate your account and start trading.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <>
        <link rel="stylesheet" href="/custom-style.css" />
        <div className="auth-wrap">
          <div className="auth-side">
            <div className="auth-title">Email confirmation</div>
            <p>Loading...</p>
          </div>
        </div>
      </>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}


