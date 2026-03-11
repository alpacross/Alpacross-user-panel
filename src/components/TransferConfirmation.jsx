"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { capturePayment } from "@/store/slices/paymentSlice";

export default function TransferConfirmation({ paymentId, fiatAmount, fiatCurrency, cryptoAmount, cryptoCurrency, onConfirm, loading }) {
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const dispatch = useDispatch();

  const handleConfirmAction = async () => {
    try {
      await dispatch(capturePayment({ 
        paymentId, 
        captureData: { amount: fiatAmount, currency: fiatCurrency } 
      })).unwrap();
      
      // If successful, show the approved popup
      setShowPopup(true);
      
      // Start countdown
      let currentCount = 4;
      const timer = setInterval(() => {
        currentCount -= 1;
        setCountdown(currentCount);
        if (currentCount <= 0) {
          clearInterval(timer);
          onConfirm();
        }
      }, 1000);

    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  return (
    <div className="confirmation-card">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">✅</div>
            <h3>Purchase Approved</h3>
            <p>Your crypto order is approved and crypto of <strong>{cryptoAmount} {cryptoCurrency}</strong> will be transferred to your selected wallet.</p>
            <div className="countdown-text">Redirecting in {countdown}s...</div>
          </div>
        </div>
      )}
      <div className="step-indicator">
        <h3>Confirmation</h3>
        <p>Step 2 of 2</p>
      </div>

      <div className="success-banner">
        <div className="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div className="banner-content">
            <strong>Payment Successful</strong>
            <p>Your card payment is complete. Please confirm the transfer below.</p>
        </div>
      </div>

      <div className="details-box">
        <div className="detail-row">
            <span>Crypto Amount:</span>
            <strong>{cryptoAmount} {cryptoCurrency}</strong>
        </div>
        <div className="detail-row">
            <span>Destination:</span>
            <strong>Your Wallet</strong>
        </div>
        <div className="detail-row">
            <span>Partner:</span>
            <strong>Fambar E and K</strong>
        </div>
      </div>

      <button className="confirm-btn" onClick={handleConfirmAction} disabled={loading || showPopup}>
          {loading ? "Processing..." : "Confirm Transfer"}
      </button>

      <p className="disclaimer">
          By clicking above, you initiate the transfer of crypto-assets to your wallet.
      </p>

      <style jsx>{`
        .confirmation-card {
            background: var(--card-bg);
            color: var(--text);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            position: relative;
        }

        .popup-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 14, 39, 0.9);
            backdrop-filter: blur(8px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            animation: fadeIn 0.3s ease;
        }

        .popup-content {
            padding: 30px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            max-width: 80%;
            animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .popup-icon { font-size: 40px; margin-bottom: 15px; }
        .popup-content h3 { color: #fff; margin-bottom: 10px; font-size: 20px; }
        .popup-content p { color: var(--muted); line-height: 1.5; margin: 0; }
        .popup-content strong { color: var(--primary-2); }
        .countdown-text { margin-top: 15px; font-size: 14px; color: var(--primary-2); font-weight: 500; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .step-indicator { margin-bottom: 30px; }
        .step-indicator h3 { margin: 0; font-size: 22px; font-weight: 700; color: #fff; }
        .step-indicator p { margin: 6px 0 0; color: var(--muted); font-size: 14px; }

        .success-banner {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #10b981;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: left;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05);
        }
        .banner-content strong { display: block; margin-bottom: 4px; font-size: 16px; font-weight: 700; }
        .banner-content p { margin: 0; font-size: 14px; opacity: 0.85; line-height: 1.5; }

        .details-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            font-size: 15px;
            align-items: center;
        }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-row span { color: var(--muted); }
        .detail-row strong { color: #fff; font-weight: 600; font-size: 16px; }

        .confirm-btn {
            width: 100%;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
            color: #fff;
            border: none;
            padding: 18px;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 18px;
            transition: all 0.2s;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        }
        .confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5); }
        .confirm-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .disclaimer {
            font-size: 13px;
            color: var(--muted);
            margin: 0;
            line-height: 1.5;
            max-width: 90%;
            margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
