'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { apiUrl, BASE_PATH } from '@/lib/api-path';

/* =========================================================
   TYPES
   ========================================================= */
type ScanState = 'idle' | 'scanning' | 'success' | 'error' | 'no-api';

interface SmartUploadProps {
  name: string;
  docType: 'gst' | 'pan' | 'msme';
  label: string;
  required?: boolean;
  onScanComplete: (data: Record<string, string>) => void;
  onScanStatus: (status: ScanState, message?: string) => void;
}

/* =========================================================
   SMART UPLOAD COMPONENT
   ========================================================= */
function SmartUploadZone({
  name,
  docType,
  label,
  required,
  onScanComplete,
  onScanStatus,
}: SmartUploadProps) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const scanDocument = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setScanState('scanning');
      onScanStatus('scanning');

      const fd = new FormData();
      fd.append('file', file);
      fd.append('docType', docType);

      try {
        const res = await fetch(apiUrl('/api/scan-document'), {
          method: 'POST',
          body: fd,
        });
        const json = await res.json();

        if (json.success && json.data) {
          setScanState('success');
          setScanMessage('Document scanned — details auto-filled below');
          onScanComplete(json.data);
          onScanStatus('success');
        } else {
          const msg = json.error || 'Could not read document automatically.';
          if (msg.includes('not configured')) {
            setScanState('no-api');
          } else {
            setScanState('error');
          }
          setScanMessage(msg);
          onScanStatus('error', msg);
        }
      } catch {
        setScanState('error');
        setScanMessage('Scan failed. Please fill in details manually.');
        onScanStatus('error');
      }
    },
    [docType, onScanComplete, onScanStatus]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanDocument(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      scanDocument(file);
    }
  };

  const zoneClass = [
    'upload-zone smart-zone',
    dragOver ? 'drag-over' : '',
    fileName ? 'has-file' : '',
    scanState === 'scanning' ? 'scanning' : '',
    scanState === 'error' ? 'scan-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <div
        className={zoneClass}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{ minHeight: '90px' }}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          required={required}
          accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Scanning overlay */}
        {scanState === 'scanning' && (
          <div className="scan-overlay">
            <div className="scan-spinner" />
            <div className="scan-label">🔍 Scanning Document…</div>
            <div className="scan-sublabel">Gemini AI is reading your {docType === 'gst' ? 'GST Certificate' : docType === 'pan' ? 'PAN Card' : 'MSME Certificate'}</div>
          </div>
        )}

        <div className="upload-zone-content">
          {fileName && scanState !== 'scanning' ? (
            <>
              <div className="upload-icon">{scanState === 'success' ? '✅' : scanState === 'error' || scanState === 'no-api' ? '⚠️' : '📎'}</div>
              <div className="upload-label" style={{ fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '100%' }}>
                {fileName}
              </div>
              <div className="upload-sublabel" style={{ fontSize: '0.7rem' }}>Click to replace</div>
            </>
          ) : (
            <>
              <div className="upload-icon">{docType === 'gst' ? '🏛️' : docType === 'pan' ? '💳' : '🏭'}</div>
              <div>
                <span className="smart-badge">⚡ Smart Scan</span>
              </div>
              <div className="upload-label">{label}</div>
              <div className="upload-sublabel">
                Drop file or click to browse · JPG, PNG, PDF, DOCX · Max 20MB
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status banners */}
      {scanState === 'success' && (
        <div className="scan-success-banner">
          ✅ {scanMessage}
        </div>
      )}
      {(scanState === 'error') && (
        <div className="scan-warn-banner">
          ⚠️ {scanMessage} — Please fill in manually.
        </div>
      )}
      {scanState === 'no-api' && (
        <div className="scan-warn-banner">
          🔑 AI scanning not configured (add GEMINI_API_KEY to .env.local). Fill details manually.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REGULAR UPLOAD ZONE
   ========================================================= */
function UploadZone({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      setFileName(file.name);
    }
  };

  return (
    <div
      className={['upload-zone', dragOver ? 'drag-over' : '', fileName ? 'has-file' : ''].filter(Boolean).join(' ')}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{ minHeight: '80px' }}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        required={required}
        accept="image/*,.pdf,.doc,.docx,application/pdf"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
        style={{ display: 'none' }}
      />
      <div className="upload-zone-content">
        {fileName ? (
          <>
            <div className="upload-icon">📎</div>
            <div className="upload-label" style={{ fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '100%' }}>
              {fileName}
            </div>
            <div className="upload-sublabel" style={{ fontSize: '0.7rem' }}>Click to replace</div>
          </>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <div className="upload-label">{label}</div>
            <div className="upload-sublabel">Drop file or click to browse · JPG, PNG, PDF, DOCX · Max 20MB</div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INDIAN STATES LIST
   ========================================================= */
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/* =========================================================
   MAIN PAGE
   ========================================================= */
export default function VendorRegistration() {
  const [msmeRegistered, setMsmeRegistered] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGstRegistered, setIsGstRegistered] = useState('yes');
  const [hasPanCard, setHasPanCard] = useState('yes');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email OTP state
  const [emailValue, setEmailValue] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-fill state (GST)
  const [gstScanState, setGstScanState] = useState<ScanState>('idle');
  // Auto-fill state (PAN)
  const [panScanState, setPanScanState] = useState<ScanState>('idle');
  // Auto-fill state (MSME)
  const [msmeScanState, setMsmeScanState] = useState<ScanState>('idle');

  // Form field refs for auto-fill
  const refs = {
    gstin: useRef<HTMLInputElement>(null),
    legalBusinessName: useRef<HTMLInputElement>(null),
    tradeName: useRef<HTMLInputElement>(null),
    registeredOfficeAddress: useRef<HTMLTextAreaElement>(null),
    stateUnionTerritory: useRef<HTMLSelectElement>(null),
    postalCode: useRef<HTMLInputElement>(null),
    businessType: useRef<HTMLSelectElement>(null),
    panNumber: useRef<HTMLInputElement>(null),
    primaryContactName: useRef<HTMLInputElement>(null),
    msmeNumber: useRef<HTMLInputElement>(null),
    enterpriseName: useRef<HTMLInputElement>(null),
    udyamDate: useRef<HTMLInputElement>(null),
    msmeCategory: useRef<HTMLSelectElement>(null),
  };

  const fillField = (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>, value: string) => {
    if (ref.current && value) {
      (ref.current as HTMLInputElement).value = value;
      ref.current.classList.add('auto-filled');
      ref.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleGSTScan = useCallback((data: Record<string, string>) => {
    if (data.gstin) fillField(refs.gstin, data.gstin);
    if (data.legalBusinessName) fillField(refs.legalBusinessName, data.legalBusinessName);
    if (data.tradeName) fillField(refs.tradeName, data.tradeName);
    if (data.registeredAddress) fillField(refs.registeredOfficeAddress, data.registeredAddress);
    if (data.postalCode) fillField(refs.postalCode, data.postalCode);

    // Map state
    if (data.state && refs.stateUnionTerritory.current) {
      const sel = refs.stateUnionTerritory.current;
      const match = Array.from(sel.options).find(
        (o) => o.value.toLowerCase() === data.state.toLowerCase() ||
          o.value.toLowerCase().includes(data.state.toLowerCase().substring(0, 5))
      );
      if (match) {
        sel.value = match.value;
        sel.classList.add('auto-filled');
      }
    }

    // Map business type
    if (data.businessType && refs.businessType.current) {
      const sel = refs.businessType.current;
      const map: Record<string, string> = {
        'proprietorship': 'Proprietorship',
        'proprietor': 'Proprietorship',
        'sole': 'Proprietorship',
        'partnership': 'Partnership Firm',
        'private limited': 'Private Limited Company',
        'private': 'Private Limited Company',
        'pvt': 'Private Limited Company',
        'llp': 'LLP',
        'limited liability': 'LLP',
        'public limited': 'Public Limited Company',
        'public': 'Public Limited Company',
      };
      const lower = data.businessType.toLowerCase();
      const found = Object.keys(map).find((k) => lower.includes(k));
      if (found) {
        sel.value = map[found];
        sel.classList.add('auto-filled');
      }
    }
  }, []);

  const handlePANScan = useCallback((data: Record<string, string>) => {
    if (data.panNumber) fillField(refs.panNumber, data.panNumber);
    // For sole proprietors, also fill primary contact name if empty
    if (data.panHolderName && refs.primaryContactName.current) {
      const cur = refs.primaryContactName.current.value;
      if (!cur) fillField(refs.primaryContactName, data.panHolderName);
    }
  }, []);

  const handleMSMEScan = useCallback((data: Record<string, string>) => {
    if (data.msmeNumber) fillField(refs.msmeNumber, data.msmeNumber);
    if (data.enterpriseName) fillField(refs.enterpriseName, data.enterpriseName);
    if (data.udyamDate) fillField(refs.udyamDate, data.udyamDate);

    // Map msme category
    if (data.msmeCategory && refs.msmeCategory.current) {
      const sel = refs.msmeCategory.current;
      const lower = data.msmeCategory.toLowerCase();
      const match = Array.from(sel.options).find(o => o.value && lower.includes(o.value.toLowerCase()));
      if (match) {
        sel.value = match.value;
        sel.classList.add('auto-filled');
      }
    }
  }, []);

  // ── OTP handlers ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setOtpError('Please enter a valid email address first.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(apiUrl('/api/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCountdown(60);
        setOtpValue('');
      } else {
        setOtpError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(apiUrl('/api/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, otp: otpValue }),
      });
      const data = await res.json();
      if (data.verified) {
        setEmailVerified(true);
        setOtpSent(false);
      } else {
        setOtpError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEmailChange = (val: string) => {
    setEmailValue(val);
    // Reset verification if email changes
    if (emailVerified || otpSent) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtpValue('');
      setOtpError('');
      setCountdown(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailVerified) {
      alert('⚠️ Please verify your email address before submitting.');
      return;
    }

    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(apiUrl('/api/register'), {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        // Show attractive success modal instead of alert
        setShowSuccessModal(true);
      } else {
        alert('Registration failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* ===== AIMA HEADER ===== */}
      <header className="aima-header">
        <div className="aima-header-top">
          <div className="aima-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}/maxresdefault.jpg`}
              alt="AIMA — All India Management Association"
              className="aima-logo"
            />
            <div className="aima-logo-divider" />
            <div className="aima-portal-title">
              <h1 className="title-main">Vendor Registration Portal</h1>
              {/* <span className="title-sub">Registration System</span> */}
            </div>
          </div>

          <div className="aima-header-badge">
            🔒 Secure Registration
          </div>
        </div>
        <div className="aima-header-stripe" />
      </header>

      {/* ===== HERO BANNER ===== */}
      <section className="aima-hero">
        {/* <h1 className="aima-hero-title">Vendor Registration Portal</h1> */}
        <p className="aima-hero-sub">
          Register your business with AIMA. Upload your GST &amp; PAN documents — our AI will auto-fill your details instantly.
        </p>
        <div className="aima-hero-steps">
          <div className="hero-step">
            <span className="hero-step-num">1</span>
            Upload GST Document
          </div>
          <div className="hero-step">
            <span className="hero-step-num">2</span>
            AI Auto-fills Details
          </div>
          <div className="hero-step">
            <span className="hero-step-num">3</span>
            Review &amp; Submit
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <main className="page-content">
        <form onSubmit={handleSubmit} className={`animate-fade-in ${hasAttemptedSubmit ? 'was-validated' : ''}`}>
          <div className="card">

            {/* ── SECTION 1: GST VERIFICATION ── */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">🏛️</div>
                <div>
                  <div className="section-title">GST Verification</div>
                  <div className="section-title-desc">Are you registered under the GST Act?</div>
                </div>
              </div>
              <div className="section-body">
                <div className="form-group mb-2">
                  <label className="form-label">Are you registered under the GST Act? <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="isGstRegistered" value="yes" checked={isGstRegistered === 'yes'} onChange={() => setIsGstRegistered('yes')} />
                      Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="isGstRegistered" value="no" checked={isGstRegistered === 'no'} onChange={() => setIsGstRegistered('no')} />
                      No
                    </label>
                  </div>
                </div>

                {isGstRegistered === 'yes' && (
                  <div className="row" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
                    <div className="form-group full-width">
                      <label className="form-label">
                        GST Certificate <span className="required">*</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--aima-gold-dark)', fontWeight: 400 }}>
                          ⚡ Smart AI Scan
                        </span>
                      </label>
                      <SmartUploadZone
                        name="gstCertificate"
                        docType="gst"
                        label="Drop GST Certificate here (Image / PDF / DOCX)"
                        required={isGstRegistered === 'yes'}
                        onScanComplete={handleGSTScan}
                        onScanStatus={setGstScanState}
                      />
                      {gstScanState === 'idle' && (
                        <div className="info-tip">
                          💡 Upload your GST registration certificate to auto-fill business details below
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">GSTIN <span className="required">*</span></label>
                      <input
                        ref={refs.gstin}
                        type="text"
                        name="gstin"
                        className="form-control"
                        required={isGstRegistered === 'yes'}
                        placeholder="e.g. 27AABCT1332L1ZG"
                        maxLength={15}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>

                  </div>
                )}
              </div>
            </div>

            <div className="divider" />

            {/* ── SECTION 2: BUSINESS DETAILS ── */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">🏢</div>
                <div>
                  <div className="section-title">Business Details</div>
                  <div className="section-title-desc">Auto-filled from your GST Certificate — please verify and complete</div>
                </div>
              </div>
              <div className="section-body">
                <div className="row">
                  <div className="form-group full-width">
                    <label className="form-label">Legal Business Name <span className="required">*</span></label>
                    <input
                      ref={refs.legalBusinessName}
                      type="text"
                      name="legalBusinessName"
                      className="form-control"
                      required
                      placeholder="Legal Entity Name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trade Name</label>
                    <input
                      ref={refs.tradeName}
                      type="text"
                      name="tradeName"
                      className="form-control"
                      placeholder="Trade name if different from legal name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Type <span className="required">*</span></label>
                    <select ref={refs.businessType} name="businessType" className="form-select" required>
                      <option value="">Select Business Type</option>
                      <option>Proprietorship</option>
                      <option>Partnership Firm</option>
                      <option>LLP</option>
                      <option>Private Limited Company</option>
                      <option>Public Limited Company</option>
                      <option>One Person Company (OPC)</option>
                      <option>Section 8 Company</option>
                      <option>Society</option>
                      <option>Trust</option>
                      <option>Government Organization</option>
                      <option>Self Employed Professional</option>
                      <option>Consultant/Freelancer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry Category <span className="required">*</span></label>
                    <select name="industryCategory" className="form-select" required>
                      <option value="">Select Category</option>
                      <option>IT Services</option>
                      <option>Manufacturing</option>
                      <option>Logistics</option>
                      <option>Marketing</option>
                      <option>Office Supplies</option>
                      <option>Education</option>
                      <option>Consulting</option>
                      <option>Professional Services</option>
                      <option>Finance</option>
                      <option>NGOs</option>
                      <option>Training Providers</option>
                      <option>Others</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Registration Number</label>
                    <input
                      type="text"
                      name="companyRegistrationNumber"
                      className="form-control"
                      placeholder="CIN / Registration No."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date Of Incorporation</label>
                    <input type="date" name="dateOfIncorporation" className="form-control" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Website</label>
                    <input
                      type="url"
                      name="companyWebsite"
                      className="form-control"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* ── SECTION 3: CONTACT INFORMATION ── */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">👤</div>
                <div>
                  <div className="section-title">Contact Information</div>
                  <div className="section-title-desc">Primary point of contact for this registration</div>
                </div>
              </div>
              <div className="section-body">
                <div className="row">
                  <div className="form-group">
                    <label className="form-label">Primary Contact Name <span className="required">*</span></label>
                    <input
                      ref={refs.primaryContactName}
                      type="text"
                      name="primaryContactName"
                      className="form-control"
                      required
                      placeholder="Full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation <span className="required">*</span></label>
                    <input
                      type="text"
                      name="designation"
                      className="form-control"
                      required
                      placeholder="e.g. Director, CFO, Manager"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                      {emailVerified && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          ✅ Verified
                        </span>
                      )}
                    </label>
                    <div className="email-otp-wrap">
                      {/* Email input + Send OTP / Verified badge */}
                      <div className="email-input-row">
                        <input
                          type="email"
                          name="emailAddress"
                          className="form-control"
                          required
                          placeholder="official@company.com"
                          value={emailValue}
                          onChange={e => handleEmailChange(e.target.value)}
                          readOnly={emailVerified}
                        />
                        {emailVerified ? (
                          <div className="email-verified-badge">✅ Verified</div>
                        ) : (
                          <button
                            type="button"
                            className={`otp-send-btn${otpSent ? ' resend' : ''}`}
                            onClick={handleSendOtp}
                            disabled={otpLoading || !emailValue || countdown > 0}
                          >
                            {otpLoading && !otpSent ? '…' : otpSent
                              ? countdown > 0
                                ? `Resend in ${String(countdown).padStart(2, '0')}s`
                                : 'Resend OTP'
                              : '📨 Send OTP'}
                          </button>
                        )}
                      </div>

                      {/* OTP entry section */}
                      {otpSent && !emailVerified && (
                        <div className="otp-section">
                          <div className="otp-section-hint">
                            OTP sent to <strong>{emailValue}</strong>. Enter the 6-digit code below.
                          </div>
                          <div className="otp-input-row">
                            <input
                              type="text"
                              className="otp-input"
                              placeholder="000000"
                              maxLength={6}
                              value={otpValue}
                              onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="otp-verify-btn"
                              onClick={handleVerifyOtp}
                              disabled={otpLoading || otpValue.length !== 6}
                            >
                              {otpLoading ? '…' : '✓ Verify'}
                            </button>
                          </div>
                          {otpError && (
                            <div className="otp-error">⚠️ {otpError}</div>
                          )}
                        </div>
                      )}

                      {/* Non-sent error */}
                      {!otpSent && otpError && (
                        <div className="otp-error">⚠️ {otpError}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      maxLength={13}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Registered Office Address <span className="required">*</span></label>
                    <textarea
                      ref={refs.registeredOfficeAddress}
                      name="registeredOfficeAddress"
                      className="form-control"
                      rows={3}
                      required
                      placeholder="Full registered address as per GST certificate"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State / Union Territory <span className="required">*</span></label>
                    <select ref={refs.stateUnionTerritory} name="stateUnionTerritory" className="form-select" required>
                      <option value="">Select State / UT</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal / PIN Code <span className="required">*</span></label>
                    <input
                      ref={refs.postalCode}
                      type="text"
                      name="postalCode"
                      className="form-control"
                      required
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* ── SECTION 4: TAX & REGULATORY ── */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">💳</div>
                <div>
                  <div className="section-title">Tax &amp; Regulatory Details</div>
                  <div className="section-title-desc">Do you have a PAN Card?</div>
                </div>
              </div>
              <div className="section-body">
                <div className="form-group mb-2">
                  <label className="form-label">Do you have a PAN Card? <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="hasPanCard" value="yes" checked={hasPanCard === 'yes'} onChange={() => setHasPanCard('yes')} />
                      Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="hasPanCard" value="no" checked={hasPanCard === 'no'} onChange={() => setHasPanCard('no')} />
                      No
                    </label>
                  </div>
                </div>

                {hasPanCard === 'yes' && (
                  <div className="row" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
                    <div className="form-group full-width">
                      <label className="form-label">
                        PAN Card <span className="required">*</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--aima-gold-dark)', fontWeight: 400 }}>
                          ⚡ Smart AI Scan
                        </span>
                      </label>
                      <SmartUploadZone
                        name="panCard"
                        docType="pan"
                        label="Drop PAN Card here (Image / PDF / DOCX)"
                        required={hasPanCard === 'yes'}
                        onScanComplete={handlePANScan}
                        onScanStatus={setPanScanState}
                      />
                      {panScanState === 'idle' && (
                        <div className="info-tip">
                          💡 Upload your PAN card to auto-fill the PAN number
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">PAN Number <span className="required">*</span></label>
                      <input
                        ref={refs.panNumber}
                        type="text"
                        name="panNumber"
                        className="form-control"
                        required={hasPanCard === 'yes'}
                        placeholder="e.g. AABCT1332L"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                )}

                <div className="row" style={{ marginTop: hasPanCard === 'no' ? '1.5rem' : '0' }}>
                  <div className="form-group">
                    <label className="form-label">MSME Registered? <span className="required">*</span></label>
                    <select
                      name="msmeRegistered"
                      className="form-select"
                      value={msmeRegistered}
                      onChange={(e) => setMsmeRegistered(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">RCM Applicable?</label>
                    <select name="rcmApplicable" className="form-select">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: MSME DETAILS (conditional) ── */}
            {msmeRegistered === 'Yes' && (
              <>
                <div className="divider" />
                <div className="form-section animate-slide-down">
                  <div className="section-header">
                    <div className="section-icon">🏭</div>
                    <div>
                      <div className="section-title">MSME / Udyam Details</div>
                      <div className="section-title-desc">Micro, Small &amp; Medium Enterprise registration details</div>
                    </div>
                  </div>
                  <div className="section-body">
                    <div className="row">
                      <div className="form-group">
                        <label className="form-label">Udyam / MSME Registration Number <span className="required">*</span></label>
                        <input
                          ref={refs.msmeNumber}
                          type="text"
                          name="msmeNumber"
                          className="form-control"
                          required
                          placeholder="UDYAM-XX-00-0000000"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Enterprise Name <span className="required">*</span></label>
                        <input
                          ref={refs.enterpriseName}
                          type="text"
                          name="enterpriseName"
                          className="form-control"
                          required
                          placeholder="As per Udyam certificate"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Udyam Registration Date <span className="required">*</span></label>
                        <input ref={refs.udyamDate} type="date" name="udyamDate" className="form-control" required />
                      </div>

                      <div className="form-group">
                        <label className="form-label">MSME Category <span className="required">*</span></label>
                        <select ref={refs.msmeCategory} name="msmeCategory" className="form-select" required>
                          <option value="">Select Category</option>
                          <option>Micro</option>
                          <option>Small</option>
                          <option>Medium</option>
                        </select>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">
                          Upload MSME / Udyam Certificate <span className="required">*</span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--aima-gold-dark)', fontWeight: 400 }}>
                            ⚡ Smart AI Scan
                          </span>
                        </label>
                        <SmartUploadZone
                          name="msmeFile"
                          docType="msme"
                          label="Drop MSME Certificate here (Image / PDF / DOCX)"
                          required
                          onScanComplete={handleMSMEScan}
                          onScanStatus={setMsmeScanState}
                        />
                        {msmeScanState === 'idle' && (
                          <div className="info-tip">
                            💡 Upload your MSME certificate to auto-fill the details above
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="divider" />

            {/* ── SECTION 6: DOCUMENT UPLOADS ── */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📁</div>
                <div>
                  <div className="section-title">Supporting Documents</div>
                  <div className="section-title-desc">Upload additional required documents</div>
                </div>
              </div>
              <div className="section-body">
                <div className="row">
                  <div className="form-group">
                    <label className="form-label">Certificate of Incorporation</label>
                    <UploadZone
                      name="certificateOfIncorporation"
                      label="Drop COI / MOA / Partnership Deed here"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cancelled Cheque <span className="required">*</span></label>
                    <UploadZone
                      name="cancelledCheque"
                      label="Drop Cancelled Cheque / Bank Statement here"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* ── FOOTER / SUBMIT ── */}
            <div className="form-footer">
              <div className="important-notes" style={{ maxWidth: '680px' }}>
                <div className="important-notes-title">
                  <span>📌</span> Important Notes
                </div>
                <ol>
                  <li>
                    <span className="note-num">1</span>
                    <span>
                      If <strong>PAN is not provided</strong>, TDS @20% will be deducted wherever applicable.
                    </span>
                  </li>
                  <li>
                    <span className="note-num">2</span>
                    <span>
                      If <strong>GST Registration Number is not provided</strong>, then the taxes under RCM will not be paid wherever applicable.
                    </span>
                  </li>
                  <li>
                    <span className="note-num">3</span>
                    <span>
                      If the relevant documents for <strong>Micro / Small / SSI status</strong> under the MSMED Act, 2006 are not provided, then we will <strong>NOT</strong> consider you as a Micro / Small / Medium Enterprise.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="declaration-box" style={{ width: '100%', maxWidth: '680px' }}>
                <input type="checkbox" id="declare" required />
                <label htmlFor="declare" className="declaration-text">
                  I hereby declare that all information and documents submitted in this registration form are true,
                  accurate, and complete to the best of my knowledge. I understand that any misrepresentation may
                  result in rejection or termination of vendor registration with AIMA.
                </label>
              </div>

              {!emailVerified && (
                <div style={{ fontSize: '0.8rem', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⚠️ Please verify your email address before submitting.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '240px', fontSize: '1rem' }}
                disabled={isSubmitting}
                id="submit-registration-btn"
                onClick={() => setHasAttemptedSubmit(true)}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  '✉️ Submit Registration'
                )}
              </button>

              <div className="form-footer-note">
                🔒 Your data is encrypted and stored securely. AIMA will review your application within 5–7 business days.
              </div>
            </div>

          </div>
        </form>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="aima-footer">
        <p className="aima-footer-text">
          © {new Date().getFullYear()} <span>All India Management Association (AIMA)</span> · Management House, 14, Institutional Area,
          Lodhi Road, New Delhi – 110 003
        </p>
      </footer>

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-icon">🎉</div>
            <h2>Registration Successful!</h2>
            <p>Your application has been submitted successfully. Our team will review your details and get back to you within 5-7 business days.</p>
            <button className="btn-primary" onClick={() => window.location.reload()} style={{ width: '100%' }}>
              Close &amp; Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
