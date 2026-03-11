"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import CardPaymentForm from "@/components/CardPaymentForm";
import TransferConfirmation from "@/components/TransferConfirmation";
import { selectPaymentState, initiateTransfer, resetPaymentState } from "@/store/slices/paymentSlice";
import { addToast } from "@/store/slices/uiSlice";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { paymentStatus, transferStatus, loading, error, paymentId } = useSelector(selectPaymentState);

  // Reset state on mount to ensure fresh checkout
  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);
  
  const fiatAmount = searchParams.get("fiatAmount");
  const fiatCurrency = searchParams.get("fiatCurrency");
  const cryptoAmount = searchParams.get("cryptoAmount");
  const cryptoCurrency = searchParams.get("cryptoCurrency");

  const handleTransfer = () => {
      // Delay to match the 4-second popup in TransferConfirmation
      setTimeout(() => {
          dispatch(resetPaymentState());
          router.push("/dashboard?status=success");
      }, 400); 
  };

  useEffect(() => {
      if (transferStatus === "success") {
          dispatch(addToast({ type: "success", title: "Transfer Complete", description: "Crypto has been credited to your wallet!" }));
          setTimeout(() => {
              dispatch(resetPaymentState());
              router.push("/dashboard?status=success");
          }, 1500);
      }
  }, [transferStatus, dispatch, router]);

  if (!fiatAmount || !fiatCurrency) {
      return (
        <div className="rl-content text-center">
            <div className="error-state">
                <h2>Invalid Checkout Session</h2>
                <p>Please initiate a valid transaction from the dashboard.</p>
                <Link href="/dashboard" className="rl-btn rl-btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>
                    Go to Dashboard
                </Link>
            </div>
             <style jsx>{`
                .text-center { text-align: center; padding-top: 50px; }
                .error-state { background: #1e2538; padding: 40px; border-radius: 16px; display: inline-block; }
                h2 { margin-bottom: 10px; color: #fff; }
                p { color: #8b9bb4; }
            `}</style>
        </div>
      );
  }

  if (paymentStatus === "authorized" || paymentStatus === "capturing" || paymentStatus === "captured" || transferStatus === "loading" || transferStatus === "success") {
      return (
          <div className="rl-content" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
              <TransferConfirmation 
                  paymentId={paymentId}
                  fiatAmount={fiatAmount}
                  fiatCurrency={fiatCurrency}
                  cryptoAmount={cryptoAmount}
                  cryptoCurrency={cryptoCurrency}
                  onConfirm={handleTransfer}
                  loading={loading}
              />
          </div>
      );
  }

  return (
    <div className="rl-content">
       <div className="checkout-header">
           <Link href="/dashboard" className="back-link">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
               Back
           </Link>
           <h1 className="rl-page-title">Checkout</h1>
       </div>

       <div className="checkout-grid">
           <div className="summary-section">
               <div className="summary-card">
                   <h2>Order Summary</h2>
                   <div className="summary-row type">
                       <span>Transaction Type</span>
                       <strong>{cryptoCurrency} Purchase</strong>
                   </div>
                   <div className="divider"></div>
                   <div className="summary-row">
                       <span>You Pay</span>
                       <div className="amount">{fiatAmount} <small>{fiatCurrency}</small></div>
                   </div>
                   <div className="summary-row">
                       <span>You Receive</span>
                       <div className="amount highlight">{cryptoAmount} <small>{cryptoCurrency}</small></div>
                   </div>
                   <div className="divider"></div>
                   <div className="summary-row total">
                       <span>Total Due</span>
                       <div className="total-amount">{fiatAmount} {fiatCurrency}</div>
                   </div>
               </div>
               
               <div className="security-note">
                   <div className="icon">🔒</div>
                   <p>Your payment information is encrypted and secure. We do not store your full card details.</p>
               </div>
           </div>
           
           <div className="payment-section">
               <div className="payment-header">
                   <h3>Payment Method</h3>
                   <div className="icons">
                       <span className="visa">VISA</span>
                       <span className="mc">MC</span>
                   </div>
               </div>
               <CardPaymentForm 
                    amount={fiatAmount} 
                    currency={fiatCurrency}
                    cryptoAmount={cryptoAmount}
                    cryptoCurrency={cryptoCurrency}
                    onSuccess={() => { /* Handled by status change */ }} 
               />
           </div>
       </div>

       <style jsx>{`
         .checkout-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
         .back-link { display: flex; align-items: center; gap: 8px; color: #8b9bb4; text-decoration: none; transition: color 0.2s; }
         .back-link:hover { color: #fff; }
         
         .checkout-grid { 
             display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; max-width: 1000px; margin: 0 auto; 
             align-items: start;
         }
         
         .summary-card { 
             background: #1e2538; padding: 30px; border-radius: 20px; 
             box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
             border: 1px solid rgba(255,255,255,0.05);
         }
         .summary-card h2 { font-size: 20px; margin-bottom: 24px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
         
         .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; color: #8b9bb4; font-size: 15px; }
         .summary-row strong { color: #fff; }
         .summary-row .amount { font-size: 18px; color: #fff; font-weight: 500; }
         .summary-row .amount.highlight { color: #3b82f6; }
         .summary-row.total { margin-top: 10px; margin-bottom: 0; }
         .summary-row.total span { font-weight: 600; color: #fff; font-size: 16px; }
         .summary-row.total .total-amount { font-size: 24px; font-weight: 700; color: #10b981; }
         
         .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }
         
         .payment-section { margin-top: 10px; }
         .payment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px; }
         .payment-header h3 { font-size: 18px; color: #fff; margin: 0; }
         .payment-header .icons { display: flex; gap: 10px; font-weight: bold; font-size: 12px; color: #8b9bb4; }
         
         .security-note { 
             margin-top: 24px; display: flex; gap: 12px; 
             background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); 
             padding: 16px; border-radius: 12px; color: #3b82f6; font-size: 13px; line-height: 1.5;
         }
         .security-note .icon { font-size: 18px; }

         @media (max-width: 850px) {
             .checkout-grid { grid-template-columns: 1fr; }
             .summary-section { order: 2; }
             .payment-section { order: 1; }
         }
       `}</style>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="rl-content text-center" style={{paddingTop: 100}}>
                 <div className="spinner"></div>
                 <p style={{marginTop: 20, color: '#8b9bb4'}}>Loading Secure Checkout...</p>
                 <style jsx>{`
                    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .text-center { text-align: center; }
                 `}</style>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
