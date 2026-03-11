"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { apiRequest, endpoints } from "@/lib/api";
import { addToast } from "@/store/slices/uiSlice";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(50);
  
  // Custom Modal State
  const [modal, setModal] = useState({ show: false, title: "", message: "", onConfirm: null, type: "primary" });

  const statuses = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "chargeback", label: "Chargeback" },
    { value: "chargeback_reversed", label: "Chargeback Reversed" },
  ];

  const limits = [
    { value: 20, label: "Show 20" },
    { value: 50, label: "Show 50" },
    { value: 100, label: "Show 100" },
  ];

  const fetchOrders = async (status = selectedStatus, limit = selectedLimit) => {
    try {
      setLoading(true);
      const data = await apiRequest(endpoints.getPaymentHistory(status, limit), {
        method: "POST"
      });
      const list = Array.isArray(data) ? data : (data?.data || []);
      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      dispatch(addToast({ type: "error", title: "Error", description: err.message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedLimit]);

  const closeConfirm = () => setModal({ ...modal, show: false });

  const triggerCancel = (o) => {
    const pid = o.paymentId || o.id;
    setModal({
      show: true,
      title: "Confirm Cancellation",
      message: "Are you sure you want to cancel this payment request? This action cannot be undone.",
      type: "danger",
      onConfirm: () => handleCancel(pid)
    });
  };



  const handleCancel = async (id) => {
    closeConfirm();
    try {
      setProcessingId(id);
      await apiRequest(endpoints.requestCancel(id), { method: "POST" });
      dispatch(addToast({ type: "success", title: "Success", description: "Payment cancellation requested." }));
      fetchOrders();
    } catch (err) {
      dispatch(addToast({ type: "error", title: "Action Failed", description: err.message }));
    } finally {
      setProcessingId(null);
    }
  };



  const getStatusPill = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "successful" || s === "captured") return <span className="status-pill status-success">{status}</span>;
    if (s === "pending" || s === "verification" || s === "authorized" || s === "pre-authorized") return <span className="status-pill status-verify">{status}</span>;
    return <span className="status-pill status-warn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>{status}</span>;
  };

  return (
    <div className="rl-content">
      <div className="orders-header">
        <div>
          <h1 className="rl-page-title">Payment <span>History</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '-5px' }}>Manage your recent transactions</p>
        </div>
        
        <div className="filter-shelf">
          <div className="filter-group">
            <span className="filter-label">Filter by:</span>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="rl-select-custom">
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <span className="filter-label">Limit:</span>
            <select value={selectedLimit} onChange={(e) => setSelectedLimit(Number(e.target.value))} className="rl-select-custom">
              {limits.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <button onClick={() => fetchOrders()} className="refresh-btn" disabled={loading}>
            {loading ? <span className="loader-mini"></span> : "Refresh"}
          </button>
        </div>
      </div>

      <div className="card glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "18px 24px" }}>Transaction ID</th>
                <th style={{ padding: "18px 12px" }}>Currency</th>
                <th style={{ padding: "18px 12px" }}>Status</th>
                <th style={{ padding: "18px 12px" }}>Amount</th>
                <th style={{ padding: "18px 24px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "80px 40px", textAlign: "center" }}>
                    <div className="pulse-loader">Fetching Transaction Data...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "80px 40px", textAlign: "center", color: 'var(--muted)' }}>
                    No payment records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="order-row">
                    <td style={{ padding: "18px 24px" }}>
                      <div className="id-chip">#{o.id?.slice(-12) || "N/A"}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 6, opacity: 0.8 }}>{o.date || o.createdAt || "Recently"}</div>
                    </td>
                    <td style={{ padding: "18px 12px" }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary-2)' }}>{o.currency}</div>
                    </td>
                    <td style={{ padding: "18px 12px" }}>
                      {getStatusPill(o.status)}
                    </td>
                    <td style={{ padding: "18px 12px" }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.5px' }}>{o.amount}</div>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: "right" }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        {(o.status === "pending" || o.status === "authorized" || o.status === "success" || o.status === "Successful" || o.status === "captured") && (
                          <button 
                            onClick={() => triggerCancel(o)}
                            disabled={processingId === (o.paymentId || o.id)}
                            className="btn-action danger"
                          >
                            Cancel
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button className="rl-btn rl-btn-dark" onClick={closeConfirm}>Cancel</button>
              <button 
                className={`rl-btn ${modal.type === 'danger' ? 'rl-btn-danger' : 'rl-btn-primary'}`} 
                onClick={modal.onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        
        .filter-shelf { display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); }
        .filter-group { display: flex; flex-direction: column; gap: 4px; }
        .filter-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; padding-left: 2px; }
        
        .rl-select-custom { 
          background: #151a27; color: #fff; border: 1px solid #2a344a; 
          padding: 8px 12px; borderRadius: 8px; font-size: 13px; font-weight: 500;
          outline: none; cursor: pointer; min-width: 140px; transition: all 0.2s;
        }
        .rl-select-custom:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }

        .refresh-btn { 
          height: 38px; padding: 0 20px; border-radius: 10px; background: var(--gray-200); 
          color: #fff; border: 1px solid var(--gray-300); cursor: pointer; font-weight: 600;
          margin-top: 14px; transition: all 0.2s;
        }
        .refresh-btn:hover { background: var(--gray-300); transform: translateY(-1px); }

        .id-chip { background: rgba(59,130,246,0.1); color: #fff; padding: 4px 10px; border-radius: 6px; display: inline-block; font-family: monospace; font-weight: 700; font-size: 13px; border: 1px solid rgba(59,130,246,0.2); }
        
        .order-row { transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .order-row:hover { background: rgba(255, 255, 255, 0.02); }
        
        .btn-action { 
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; 
          cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
        }
        .btn-action.primary { background: var(--primary); color: #fff; }
        .btn-action.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .btn-action:hover { opacity: 0.8; transform: scale(1.05); }

        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); 
          display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s;
        }
        .modal-content { max-width: 400px; width: 90%; padding: 30px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .modal-content h2 { margin-bottom: 15px; font-size: 22px; }
        .modal-content p { color: var(--muted); margin-bottom: 25px; line-height: 1.5; }
        .modal-actions { display: flex; gap: 15px; justify-content: center; }

        .pulse-loader { animation: pulse 1.5s infinite; color: var(--primary); font-weight: 700; font-size: 18px; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

        .loader-mini { 
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); 
          border-top-color: #fff; border-radius: 50%; display: block; animation: spin 0.8s linear infinite; 
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .orders-header { margin-top: 20px; }
          .filter-shelf { width: 100%; flex-wrap: wrap; }
          .rl-select-custom { min-width: 120px; }
        }
      `}</style>
    </div>
  );
}


