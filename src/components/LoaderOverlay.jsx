"use client";

import { useSelector } from "react-redux";

export default function LoaderOverlay() {
  const loading = useSelector((s) => s.ui.globalLoading);
  if (!loading) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        <div className="spinner" style={{width:48,height:48,border:'4px solid #fff',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
        <span style={{color:'#fff'}}>Loading...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}



