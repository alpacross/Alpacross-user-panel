"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCryptoPrices } from "@/lib/cryptoApi";
import { apiRequest, endpoints } from "@/lib/api";
import { toast } from "react-hot-toast";

const FIAT_OPTIONS = ["USD", "EUR", "GBP", "INR"];
const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "USDT"];

export default function ExchangeForm() {
  const router = useRouter();
  const [fiatAmount, setFiatAmount] = useState(0);
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");
  const [prices, setPrices] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    fetchCryptoPrices().then(setPrices);
    
    const fetchKycStatus = async () => {
      let status = "NEW";
      
      // 1. Try getKycStatus (Custom Endpoint)
      try {
        const res = await apiRequest(endpoints.getKycStatus());
        console.log("KYC Response 1:", res);
        status = res?.kycStatus || res?.status || "NEW";
      } catch (e) {
        console.warn("getKycStatus failed:", e);
      }

      // 2. If valid status not found, try getVerificationStatus (User Endpoint)
      if (!status || status === "NEW") {
        try {
          const res2 = await apiRequest(endpoints.getVerificationStatus());
          console.log("KYC Response 2:", res2); // { isVerified: true, status: "verified" }
          if (res2?.isVerified) {
             status = "APPROVED";
          } else if (res2?.status) {
             status = res2.status; // e.g., "verified"
          }
        } catch (e2) {
          console.warn("getVerificationStatus failed:", e2);
        }
      }

      setKycStatus(status);
    };
    fetchKycStatus();
  }, []);

  // Use fetched prices if available, otherwise fallback to 0 or cached logic
  const price = useMemo(() => {
      if (prices && prices[crypto] && prices[crypto][fiat]) {
          return prices[crypto][fiat];
      }
      // Fallback or loading state could be handled here
      return 0;
  }, [crypto, fiat, prices]);

  const cryptoAmount = useMemo(() => {
    const amt = Number(fiatAmount) || 0;
    return (amt > 0 && price > 0) ? amt / price : 0;
  }, [fiatAmount, price]);

  const handleProceed = () => {
    // Case-insensitive check and allow "VERIFIED" as alternate success status
    const status = kycStatus?.toString().toUpperCase();
    if (status !== "APPROVED" && status !== "VERIFIED") {
        toast.error("Please complete your KYC first. Go to settings page and complete KYC.");
        return;
    }

    if (!fiatAmount || fiatAmount <= 0) return;
    
    // Construct query params
    const params = new URLSearchParams({
      fiatAmount, 
      fiatCurrency: fiat, 
      cryptoAmount: cryptoAmount.toFixed(8), 
      cryptoCurrency: crypto
    });
    
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <section className="rl-exchange">
      <div className="rl-row">
        <div className="rl-col">
          <label className="rl-label">I PAY:</label>
          <div className="rl-input-group">
            <input
              type="number"
              min="0"
              step="0.01"
              className="rl-input"
              value={fiatAmount}
              onChange={(e) => setFiatAmount(e.target.value)}
              placeholder="0.00"
            />
            <select
              className="rl-select"
              value={fiat}
              onChange={(e) => setFiat(e.target.value)}
            >
              {FIAT_OPTIONS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="rl-arrow" aria-hidden>
          →
        </div>
        <div className="rl-col">
          <label className="rl-label">I GET:</label>
          <div className="rl-input-group">
            <input
              type="number"
              className="rl-input"
              value={cryptoAmount.toFixed(8)}
              readOnly
            />
            <select
              className="rl-select"
              value={crypto}
              onChange={(e) => setCrypto(e.target.value)}
            >
              {CRYPTO_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="rl-btn rl-btn-primary rl-buy" onClick={handleProceed}>
            Buy {crypto}
        </button>
      </div>
      <p className="rl-rate">
        Exchange Rate: 1 {crypto} ≈ {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fiat}
      </p>
    </section>
  );
}
