"use client";

import { FaShieldAlt, FaBolt, FaChartLine } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="hero-wrap">
      <div className="hero-inner">
        <p className="hero-kicker">Next‑Gen Crypto Platform</p>
        <h1 className="hero-title">
          Welcome to <span>Alpacross</span>
        </h1>
        <p className="hero-sub">
          The most advanced cryptocurrency trading platform designed for the future. Trade, invest, and grow your portfolio with cutting‑edge technology and unparalleled security.
        </p>
        <div className="hero-actions">
          <a className="rl-btn rl-btn-outline-accent" href="#exchange">Start Trading</a>
          <a className="rl-btn rl-btn-primary" href="#learn">Learn More</a>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaShieldAlt /></div>
            <h4>Bank‑Grade Security</h4>
            <p>Advanced encryption and multi‑layer security protocols</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaBolt /></div>
            <h4>Lightning Fast</h4>
            <p>Execute trades in milliseconds with our optimized engine</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaChartLine /></div>
            <h4>Smart Analytics</h4>
            <p>AI‑powered insights to maximize your trading potential</p>
          </div>
        </div>
      </div>
    </section>
  );
}




