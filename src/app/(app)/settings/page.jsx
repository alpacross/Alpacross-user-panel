"use client";

import { useEffect, useState } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { apiRequest, endpoints, getTokenPayload } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [kycStatus, setKycStatus] = useState(null); // APPROVED, PENDING, FAILED, NEW, etc.
  const [loading, setLoading] = useState(true);
  const [startingKyc, setStartingKyc] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");

  // 2FA State
  const [twoFaStatus, setTwoFaStatus] = useState({
    totp: { enabled: false },
    email: { enabled: false },
    anyEnabled: false
  });
  const [activeMethod, setActiveMethod] = useState(null); // 'totp' or 'email' (method being set up or currently enabled)
  const [qrCode, setQrCode] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [loading2Fa, setLoading2Fa] = useState(false);
  const [processing2Fa, setProcessing2Fa] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0: select, 1: setup/verify, 2: disable verify
  const [sendingDisableOtp, setSendingDisableOtp] = useState(false);

  const fetchStatus = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      setError("");
      
      const payload = getTokenPayload();
      const userId = payload?.sub || payload?.id || payload?.userId;

      // Fetch KYC Status
      try {
        const res = await apiRequest(endpoints.getKycStatus());
        setKycStatus(res?.kycStatus || "NEW");
      } catch (e) {
        console.error("Failed to fetch KYC status:", e);
        setKycStatus("NEW"); 
      }

      // Fetch 2FA Status
      if (userId) {
          try {
            const res = await apiRequest(endpoints.twoFAStatus(userId), { method: "POST" });
            // New structure: { totp: {enabled}, email: {enabled}, anyEnabled: boolean }
            setTwoFaStatus({
              totp: res?.totp || { enabled: false },
              email: res?.email || { enabled: false },
              anyEnabled: !!res?.anyEnabled
            });
          } catch (e) {
            console.warn("Failed to fetch 2FA status", e);
          }
      }

    } catch (e) {
      console.error("Error in fetchStatus", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(true);
  }, []);

  const handleInitiate2Fa = async (method, nextStep = 1) => {
    try {
        setLoading2Fa(true);
        setTwoFaError("");
        setQrCode(""); 
        setEmailOtpSent(false);
        setActiveMethod(method);
        
        const payload = getTokenPayload();
        const userId = payload?.sub || payload?.id || payload?.userId;
        const userEmail = payload?.email;
        
        if (!userId) throw new Error("User ID not found. Please re-login.");

        const res = await apiRequest(endpoints.generate2fa(), { 
            method: "POST", 
            body: { 
                userId, 
                method: method,
                email: method === 'email' ? userEmail : undefined
            } 
        });

        if (method === 'totp') {
            const qr = res?.qrCode || res?.data?.qrCode;
            if (qr) {
                setQrCode(qr);
                if (nextStep) setSetupStep(nextStep);
            } else {
                throw new Error("Invalid QR Code response from server");
            }
        } else {
            // Email method
            setEmailOtpSent(true);
            if (nextStep) setSetupStep(nextStep);
            toast.success("Security code sent to your email!");
        }

    } catch (e) {
        console.error("Initiate 2FA error:", e);
        setTwoFaError(e.message || "Failed to initiate 2FA setup");
        toast.error(e.message || "Failed to initiate 2FA setup");
    } finally {
        setLoading2Fa(false);
    }
  };

  const handleVerify2Fa = async () => {
    try {
        setProcessing2Fa(true);
        setTwoFaError("");
        if (!twoFaCode || twoFaCode.length < 6) {
            throw new Error("Please enter a valid 6-digit code");
        }

        const payload = getTokenPayload();
        const userId = payload?.sub || payload?.id || payload?.userId;

        if (!userId) throw new Error("User ID not found. Please re-login.");

        await apiRequest(endpoints.verify2fa(), {
            method: "POST",
            body: { 
                userId, 
                method: activeMethod, 
                code: twoFaCode 
            }
        });

        // Success
        await fetchStatus();
        reset2faState();
        toast.success(`${activeMethod === 'totp' ? 'Authenticator' : 'Email'} 2FA enabled successfully!`);
    } catch (e) {
        console.error("Verify 2FA error:", e);
        setTwoFaError(e.message || "Failed to verify code");
        toast.error(e.message || "Failed to verify code");
    } finally {
        setProcessing2Fa(false);
    }
  };

  const reset2faState = () => {
      setSetupStep(0);
      setActiveMethod(null);
      setQrCode("");
      setTwoFaCode("");
      setEmailOtpSent(false);
      setTwoFaError("");
  };

  const handleInitiateDisable = async (method) => {
    try {
        setSendingDisableOtp(true);
        setTwoFaError("");
        setActiveMethod(method);
        setTwoFaCode(""); // Clear previous codes
        
        if (method === 'email') {
            await handleInitiate2Fa('email', 2); // Pass step 2 directly
        } else {
            // For TOTP, we just need to show the input
            setSetupStep(2);
        }
    } catch (e) {
        console.error("Initiate Disable error:", e);
    } finally {
        setSendingDisableOtp(false);
    }
  };

  const handleDisable2Fa = async (method) => {
    try {
        setProcessing2Fa(true);
        setTwoFaError("");
        if (!twoFaCode || twoFaCode.length < 6) {
            throw new Error("Please enter your 2FA code to disable it");
        }

        const payload = getTokenPayload();
        const userId = payload?.sub || payload?.id || payload?.userId;
        
        if (!userId) throw new Error("User ID not found. Please re-login.");

        await apiRequest(endpoints.disableTwoFaSimple(), {
            method: "POST",
            body: { 
                userId, 
                code: twoFaCode,
                method: method 
            }
        });

        // Success
        await fetchStatus();
        reset2faState();
        toast.success(`${method === 'totp' ? 'Authenticator' : 'Email'} 2FA disabled successfully!`);
    } catch (e) {
        console.error("Disable 2FA error:", e);
        setTwoFaError(e.message || "Failed to disable 2FA");
        toast.error(e.message || "Failed to disable 2FA");
    } finally {
        setProcessing2Fa(false);
    }
  };
      
  // ... (rest of methods)


  const handleStartKyc = async () => {
    try {
      setStartingKyc(true);
      setError("");
      const res = await apiRequest(endpoints.startKyc(), { method: "POST" });
      
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
      } else {
        throw new Error(res?.message || "Failed to start KYC");
      }
    } catch (e) {
      console.error("Error starting KYC:", e);
      setError(e.message || "Unable to start verification service.");
    } finally {
      setStartingKyc(false);
    }
  };

  const onSumsubMessage = (data) => {
    console.log("Sumsub message:", data);
  };

  const onSumsubError = (data) => {
    console.error("Sumsub error:", data);
    setError("An error occurred during verification.");
  };

  if (loading) {
    return (
      <div className="rl-content">
        <h1 className="rl-page-title">Settings</h1>
        <div className="card loading-card">
          <div className="spinner"></div>
          <p>Checking status...</p>
        </div>
        <style jsx>{`
          .loading-card { padding: 60px; text-align: center; }
          .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          p { color: var(--muted); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rl-content">
      <h1 className="rl-page-title">Settings <span>& Security</span></h1>
      
      <div className="settings-layout">
        
        {/* 2FA Section */}
        <section className="card twofa-card" style={{ marginBottom: 32 }}>
            <div className="card-header">
                <h2 className="section-title">Two-Factor Authentication (2FA)</h2>
                <p className="section-desc">Add an extra layer of security to your account.</p>
            </div>
            <div className="card-body">
                <div className="status-row" style={{ marginBottom: 32 }}>
                    <span className="label">Status: </span>
                    <span className={`status-value ${twoFaStatus.anyEnabled ? 'enabled' : 'disabled'}`}>
                        {twoFaStatus.anyEnabled ? 'Active' : 'Disabled'}
                    </span>
                </div>

                {setupStep === 0 && (
                    <div className="method-grid">
                        <div className={`method-item ${twoFaStatus.totp.enabled ? 'is-enabled' : ''}`}>
                            <div className="method-icon">📱</div>
                            <div className="method-info">
                                <h4>Authenticator App</h4>
                                <p>Use Google or Authy apps</p>
                            </div>
                            {twoFaStatus.totp.enabled ? (
                                <button className="rl-btn rl-btn-outline-danger btn-sm" onClick={() => handleInitiateDisable('totp')}>Disable</button>
                            ) : (
                                <button className="rl-btn-glow btn-sm" onClick={() => handleInitiate2Fa('totp')}>Setup</button>
                            )}
                        </div>

                        <div className={`method-item ${twoFaStatus.email.enabled ? 'is-enabled' : ''}`}>
                            <div className="method-icon">📧</div>
                            <div className="method-info">
                                <h4>Email Verification</h4>
                                <p>Codes sent to your inbox</p>
                            </div>
                            {twoFaStatus.email.enabled ? (
                                <button className="rl-btn rl-btn-outline-danger btn-sm" onClick={() => handleInitiateDisable('email')}>
                                    {sendingDisableOtp && activeMethod === 'email' ? '...' : 'Disable'}
                                </button>
                            ) : (
                                <button className="rl-btn-glow btn-sm" onClick={() => handleInitiate2Fa('email')}>Setup</button>
                            )}
                        </div>
                    </div>
                )}

                {setupStep !== 0 && activeMethod && (
                    <div className="active-workflow-container">
                        <div className="workflow-header">
                            <span className="workflow-title">
                                {setupStep === 2 ? 'Disable ' : 'Manage '} 
                                {activeMethod === 'totp' ? 'Authenticator' : 'Email Verification'}
                            </span>
                            <button className="text-btn" onClick={reset2faState}>Cancel & Close</button>
                        </div>
                        
                        <div className="setup-container">
                            <div className="setup-col">
                                {setupStep === 2 ? (
                                    <>
                                        <h3 className="col-title">1. Security Verification</h3>
                                        <p className="setup-desc">
                                            {activeMethod === 'email' ? 'We sent a 6-digit code to your email. Enter it to confirm.' : 'Enter the 6-digit code from your authenticator app.'}
                                        </p>
                                        {activeMethod === 'email' && (
                                            <div className="email-status-box">
                                                <div className="status-icon success">✓</div>
                                                <span>Code Sent</span>
                                                <button className="text-btn" onClick={() => handleInitiate2Fa('email')} disabled={loading2Fa}>Resend</button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    activeMethod === 'totp' ? (
                                        <>
                                            <h3 className="col-title">1. Get QR Code</h3>
                                            <p className="setup-desc">Download an authenticator app and scan the QR code below.</p>
                                            <div className="qr-wrapper-themed">
                                                <img src={qrCode} alt="2FA QR Code" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="col-title">1. Get OTP</h3>
                                            <p className="setup-desc">We've sent a 6-digit security code to your email inbox.</p>
                                            <div className="email-status-box">
                                                <div className="status-icon success">✓</div>
                                                <span>Sent to your email</span>
                                                <button className="text-btn" onClick={() => handleInitiate2Fa('email')} disabled={loading2Fa}>Resend</button>
                                            </div>
                                        </>
                                    )
                                )}
                            </div>
                            <div className="setup-col">
                                <h3 className="col-title">2. {setupStep === 2 ? 'Confirm Disable' : 'Enable 2FA'}</h3>
                                <p className="setup-desc">Enter the 6-digit code to complete this action.</p>
                                <input 
                                    type="text" 
                                    placeholder="Enter 6-digit code" 
                                    className="rl-input-themed"
                                    value={twoFaCode}
                                    onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    maxLength={6}
                                />
                                <button 
                                    className="rl-btn-glow full-width" 
                                    onClick={() => setupStep === 2 ? handleDisable2Fa(activeMethod) : handleVerify2Fa()} 
                                    disabled={processing2Fa || !twoFaCode || twoFaCode.length < 6}
                                >
                                    {processing2Fa ? "Processing..." : (setupStep === 2 ? `Disable ${activeMethod === 'totp' ? 'App' : 'Email'}` : `Enable ${activeMethod === 'totp' ? 'App' : 'Email'}`)}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {twoFaError && <div className="error-msg" style={{ marginTop: 20 }}>{twoFaError}</div>}
            </div>
        </section>

        {/* KYC Section */}
        <section className="card kyc-card">
          <div className="card-header">
            <h2 className="section-title">Identity Verification</h2>
            <p className="section-desc">Verify your identity to unlock higher withdrawal limits and full trading features.</p>
          </div>
          
          {accessToken ? (
            <div className="sumsub-wrapper">
               <SumsubWebSdk
                accessToken={accessToken}
                updateAccessToken={() => {}}
                expirationHandler={() => {}}
                config={{
                  lang: "en",
                  i18n: {
                    document: {
                      subTitles: {
                        IDENTITY: "Upload a document that proves your identity",
                      },
                    },
                  },
                  uiConf: {
                    customCssStr: ":root { --black: #ffffff; --grey: #101633; --grey-darker: #a0aec0; --border-color: #1e2847; --icon-color: #3b82f6; --blue: #3b82f6; --green: #10b981; --red: #ef4444; --orange: #f59e0b; --yellow: #f59e0b; --background-color: #070b1f; --text-color: #ffffff; }",
                  },
                }}
                options={{ addViewportTag: false, adaptIframeHeight: true }}
                onMessage={onSumsubMessage}
                onError={onSumsubError}
              />
              <button className="rl-btn rl-btn-outline cancel-btn" onClick={() => { setAccessToken(""); fetchStatus(); }}>
                Cancel Verification
              </button>
            </div>
          ) : (
            <div className="status-container">
              {kycStatus === "APPROVED" && (
                <div className="status-box success">
                  <div className="icon-glow success">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3>Verified Account</h3>
                  <p>Your identity has been successfully verified. You have full access to all features.</p>
                </div>
              )}

              {kycStatus === "PENDING" && (
                <div className="status-box warning">
                  <div className="icon-glow warning">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <h3>Verification Pending</h3>
                  <p>Your documents are under review. This usually takes less than 24 hours.</p>
                  <button className="rl-btn rl-btn-outline" onClick={fetchStatus} style={{marginTop: 20}}>
                    Refresh Status
                  </button>
                </div>
              )}

              {(kycStatus !== "APPROVED" && kycStatus !== "PENDING") && (
                <div className="status-box default">
                   <div className="status-content">
                    {kycStatus === "FAILED" && (
                      <div className="alert-error">
                        Verification failed. Please ensure your documents are clear and try again.
                      </div>
                    )}
                    
                    <div className="benefit-list">
                      <div className="benefit-item">
                        <div className="check">✓</div>
                        <span>Unlimited Crypto Deposits</span>
                      </div>
                      <div className="benefit-item">
                        <div className="check">✓</div>
                        <span>Higher Withdrawal Limits</span>
                      </div>
                      <div className="benefit-item">
                        <div className="check">✓</div>
                        <span>P2P Trading Access</span>
                      </div>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <button 
                      className="rl-btn rl-btn-primary start-btn" 
                      onClick={handleStartKyc} 
                      disabled={startingKyc}
                    >
                      {startingKyc ? "Initializing..." : "Start Verification"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .settings-layout { max-width: 800px; }
        .kyc-card, .twofa-card { overflow: hidden; position: relative; background: #0B1126; border-radius: 16px; border: 1px solid #1E2847; }
        .card-header { padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .card-body { padding: 32px; }
        .section-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .section-desc { color: var(--muted); font-size: 14px; line-height: 1.5; }
        .status-row { font-size: 16px; display: flex; align-items: center; gap: 8px; }
        .status-value { font-weight: 700; color: #ef4444; }
        .status-value.enabled { color: #10b981; }

        .method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .method-item { 
            background: rgba(255,255,255,0.02); border: 1px solid #1E2847; 
            padding: 24px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .method-item.is-enabled { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05); }
        .method-icon { font-size: 32px; margin-bottom: 16px; }
        .method-info h4 { margin: 0 0 4px; font-size: 16px; color: #fff; }
        .method-info p { margin: 0; font-size: 12px; color: var(--muted); }
        
        .rl-btn-glow { 
            margin-top: 16px; width: auto; min-width: 100px; padding: 10px 24px; 
            background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%); 
            color: #fff; border: none; border-radius: 30px; font-weight: 700; 
            cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .rl-btn-glow:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5); }
        .rl-btn-glow:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .rl-btn-glow.full-width { width: 100%; margin-top: 0; }
        .rl-btn-outline-danger { margin-top: 16px; border: 1px solid #ef4444; color: #ef4444; background: transparent; padding: 8px 16px; border-radius: 30px; font-weight: 600; font-size: 12px; cursor: pointer; }
        .btn-sm { padding: 6px 16px; font-size: 13px; }

        .active-workflow-container { 
            margin-top: 32px; padding: 32px; background: rgba(255,255,255,0.01); 
            border: 1px solid #1E2847; border-radius: 12px; position: relative;
        }
        .workflow-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .workflow-title { font-size: 14px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; }

        .setup-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .col-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #fff; }
        .setup-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }
        
        .qr-wrapper-themed { background: #fff; padding: 12px; border-radius: 12px; display: inline-block; }
        .qr-wrapper-themed img { width: 150px; height: 150px; display: block; }
        
        .rl-input-themed { 
            width: 100%; padding: 16px; background: #070b1f; border: 1px solid #1E2847; 
            border-radius: 12px; color: #fff; margin-bottom: 20px; font-size: 16px;
            text-align: center; letter-spacing: 4px; font-weight: 700; transition: border-color 0.2s;
        }
        .rl-input-themed:focus { border-color: #3b82f6; outline: none; }

        .text-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; text-decoration: underline; padding: 0; }
        .text-btn:hover { color: #fff; }

        .email-status-box { 
            display: flex; align-items: center; gap: 12px; 
            padding: 16px; background: rgba(16, 185, 129, 0.05); 
            border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;
        }
        .status-icon.success { width: 20px; height: 20px; background: #10b981; color: #fff; border-radius: 50%; display: grid; place-items: center; font-size: 10px; font-weight: bold; }

        @media (max-width: 640px) {
           .method-grid { grid-template-columns: 1fr; }
           .setup-container { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </div>
  );
}
