"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordThunk } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const error = useSelector((s) => s.auth.error);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const res = await dispatch(forgotPasswordThunk({ email }));
    if (res.meta.requestStatus === "fulfilled") {
      router.push("/signin");
    }
  }

  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">A</span><div className="Tag">Alpacross</div></div>
          <div className="auth-title">Reset your password</div>
          <p className="auth-sub">Enter your email and we’ll send you a reset link.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input name="email" className="auth-input" type="email" placeholder="Email" required />
            <button className="auth-btn" type="submit">Send reset link</button>
          </form>
          {status === "loading" && <p style={{marginTop:8}}>Sending...</p>}
          {error && <p style={{marginTop:8,color:'red'}}>{error}</p>}
          <div className="auth-alt">
            <Link href="/signin">Back to sign in</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">A</span><div className="Tag">Alpacross</div></div>
            <h2>Security first</h2>
            <p>We keep your account protected with best-in-class security.</p>
          </div>
        </div>
      </div>
    </>
  );
}



