'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiUrl, BASE_PATH } from '@/lib/api-path';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Login page — render children only, no shell at all
  if (pathname === `/admin/login`) {

    return <>{children}</>;
  }
  console.log("pathname", pathname);

  async function handleLogout() {
    // Clear the cookie client-side immediately as a reliable fallback
    document.cookie = 'admin_session=; Path=/; Max-Age=0; SameSite=Lax';
    // Also tell the server to invalidate
    try {
      await fetch(apiUrl('/api/admin/logout'), { method: 'POST' });
    } catch { /* ignore if API unreachable */ }
    router.push(`/admin/login`);
    router.refresh();
  }

  return (
    <div className="page-wrapper">
      {/* AIMA Admin Header */}
      <header className="aima-header">
        <div className="aima-header-top">
          <div className="aima-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.aima.in/img/logo.png"
              alt="AIMA — All India Management Association"
              className="aima-logo"
            />
            <div className="aima-logo-divider" />
            <div className="aima-portal-title">
              <span className="title-main">Admin Dashboard</span>
              <span className="title-sub">Vendor Management System</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              href="/admin"
              style={{
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              📋 Vendor List
            </Link>
            <Link
              href="/"
              style={{
                color: 'rgba(200,169,81,0.9)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                background: 'rgba(200,169,81,0.1)',
                border: '1px solid rgba(200,169,81,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              ← Registration Form
            </Link>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              🚪 Logout
            </button>
          </nav>
        </div>
        <div className="aima-header-stripe" />
      </header>

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        {children}
      </main>

      <footer className="aima-footer">
        <p className="aima-footer-text">
          © 2024 <span>All India Management Association (AIMA)</span> — Admin Panel
        </p>
      </footer>
    </div>
  );
}
