"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { preAuthorizePayment, capturePayment, selectPaymentState, resetPaymentState } from "@/store/slices/paymentSlice";
import { toast } from "react-hot-toast";

export default function CardPaymentForm({ amount, currency, cryptoAmount, cryptoCurrency, onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, paymentId, paymentStatus } = useSelector(selectPaymentState);
  
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [cardType, setCardType] = useState("VISA");
  
  // Wallets
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  
  // Shipping Details
  const [shippingName, setShippingName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("IN");
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const fetchUserWallets = async () => {
      try {
        const { getWallets } = await import("@/lib/api");
        const data = await getWallets();
        setWallets(data || []);
      } catch (err) {
        console.error("Failed to fetch wallets for form:", err);
      }
    };
    fetchUserWallets();
  }, []);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length > 1 ? parts.join(" ") : value;
  };

  const formatExpiry = (value) => {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      if (v.length >= 2) {
          return v.substring(0, 2) + "/" + v.substring(2, 4);
      }
      return v;
  }

  const handleCardChange = (e) => {
      const val = e.target.value;
      setCardNumber(formatCardNumber(val));
  }

  const handleExpiryChange = (e) => {
      const val = e.target.value;
      if(val.length > 5) return;
      setExpiry(formatExpiry(val));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expiry.includes("/")) return;
    const [expMonthRaw, expYearRaw] = expiry.split("/"); 
    const expMonth = (expMonthRaw || "").trim();
    const expYear = (expYearRaw || "").trim();
    
    if (!selectedWallet) {
        toast.error("Please select an external wallet address.");
        return;
    }



    if (!cardNumber || !holderName || !expMonth || !expYear || !cvv) return;

    const walletObj = wallets.find(w => w.walletAddress === selectedWallet);

    const payload = {
      amount: Number(amount).toFixed(2), 
      currency: currency, 
      paymentBrand: cardType,
      paymentType: "PA", // Added paymentType as it appeared in user logs
      shipping_name: shippingName,
      address_line1: addressLine1,
      address_line2: addressLine2 || "",
      city: city,
      state: state,
      pincode: pincode,
      country: country,
      walletAddress: selectedWallet,
      network: walletObj ? walletObj.network : "",
      card: { 
        number: cardNumber.replace(/\s/g, ""), 
        holder: holderName, 
        expiryMonth: expMonth.padStart(2, '0'), 
        expiryYear: expYear.length === 2 ? "20" + expYear : expYear, 
        cvv: cvv 
      }
    };
    dispatch(preAuthorizePayment(payload));
  };

  useEffect(() => {
    if (paymentStatus === "authorized" && paymentId) {
      if (onSuccess) onSuccess();
    }
  }, [paymentStatus, paymentId, onSuccess]);

  return (
    <div className="payment-wrapper">
      <form onSubmit={handleSubmit} className="card-form">
        <h3 style={{color: '#fff', marginBottom: 20}}>Billing Details</h3>
        
        <div className="form-group">
            <label>Select your External Wallet</label>
            <select 
                value={selectedWallet} 
                onChange={(e) => setSelectedWallet(e.target.value)}
                style={{
                  width: '100%', background: '#151a27', border: '1px solid #2a344a', padding: '12px 16px', 
                  borderRadius: '8px', color: '#fff', fontSize: '16px'
                }}
            >
                <option value="">Select your External Wallet</option>
                {wallets.map((w) => (
                    <option key={w.id || w._id} value={w.walletAddress}>
                        {w.network || 'Wallet'} ({w.walletAddress ? `${w.walletAddress.substring(0, 6)}...${w.walletAddress.slice(-4)}` : 'No Address'})
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group">
            <label>Full Name</label>
            <input 
                type="text" 
                value={shippingName} 
                onChange={(e) => setShippingName(e.target.value)} 
                placeholder="Ex. John Doe" 
                required 
            />
        </div>


        
        <div className="form-group">
            <label>Address Line 1</label>
            <input 
                type="text" 
                value={addressLine1} 
                onChange={(e) => setAddressLine1(e.target.value)} 
                placeholder="Ex. 123 Crypto Street" 
                required 
            />
        </div>

        <div className="form-group">
            <label>Address Line 2 (Optional)</label>
            <input 
                type="text" 
                value={addressLine2} 
                onChange={(e) => setAddressLine2(e.target.value)} 
                placeholder="Ex. Near Blockchain Tower" 
            />
        </div>

        <div className="form-row">
            <div className="form-group half">
                <label>City</label>
                <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="Ex. London" 
                    required 
                />
            </div>
            <div className="form-group half">
                <label>State</label>
                <input 
                    type="text" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                    placeholder="Ex. California" 
                    required 
                />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group half">
                <label>Pincode</label>
                <input 
                    type="text" 
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)} 
                    placeholder="Ex. 90210" 
                    required 
                />
            </div>
            <div className="form-group half">
                <label>Country</label>
                <input 
                    type="text" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="Enter Country (e.g. IN, US)" 
                    required 
                />
            </div>
        </div>

        <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />
        <h3 style={{color: '#fff', marginBottom: 20}}>Payment Details</h3>
        <div className="form-group">
            <label>Card Number</label>
            <input 
                type="text" 
                value={cardNumber} 
                onChange={handleCardChange} 
                placeholder="0000 0000 0000 0000" 
                maxLength={19}
                required 
                onFocus={() => setFocused("number")}
            />
        </div>
        <div className="form-group">
            <label>Card Holder Name</label>
            <input 
                type="text" 
                value={holderName} 
                onChange={(e) => setHolderName(e.target.value.toUpperCase())} 
                placeholder="JOHN DOE" 
                required 
                onFocus={() => setFocused("name")}
            />
        </div>
        <div className="form-row">
            <div className="form-group half">
                <label>Expiry Date</label>
                <input 
                    type="text" 
                    value={expiry} 
                    onChange={handleExpiryChange} 
                    placeholder="MM/YY" 
                    required 
                    onFocus={() => setFocused("expiry")}
                />
            </div>
            <div className="form-group half">
                <label>CVV</label>
                <input 
                    type="password" 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))} 
                    placeholder="123" 
                    required 
                    onFocus={() => setFocused("cvv")}
                />
            </div>
        </div>
        
        {/* Hidden select for simplicity, could be toggle */}
        <div className="card-type-select">
            <label>
                <input type="radio" name="ctype" checked={cardType === "VISA"} onChange={() => setCardType("VISA")} /> Visa
            </label>
            <label>
                <input type="radio" name="ctype" checked={cardType === "MASTERCARD"} onChange={() => setCardType("MASTERCARD")} /> Mastercard
            </label>
        </div>

        <button type="submit" disabled={loading} className={`pay-btn ${loading ? 'loading' : ''}`}>
          {loading ? (
              <span className="spinner"></span>
          ) : (
              `Pay ${amount} ${currency}`
          )}
        </button>

        <div className="payment-footer-extras">
          <div className="provider-badges">
            <img src="/payment_logos_seamless.png" alt="Visa, Mastercard, Apple Pay, Google Pay" className="badges-img" />
          </div>
          
          <div className="footer-disclaimer">
            <p>
              Cardholders are responsible for retaining transaction records and complying
              with all local laws and regulatory requirements related to virtual currency transactions.
              Read our Terms of Service for more information.
            </p>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
      </form>
      
      <style jsx>{`
        .payment-wrapper { max-width: 480px; margin: 0 auto; }

        .card-form {
            background: #1e2538;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }
        
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; color: #8b9bb4; font-size: 12px; margin-bottom: 8px; font-weight: 500; }
        .form-group input { 
            width: 100%; background: #151a27; border: 1px solid #2a344a; padding: 12px 16px; 
            border-radius: 8px; color: #fff; font-size: 16px; transition: all 0.3s;
        }
        .form-group input:focus { border-color: #4facfe; outline: none; box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2); }
        
        .form-row { display: flex; gap: 20px; }
        .half { width: 50%; }
        
        .card-type-select { display: flex; gap: 20px; margin-bottom: 20px; color: #8b9bb4; font-size: 14px; align-items: center; justify-content: center; }
        .card-type-select input { margin-right: 8px; }

        .pay-btn {
            width: 100%; padding: 16px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #fff; font-size: 18px; font-weight: 600; cursor: pointer;
            box-shadow: 0 10px 30px rgba(79, 172, 254, 0.4);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            margin-bottom: 24px;
        }
        .pay-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(79, 172, 254, 0.5); }
        .pay-btn:disabled { background: #3b4255; cursor: not-allowed; box-shadow: none; transform: none; color: #8b9bb4; }
        
        .spinner {
            display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .payment-footer-extras {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .provider-badges {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .badges-img {
          max-width: 240px;
          height: auto;
          opacity: 0.8;
          transition: all 0.3s;
        }

        .badges-img:hover {
          opacity: 1;
        }

        .footer-disclaimer {
          padding: 0 10px;
          text-align: center;
        }

        .footer-disclaimer p {
          color: #8b9bb4;
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
          opacity: 0.8;
        }

        .error-msg { 
            background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); 
            padding: 12px; border-radius: 8px; margin-top: 20px; font-size: 14px; text-align: center; 
        }

        @media screen and (max-width: 480px) {
             .card-form { padding-top: 30px; }
        }
      `}</style>
    </div>
  );
}
