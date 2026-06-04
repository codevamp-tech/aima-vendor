'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #002244 0%, #003366 40%, #004a8f 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Roboto', sans-serif;
          padding: 1.5rem;
        }

        /* Radial glow behind card */
        .login-page::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(ellipse, rgba(200, 169, 81, 0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Subtle grid pattern */
        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.97);
          border-radius: 20px;
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.15);
          overflow: hidden;
          animation: loginFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-card-header {
          background: linear-gradient(135deg, #002244 0%, #003366 50%, #004a8f 100%);
          padding: 2rem 2rem 1.75rem;
          text-align: center;
          position: relative;
        }

        .login-card-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #a88a3a, #C8A951, #e0c97a, #C8A951, #a88a3a);
        }

        .login-logo {
          height: 48px;
          width: auto;
          margin-bottom: 1rem;
          filter: brightness(1.05) drop-shadow(0 2px 6px rgba(0,0,0,0.4));
        }

        .login-title {
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.2rem;
          letter-spacing: 0.01em;
        }

        .login-subtitle {
          color: rgba(200, 169, 81, 0.9);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }

        .login-card-body {
          padding: 2rem;
        }

        .login-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #1a2332;
          margin-bottom: 0.4rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .login-field {
          margin-bottom: 1.25rem;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #d0dae6;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #1a2332;
          background: #f8fafc;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #003366;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
        }

        .login-input.has-toggle {
          padding-right: 3rem;
        }

        .toggle-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #5a6a7a;
          padding: 0.25rem;
          font-size: 1.1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }

        .toggle-btn:hover { color: #003366; }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 500;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }

        .login-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #002244, #003366, #004a8f);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 51, 102, 0.35);
          position: relative;
          overflow: hidden;
        }

        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(200,169,81,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .login-btn:hover:not(:disabled)::after { opacity: 1; }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 51, 102, 0.45);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }

        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          padding: 1rem 2rem 1.5rem;
          text-align: center;
          border-top: 1px solid #e8edf3;
        }

        .login-footer p {
          font-size: 0.75rem;
          color: #8a9bac;
          margin: 0;
        }

        .login-footer span {
          color: #C8A951;
          font-weight: 600;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          {/* Header */}
          <div className="login-card-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.aima.in/img/logo.png"
              alt="AIMA"
              className="login-logo"
            />
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Vendor Management System</p>
          </div>

          {/* Form */}
          <div className="login-card-body">
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="login-error" role="alert">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label htmlFor="admin-username" className="login-label">
                  Username
                </label>
                <div className="login-input-wrap">
                  <input
                    id="admin-username"
                    type="text"
                    className="login-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="admin-password" className="login-label">
                  Password
                </label>
                <div className="login-input-wrap">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input has-toggle"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                className="login-btn"
                disabled={loading || !username || !password}
              >
                <span className="login-btn-inner">
                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>🔐</span>
                      <span>Sign In to Admin</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>
              © 2024 <span>All India Management Association (AIMA)</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
