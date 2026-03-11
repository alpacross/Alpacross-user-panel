"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCryptoPrices } from "@/lib/cryptoApi";

const FIAT_OPTIONS = ["USD", "EUR", "GBP", "INR"];
const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "USDT"];

export default function DepositWidget() {
  const router = useRouter();
  const [fiatAmount, setFiatAmount] = useState(0);
  const [fiat, setFiat] = useState("EUR");
  const [crypto, setCrypto] = useState("BTC");
  const [prices, setPrices] = useState(null);
  
  useEffect(() => { fetchCryptoPrices().then(setPrices); }, []);

  const price = useMemo(() => prices?.[crypto]?.[fiat] || 0, [crypto, fiat, prices]);
  const cryptoAmount = useMemo(() => (fiatAmount && price) ? fiatAmount / price : 0, [fiatAmount, price]);

  const handleProceed = () => {
    if (!fiatAmount) return;
    const params = new URLSearchParams({
      fiatAmount, fiatCurrency: fiat, 
      cryptoAmount: cryptoAmount.toFixed(8), cryptoCurrency: crypto
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="rl-exchange">
      <div className="rl-row">
        <div>
          <label>I PAY:</label>
          <input type="number" value={fiatAmount} onChange={(e)=>setFiatAmount(e.target.value)} />
          <select value={fiat} onChange={(e)=>setFiat(e.target.value)}>
            {FIAT_OPTIONS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>→</div>
        <div>
          <label>I GET:</label>
          <input type="text" value={cryptoAmount.toFixed(8)} readOnly />
          <select value={crypto} onChange={(e)=>setCrypto(e.target.value)}>
             {CRYPTO_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={handleProceed}>Proceed to Checkout</button>
      </div>
      <p>Exchange Rate: 1 {crypto} ≈ {price.toFixed(2)} {fiat}</p>
    </div>
  );
}
