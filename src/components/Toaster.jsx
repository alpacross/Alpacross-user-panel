"use client";

import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "@/store/slices/uiSlice";
import { useEffect } from "react";

export default function Toaster() {
  const dispatch = useDispatch();
  const toasts = useSelector((s) => s.ui.toasts);

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => dispatch(removeToast(t.id)), t.duration || 3000));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div style={{position:'fixed',top:16,right:16,display:'grid',gap:12,zIndex:10000}}>
      {toasts.map(t => (
        <div key={t.id} style={{minWidth:260,maxWidth:380,background:'#111',color:'#fff',padding:'12px 14px',borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.25)',borderLeft:`4px solid ${t.type==='success'?'#22c55e':t.type==='error'?'#ef4444':'#3b82f6'}`}}>
          <div style={{fontWeight:600,marginBottom:4}}>{t.title}</div>
          {t.description && <div style={{opacity:0.9,fontSize:14}}>{String(t.description)}</div>}
        </div>
      ))}
    </div>
  );
}



