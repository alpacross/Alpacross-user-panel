"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);
  const [validationErrors, setValidationErrors] = useState({});
  async function handleSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      password: form.get("password"),
      dob: form.get("dob"),
    };

    // Age validation
    if (payload.dob) {
      const birthDate = new Date(payload.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setValidationErrors({ dob: "You must be at least 18 years old to register." });
        return;
      }
    } else {
      setValidationErrors({ dob: "Please select your date of birth." });
      return;
    }
    
    setValidationErrors({});
    const res = await dispatch(registerThunk(payload));
    if (res.meta.requestStatus === "fulfilled") {
      // Redirect to confirmation instructions page
      const email = encodeURIComponent(payload.email || "");
      router.push(`/auth/confirm_email${email ? `?email=${email}` : ""}`);
    }
  }
  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">A</span><div className="Tag">Alpacross</div></div>
          <div className="auth-title">Create your account</div>
          <p className="auth-sub">Join millions of traders on Alpacross. It only takes a minute.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row" style={{display:'flex', gap:8}}>
              <input 
                name="firstName" 
                className="auth-input" 
                type="text" 
                placeholder="First name" 
                required 
                onInput={(e) => e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '')}
              />
              <input 
                name="lastName" 
                className="auth-input" 
                type="text" 
                placeholder="Last name" 
                required 
                onInput={(e) => e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '')}
              />
            </div>
            <input name="email" className="auth-input" type="email" placeholder="Email" required />
            <div className="auth-field-wrap">
              <input 
                name="dob" 
                className="auth-input date-input" 
                type="date" 
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                required 
              />
              <span className="date-placeholder">Age</span>
            </div>
            {validationErrors.dob && <p style={{color: '#ef4444', fontSize: '13px', marginTop: '-4px', marginBottom: '4px'}}>{validationErrors.dob}</p>}
            <input name="password" className="auth-input" type="password" placeholder="Password" required />
            <button className="auth-btn" type="submit">Create account</button>
          </form>
          {authStatus === "loading" && <p style={{marginTop:8}}>Creating account...</p>}
          {authError && <p style={{marginTop:8,color:'red'}}>{authError}</p>}
          <div className="auth-alt">
            <span>Already have an account?</span>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">A</span><div className="Tag">Alpacross</div></div>
            <h2>Welcome to the future of crypto</h2>
            <p>Secure, fast, and intuitive. Build and grow your portfolio with confidence.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-side"><div className="auth-title">Create your account</div><p>Loading...</p></div></div>}>
      <SignUpContent />
    </Suspense>
  );
}



