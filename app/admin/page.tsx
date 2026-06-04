'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ── Types ───────────────────────────────────────────────── */
interface Vendor {
  id: number;
  legal_business_name: string;
  gstin: string;
  pan_number: string;
  email_address: string;
  phone_number: string;
  state: string;
  created_at: string;
}

interface ApiResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 10;

/* ── Helpers ─────────────────────────────────────────────── */
function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ── Main Component ─────────────────────────────────────── */
export default function AdminPage() {
  // ── Search state
  const [company,  setCompany]  = useState('');
  const [pan,      setPan]      = useState('');
  const [gstin,    setGstin]    = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // ── Committed search (only applied when Search button is clicked)
  const [committed, setCommitted] = useState({ company: '', pan: '', gstin: '', dateFrom: '', dateTo: '' });

  // ── Data state
  const [vendors,    setVendors]    = useState<Vendor[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  /* ── Fetch ───────────────────────────────────────────────── */
  const fetchVendors = useCallback(async (
    p: number,
    filters: typeof committed,
  ) => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        page:  String(p),
        limit: String(LIMIT),
        ...(filters.company  && { company:   filters.company }),
        ...(filters.pan      && { pan:       filters.pan }),
        ...(filters.gstin    && { gstin:     filters.gstin }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo   && { date_to:   filters.dateTo }),
      });
      const res = await fetch(`/api/admin/vendors?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ApiResponse = await res.json();
      setVendors(data.vendors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch {
      setError('Failed to load vendors. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVendors(1, committed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ────────────────────────────────────────────── */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = { company, pan, gstin, dateFrom, dateTo };
    setCommitted(next);
    fetchVendors(1, next);
  }

  function handleClear() {
    setCompany(''); setPan(''); setGstin(''); setDateFrom(''); setDateTo('');
    const empty = { company: '', pan: '', gstin: '', dateFrom: '', dateTo: '' };
    setCommitted(empty);
    fetchVendors(1, empty);
  }

  function handlePageChange(p: number) {
    if (p < 1 || p > totalPages) return;
    fetchVendors(p, committed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Pagination meta ─────────────────────────────────────── */
  const start = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const end   = Math.min(page * LIMIT, total);
  const pages = getPageNumbers(page, totalPages);

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="animate-fade-in">

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--aima-navy-dark), var(--aima-navy))',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '10px',
          flex: '1', minWidth: '180px', boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            Total Registrations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {loading ? '—' : total}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--aima-gold-dark), var(--aima-gold))',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '10px',
          flex: '1', minWidth: '180px', boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {loading ? '—' : total}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card">

        {/* Card header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--aima-navy)', margin: 0 }}>
              Registered Vendors
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Click on any vendor to view full details
            </p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="admin-search-panel">
          {/* Row 1: Company Name | Date From | Date To */}
          <div className="admin-search-row">
            <div>
              <label className="search-field-label">Company Name</label>
              <input
                id="search-company"
                className="search-input"
                type="text"
                placeholder="Search by business name…"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="search-field-label">Date From</label>
              <input
                id="search-date-from"
                className="search-input"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="search-field-label">Date To</label>
              <input
                id="search-date-to"
                className="search-input"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: PAN | GSTIN | Buttons */}
          <div className="admin-search-row">
            <div>
              <label className="search-field-label">PAN Number</label>
              <input
                id="search-pan"
                className="search-input"
                type="text"
                placeholder="Search by PAN…"
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
            <div>
              <label className="search-field-label">GSTIN</label>
              <input
                id="search-gstin"
                className="search-input"
                type="text"
                placeholder="Search by GSTIN…"
                value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>
            <button
              id="search-submit-btn"
              type="submit"
              className="search-btn search-btn-primary"
              disabled={loading}
            >
              🔍 Search
            </button>
            <button
              id="search-clear-btn"
              type="button"
              className="search-btn search-btn-clear"
              onClick={handleClear}
              disabled={loading}
            >
              ✕ Clear
            </button>
          </div>
        </form>

        {/* ── Table body ── */}
        {error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error-color)' }}>
            ⚠️ {error}
          </div>
        ) : loading ? (
          <div className="admin-loading">
            <div className="admin-loading-spinner" />
            <p>Loading vendors…</p>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              No vendors found
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business Name</th>
                  <th>GSTIN</th>
                  <th>PAN</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>State</th>
                  <th>Registered On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <Link
                        href={`/admin/${vendor.id}`}
                        style={{ textDecoration: 'none', color: 'var(--aima-navy)', fontWeight: 700 }}
                      >
                        #{String(vendor.id).padStart(4, '0')}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/admin/${vendor.id}`}
                        style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, display: 'block' }}
                      >
                        {vendor.legal_business_name}
                      </Link>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.8rem',
                        background: 'rgba(0,51,102,0.06)', padding: '0.2rem 0.5rem',
                        borderRadius: '4px', color: 'var(--aima-navy)', fontWeight: 600,
                      }}>
                        {vendor.gstin || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.8rem',
                        background: 'rgba(200,169,81,0.1)', padding: '0.2rem 0.5rem',
                        borderRadius: '4px', color: 'var(--aima-gold-dark)', fontWeight: 600,
                      }}>
                        {vendor.pan_number || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{vendor.email_address}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{vendor.phone_number}</td>
                    <td style={{ fontSize: '0.85rem' }}>{vendor.state || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(vendor.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className="status-badge pending">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && total > 0 && (
          <div className="admin-pagination">
            <div className="pagination-info">
              Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> vendors
            </div>

            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              {pages.map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--text-muted)' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => handlePageChange(p as number)}
                    aria-label={`Page ${p}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="page-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
