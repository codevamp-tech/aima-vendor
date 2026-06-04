import React from 'react';
import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

/* ── helpers ── */
const fmt = (v: any) => v || '—';
const fmtDate = (v: any) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtDateTime = (v: any) =>
  v
    ? new Date(v).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

/* ── field renderer ── */
function Field({ label, value, mono = false, href }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--text-muted)',
        marginBottom: '0.3rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--text-main)',
        fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--aima-navy)', textDecoration: 'none', fontWeight: 600 }}>
            {value}
          </a>
        ) : value || <span style={{ color: 'var(--text-light)', fontWeight: 400, fontStyle: 'italic' }}>Not provided</span>}
      </div>
    </div>
  );
}

/* ── section wrapper ── */
function Section({ icon, title, desc, children }: {
  icon: string; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(0,51,102,0.04) 0%, rgba(0,51,102,0.02) 100%)',
        borderBottom: '1px solid rgba(0,51,102,0.08)',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--aima-navy), var(--aima-navy-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', boxShadow: '0 2px 8px rgb(0 51 102/0.25)',
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--aima-navy)',
          }}>
            {title}
          </div>
          {desc && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {desc}
            </div>
          )}
        </div>
      </div>
      {/* body */}
      <div>{children}</div>
    </div>
  );
}

/* ── document pill ── */
function DocPill({ label, path, icon }: { label: string; path?: string; icon: string }) {
  if (!path) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc', borderRadius: 8,
        border: '1px dashed var(--border-color)',
      }}>
        <span style={{ fontSize: '1.1rem', opacity: 0.4 }}>{icon}</span>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Not uploaded</div>
        </div>
      </div>
    );
  }

  const ext = path.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <a
      href={path}
      target="_blank"
      rel="noopener noreferrer"
      className="doc-pill-link"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--aima-navy-dark), var(--aima-navy))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--aima-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Click to view · {ext}
          </div>
        </div>
        <div style={{
          flexShrink: 0, fontSize: '0.7rem', fontWeight: 700,
          padding: '0.2rem 0.5rem', borderRadius: 4,
          background: 'rgba(0,51,102,0.1)', color: 'var(--aima-navy)',
          letterSpacing: '0.04em',
        }}>
          {ext}
        </div>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--aima-navy)" strokeWidth={2.5} style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}


/* ── badge ── */
function Badge({ value, yes = 'Yes', no = 'No' }: { value: string; yes?: string; no?: string }) {
  const isYes = value === yes;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.75rem', borderRadius: 20,
      fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.03em',
      background: isYes ? '#d1fae5' : '#f1f5f9',
      color: isYes ? '#065f46' : '#475569',
      border: `1px solid ${isYes ? '#6ee7b7' : '#e2e8f0'}`,
    }}>
      {isYes ? '✓' : '—'} {value || no}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */
export default async function VendorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let vendor: any = null;
  try {
    const [rows]: any = await pool.execute('SELECT * FROM vendors WHERE id = ?', [id]);
    if (rows.length > 0) vendor = rows[0];
  } catch (err) {
    console.error('Error fetching vendor:', err);
  }

  if (!vendor) notFound();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <Link href="/admin" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--aima-navy)', textDecoration: 'none', fontWeight: 600,
          fontSize: '0.875rem', padding: '0.4rem 0.9rem',
          background: 'rgba(0,51,102,0.06)', borderRadius: 8,
          border: '1px solid rgba(0,51,102,0.14)',
          transition: 'all 0.2s',
        }}>
          ← Back to Vendors
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.85rem', borderRadius: 20,
            fontSize: '0.75rem', fontWeight: 700,
            background: '#fef3c7', color: '#92400e',
            border: '1px solid #fcd34d',
          }}>
            ⏳ Pending Review
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.85rem', borderRadius: 20,
            fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(0,51,102,0.07)', color: 'var(--aima-navy)',
            border: '1px solid rgba(0,51,102,0.15)',
          }}>
            ID #{String(vendor.id).padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* ── HERO CARD ── */}
      <div style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--aima-navy-dark) 0%, var(--aima-navy) 60%, var(--aima-navy-light) 100%)',
        padding: '2rem 2.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgb(0 51 102/0.3)',
      }}>
        {/* decorative circle */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(200,169,81,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: '40%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {/* initials avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(200,169,81,0.2)',
              border: '2px solid rgba(200,169,81,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 700, color: 'var(--aima-gold)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              {(vendor.legal_business_name || 'V').charAt(0).toUpperCase()}
            </div>

            <h1 style={{
              fontSize: '1.6rem', fontWeight: 800, color: '#fff',
              margin: 0, lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {vendor.legal_business_name}
            </h1>

            {vendor.trade_name && (
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginTop: '0.3rem', fontWeight: 400 }}>
                Trade name: {vendor.trade_name}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
              {vendor.business_type && (
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: 20,
                  background: 'rgba(200,169,81,0.15)', border: '1px solid rgba(200,169,81,0.35)',
                  color: 'var(--aima-gold-light)', fontSize: '0.75rem', fontWeight: 600,
                }}>
                  🏢 {vendor.business_type}
                </span>
              )}
              {vendor.industry_category && (
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: 20,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 500,
                }}>
                  {vendor.industry_category}
                </span>
              )}
              {vendor.state && (
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500,
                }}>
                  📍 {vendor.state}
                </span>
              )}
            </div>
          </div>

          {/* GSTIN chip */}
          <div style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, padding: '1rem 1.25rem', textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontWeight: 600 }}>
              GSTIN
            </div>
            <div style={{
              fontSize: '1rem', fontWeight: 700, color: '#fff',
              fontFamily: 'monospace', letterSpacing: '0.05em',
            }}>
              {vendor.gstin || '—'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PAN
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--aima-gold-light)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
              {vendor.pan_number || '—'}
            </div>
          </div>
        </div>

        {/* meta row */}
        <div style={{
          display: 'flex', gap: '2rem', marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Registered On', value: fmtDateTime(vendor.created_at) },
            { label: 'Contact', value: vendor.primary_contact_name },
            { label: 'Email', value: vendor.email_address },
            { label: 'Phone', value: vendor.phone_number },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {label}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.2rem', fontWeight: 500 }}>
                {value || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Business Details */}
        <Section icon="🏢" title="Business Details" desc="Company registration & incorporation info">
          <Field label="Legal Business Name" value={fmt(vendor.legal_business_name)} />
          <Field label="Trade Name" value={fmt(vendor.trade_name)} />
          <Field label="Business Type" value={fmt(vendor.business_type)} />
          <Field label="Industry Category" value={fmt(vendor.industry_category)} />
          <Field label="Company Reg. Number" value={fmt(vendor.company_registration_number)} mono />
          <Field label="Date of Incorporation" value={fmtDate(vendor.date_of_incorporation)} />
          {vendor.company_website ? (
            <Field label="Website" value={vendor.company_website} href={vendor.company_website} />
          ) : (
            <Field label="Website" value="" />
          )}
        </Section>

        {/* Contact Information */}
        <Section icon="👤" title="Contact Information" desc="Primary point of contact">
          <Field label="Contact Person" value={fmt(vendor.primary_contact_name)} />
          <Field label="Designation" value={fmt(vendor.designation)} />
          <Field
            label="Email Address"
            value={vendor.email_address}
            href={`mailto:${vendor.email_address}`}
          />
          <Field
            label="Phone Number"
            value={vendor.phone_number}
            href={`tel:${vendor.phone_number}`}
          />
          <Field label="Registered Address" value={fmt(vendor.registered_office_address)} />
          <Field label="State / UT" value={fmt(vendor.state)} />
          <Field label="Postal Code" value={fmt(vendor.postal_code)} mono />
        </Section>

        {/* Tax & Regulatory */}
        <Section icon="💳" title="Tax & Regulatory" desc="GST, PAN and compliance details">
          <Field label="GSTIN" value={vendor.gstin} mono />
          <Field label="PAN Number" value={vendor.pan_number} mono />
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              RCM Applicable
            </div>
            <Badge value={vendor.rcm_applicable || 'No'} />
          </div>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              MSME Registered
            </div>
            <Badge value={vendor.msme_registered || 'No'} />
          </div>

          {vendor.msme_registered === 'Yes' && (
            <>
              <Field label="MSME / Udyam Number" value={fmt(vendor.msme_number)} mono />
              <Field label="Enterprise Name" value={fmt(vendor.enterprise_name)} />
              <Field label="Udyam Registration Date" value={fmtDate(vendor.udyam_date)} />
              <Field label="MSME Category" value={fmt(vendor.msme_category)} />
            </>
          )}
        </Section>

        {/* Documents */}
        <Section icon="📁" title="Uploaded Documents" desc="Click any document to view or download">
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <DocPill icon="🏛️" label="GST Certificate" path={vendor.gst_certificate_path} />
            <DocPill icon="💳" label="PAN Card" path={vendor.pan_card_path} />
            {vendor.msme_registered === 'Yes' && (
              <DocPill icon="🏭" label="MSME / Udyam Certificate" path={vendor.msme_file_path} />
            )}
            <DocPill icon="📜" label="Certificate of Incorporation" path={vendor.coi_file_path} />
            <DocPill icon="🏦" label="Cancelled Cheque" path={vendor.cancelled_cheque_path} />
          </div>
        </Section>
      </div>

      {/* ── ACTION BAR ── */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem 1.5rem',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Registered on <strong>{fmtDateTime(vendor.created_at)}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={`mailto:${vendor.email_address}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              background: 'rgba(0,51,102,0.06)', color: 'var(--aima-navy)',
              borderRadius: 8, fontWeight: 600, fontSize: '0.82rem',
              textDecoration: 'none',
              border: '1px solid rgba(0,51,102,0.15)',
              transition: 'all 0.2s',
            }}
          >
            ✉️ Send Email
          </a>
          <a
            href={`tel:${vendor.phone_number}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              background: 'rgba(0,51,102,0.06)', color: 'var(--aima-navy)',
              borderRadius: 8, fontWeight: 600, fontSize: '0.82rem',
              textDecoration: 'none',
              border: '1px solid rgba(0,51,102,0.15)',
              transition: 'all 0.2s',
            }}
          >
            📞 Call
          </a>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              background: 'linear-gradient(135deg, var(--aima-navy-dark), var(--aima-navy-light))',
              color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgb(0 51 102/0.25)',
              transition: 'all 0.2s',
            }}
          >
            ← All Vendors
          </Link>
        </div>
      </div>
    </div>
  );
}
