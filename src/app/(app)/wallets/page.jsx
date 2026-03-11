"use client";

import { useState, useEffect } from "react";
import { getWallets, createWallet } from "@/lib/api";
import { IoMdAdd, IoMdClose, IoMdWallet } from "react-icons/io";
import { addToast } from "@/store/slices/uiSlice";
import { useDispatch } from "react-redux";

export default function WalletsPage() {
  const dispatch = useDispatch();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New wallet form state
  const [formData, setFormData] = useState({
    address: "",
    chain: "" // Using 'chain' as requested/implied for 'network' or 'wallet name' mapping
  });

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getWallets();
      setWallets(data);
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      dispatch(addToast({ type: "error", title: "Error", description: "Failed to load wallets" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.chain) {
      dispatch(addToast({ type: "error", title: "Missing Fields", description: "Please fill in all fields" }));
      return;
    }

    try {
      setSubmitting(true);
      await createWallet(formData);
      dispatch(addToast({ type: "success", title: "Success", description: "Wallet added successfully" }));
      setShowAddModal(false);
      setFormData({ address: "", chain: "" });
      fetchWallets();
    } catch (error) {
      console.error("Failed to add wallet:", error);
      dispatch(addToast({ type: "error", title: "Error", description: error.message || "Failed to add wallet" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rl-content">
      <div className="page-header">
        <h1 className="rl-page-title">Add your <span>External Wallet</span></h1>
        <button className="rl-btn rl-btn-primary add-btn" onClick={() => setShowAddModal(true)}>
          <IoMdAdd size={20} />
          <span>Add External Wallet</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div className="empty-state">
          <IoMdWallet size={48} />
          <p>No external wallets found. Add one to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 20 }}>
          {wallets.map((wallet) => (
            <div key={wallet.id || wallet._id || Math.random()} className="wallet-card">
              <div className="wallet-card-header">
                <div className="wallet-icon" style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
                  {(wallet.network || wallet.chain || "W").charAt(0).toUpperCase()}
                </div>
                <div className="wallet-info">
                  <div className="wallet-name">{wallet.network || "Unknown Network"}</div>
                  <div className="wallet-label">{wallet.walletAddress ? `${wallet.walletAddress.substring(0, 6)}...${wallet.walletAddress.substring(wallet.walletAddress.length - 4)}` : "No Address"}</div>
                </div>
              </div>
              
              <div className="wallet-balance">
                <div className="wallet-amount">{wallet.balance || "0.00"} {wallet.symbol || ""}</div>
                <div className="wallet-usd">Wallet ID: {wallet.id || "N/A"}</div>
              </div>

              <div className="wallet-actions">
                <button 
                  className="rl-btn rl-btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowDetailModal(wallet)}
                >
                  View Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add External Wallet</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={handleCreateWallet}>
              <div className="form-group">
                <label>Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="Enter wallet address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="rl-input"
                />
              </div>
              <div className="form-group">
                <label>Select Network</label>
                <select 
                  className="rl-input"
                  value={formData.chain}
                  onChange={(e) => setFormData({...formData, chain: e.target.value})}
                >
                  <option value="">-- Choose Network --</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="rl-btn rl-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="rl-btn rl-btn-primary" disabled={submitting}>
                  {submitting ? "Adding..." : "Add External Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Wallet Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(null)}><IoMdClose size={24} /></button>
            </div>
            <div className="detail-body">
              <div className="detail-item">
                <label>Network</label>
                <div className="detail-value">{showDetailModal.network || showDetailModal.chain || "N/A"}</div>
              </div>
              <div className="detail-item">
                <label>Address</label>
                <div className="detail-value break-all">{showDetailModal.walletAddress}</div>
              </div>
              <div className="detail-item">
                <label>Wallet ID</label>
                <div className="detail-value">{showDetailModal.id || "N/A"}</div>
              </div>
               {/* Add more fields here assuming the wallet object has them, e.g. created_at */}
              {showDetailModal.created_at && (
                  <div className="detail-item">
                    <label>Created At</label>
                    <div className="detail-value">{new Date(showDetailModal.created_at).toLocaleString()}</div>
                  </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="rl-btn rl-btn-primary" onClick={() => setShowDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wallet-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .wallet-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.25);
          border-color: rgba(99, 102, 241, 0.5);
        }
        .wallet-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .wallet-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .wallet-info { flex: 1; }
        .wallet-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .wallet-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 0.5px;
        }
        .wallet-balance {
          background: rgba(99, 102, 241, 0.08); /* Indigo tint */
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .wallet-amount {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .wallet-usd {
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
        }
        .wallet-actions {
          display: flex;
          gap: 12px;
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--muted);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1a1b23; /* Dark theme bg */
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 32px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #fff; }
        
        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
        }
        .rl-input {
          width: 100%;
          background: #0f1014;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .rl-input:focus {
          border-color: var(--primary);
          outline: none;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }
        
        .detail-body {
          display: grid;
          gap: 16px;
        }
        .detail-item label {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 4px;
          display: block;
        }
        .detail-value {
          font-size: 16px;
          color: #fff;
          font-weight: 500;
        }
        .break-all {
          word-break: break-all;
        }
        
        @media (max-width: 768px) {
          .wallet-card { padding: 20px; }
        }
      `}</style>
    </div>
  );
}



