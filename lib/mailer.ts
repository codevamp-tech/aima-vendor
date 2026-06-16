import nodemailer from 'nodemailer';

// Create transporter lazily inside the function so it always reads
// fresh environment variables — avoids caching stale credentials
// from a previous module initialization.
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.falconide.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"AIMA Vendor Portal" <vendor@aima.in>';

  await transporter.sendMail({
    from,
    to,
    subject: `Your AIMA Vendor Portal OTP — ${otp}`,
    text: `Your OTP for AIMA Vendor Portal email verification is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.\n\n— AIMA Vendor Management Team`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,51,102,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#002244,#003366,#004a8f);padding:28px 32px;text-align:center;">
            <div style="font-size:1.1rem;color:#ffffff;font-weight:700;letter-spacing:0.04em;">
              AIMA Vendor Portal
            </div>
            <div style="font-size:0.75rem;color:rgba(200,169,81,0.9);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">
              Email Verification
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:0.95rem;color:#5a6a7a;">
              Use the OTP below to verify your email address.
            </p>
            <p style="margin:0 0 28px;font-size:0.85rem;color:#8a9bac;">
              This code expires in <strong>10 minutes</strong>.
            </p>

            <!-- OTP box -->
            <div style="display:inline-block;background:#f0f4f8;border:2px solid #003366;border-radius:12px;padding:20px 40px;margin-bottom:28px;">
              <div style="font-size:2.4rem;font-weight:900;letter-spacing:0.3em;color:#003366;font-family:monospace;">
                ${otp}
              </div>
            </div>

            <p style="margin:0;font-size:0.8rem;color:#8a9bac;">
              Do not share this OTP with anyone.<br>
              If you did not request this, please ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e8edf3;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:0.75rem;color:#8a9bac;">
              © 2024 All India Management Association (AIMA) · Management House, New Delhi
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendSubmissionConfirmationEmail(
  to: string,
  vendorName: string,
  companyName: string,
): Promise<void> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"AIMA Vendor Portal" <vendor@aima.in>';

  const subject = 'Your Vendor Registration Has Been Received — AIMA';
  const text = [
    'Dear ' + vendorName + ',',
    '',
    'Thank you for registering with the AIMA Vendor Portal.',
    'Your registration for "' + companyName + '" has been successfully submitted.',
    '',
    'For queries: vendor@aima.in',
    '',
    '— AIMA Vendor Management Team',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,51,102,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#002244,#003366,#004a8f);padding:32px;text-align:center;">
            <div style="font-size:1.2rem;color:#ffffff;font-weight:700;">AIMA Vendor Portal</div>
            <div style="font-size:0.75rem;color:rgba(200,169,81,0.9);text-transform:uppercase;margin-top:4px;">All India Management Association</div>
          </td>
        </tr>
        <tr>
          <td style="background:#059669;padding:16px 32px;text-align:center;">
            <div style="color:#fff;font-size:1rem;font-weight:700;">&#10003; Registration Submitted Successfully</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <p style="margin:0 0 16px;font-size:1rem;color:#1a2332;font-weight:600;">Dear ${vendorName},</p>
            <p style="margin:0 0 16px;font-size:0.92rem;color:#5a6a7a;line-height:1.6;">
              Thank you for registering with the <strong style="color:#003366;">AIMA Vendor Portal</strong>.
              Your application for <strong style="color:#003366;">${companyName}</strong> has been successfully
              submitted.
            </p>
            <p style="margin:0;font-size:0.85rem;color:#8a9bac;">
              For queries: <a href="mailto:vendor@aima.in" style="color:#003366;font-weight:600;">vendor@aima.in</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e8edf3;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:0.75rem;color:#8a9bac;">
              &copy; 2024 All India Management Association (AIMA) &middot; Management House, New Delhi
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({ from, to, subject, text, html });
}

export async function sendAdminNotificationEmail(
  vendorDetails: {
    gstin?: string;
    legalBusinessName: string;
    tradeName?: string;
    businessType: string;
    industryCategory: string;
    companyRegistrationNumber?: string;
    dateOfIncorporation?: string | null;
    companyWebsite?: string;
    primaryContactName: string;
    designation: string;
    emailAddress: string;
    phoneNumber: string;
    registeredOfficeAddress: string;
    state: string;
    postalCode: string;
    panNumber?: string;
    msmeRegistered: string;
    rcmApplicable?: string;
    msmeNumber?: string;
    enterpriseName?: string;
    udyamDate?: string | null;
    msmeCategory?: string;
    gstCertificateUrl?: string;
    panCardUrl?: string;
    msmeFileUrl?: string;
    coiFileUrl?: string;
    cancelledChequeUrl?: string;
  }
): Promise<void> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"AIMA Vendor Portal" <vendor@aima.in>';

  const to = 'vendor@aima.in';
  const bcc = 'psingh@aima.in';
  const subject = `New Vendor Registered — ${vendorDetails.legalBusinessName}`;

  // Helper to safely display null or undefined fields
  const showVal = (val?: string | null) => val && val.trim() !== '' ? val : 'N/A';

  const text = [
    'Dear Admin,',
    '',
    'A new vendor has successfully registered on the AIMA Vendor Portal.',
    '',
    '--- BUSINESS DETAILS ---',
    `- Legal Business Name: ${vendorDetails.legalBusinessName}`,
    `- Trade Name: ${showVal(vendorDetails.tradeName)}`,
    `- Business Type: ${vendorDetails.businessType}`,
    `- Industry Category: ${vendorDetails.industryCategory}`,
    `- Company Registration Number: ${showVal(vendorDetails.companyRegistrationNumber)}`,
    `- Date of Incorporation: ${showVal(vendorDetails.dateOfIncorporation)}`,
    `- Company Website: ${showVal(vendorDetails.companyWebsite)}`,
    '',
    '--- CONTACT INFORMATION ---',
    `- Primary Contact Name: ${vendorDetails.primaryContactName}`,
    `- Designation: ${vendorDetails.designation}`,
    `- Email Address: ${vendorDetails.emailAddress}`,
    `- Phone Number: ${vendorDetails.phoneNumber}`,
    `- Registered Office Address: ${vendorDetails.registeredOfficeAddress}`,
    `- State: ${vendorDetails.state}`,
    `- Postal/PIN Code: ${vendorDetails.postalCode}`,
    '',
    '--- TAX & REGULATORY DETAILS ---',
    `- GSTIN: ${showVal(vendorDetails.gstin)}`,
    `- PAN Number: ${showVal(vendorDetails.panNumber)}`,
    `- MSME Registered: ${vendorDetails.msmeRegistered}`,
    `- RCM Applicable: ${showVal(vendorDetails.rcmApplicable)}`,
    '',
    ...(vendorDetails.msmeRegistered === 'Yes' ? [
      '--- MSME / UDYAM DETAILS ---',
      `- MSME Number: ${showVal(vendorDetails.msmeNumber)}`,
      `- Enterprise Name: ${showVal(vendorDetails.enterpriseName)}`,
      `- Udyam Registration Date: ${showVal(vendorDetails.udyamDate)}`,
      `- MSME Category: ${showVal(vendorDetails.msmeCategory)}`,
      ''
    ] : []),
    '--- UPLOADED DOCUMENTS ---',
    `- GST Certificate: ${showVal(vendorDetails.gstCertificateUrl)}`,
    `- PAN Card: ${showVal(vendorDetails.panCardUrl)}`,
    `- MSME Certificate: ${showVal(vendorDetails.msmeFileUrl)}`,
    `- Certificate of Incorporation: ${showVal(vendorDetails.coiFileUrl)}`,
    `- Cancelled Cheque: ${showVal(vendorDetails.cancelledChequeUrl)}`,
    '',
    'This is an automated notification.',
    '',
    '— AIMA Vendor Management Team',
  ].join('\n');

  // Helper for rendering table rows
  const renderRow = (label: string, value?: string | null, isLink: boolean = false, bg: boolean = false) => {
    const background = bg ? '#f8fafc' : '#ffffff';
    let valContent = showVal(value);
    
    if (isLink && value && value.trim() !== '' && value !== 'N/A') {
      valContent = `<a href="${value}" target="_blank" style="color:#003366;font-weight:600;text-decoration:underline;">Download / View File</a>`;
    } else if (isLink) {
      valContent = '<span style="color:#8a9bac;font-style:italic;">Not Uploaded</span>';
    }

    return `
      <tr style="background:${background};border-bottom:1px solid #e8edf3;">
        <td width="40%" style="font-weight:600;padding:10px 14px;color:#002244;">${label}</td>
        <td style="padding:10px 14px;color:#1a2332;">${valContent}</td>
      </tr>
    `;
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,51,102,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#002244,#003366,#004a8f);padding:32px;text-align:center;">
            <div style="font-size:1.35rem;color:#ffffff;font-weight:700;letter-spacing:0.03em;">AIMA Vendor Portal</div>
            <div style="font-size:0.75rem;color:rgba(200,169,81,0.9);text-transform:uppercase;margin-top:6px;letter-spacing:0.08em;">All India Management Association</div>
          </td>
        </tr>
        <tr>
          <td style="background:#003366;padding:16px 32px;text-align:center;">
            <div style="color:#fff;font-size:1rem;font-weight:700;">New Vendor Registration Notification</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:0.95rem;color:#5a6a7a;line-height:1.5;">
              A new vendor has successfully registered on the AIMA Vendor Portal. Below are the complete registration details:
            </p>

            <!-- SECTION 1: BUSINESS DETAILS -->
            <div style="margin-bottom:28px;">
              <div style="font-size:1rem;font-weight:700;color:#003366;border-bottom:2px solid #e8edf3;padding-bottom:6px;margin-bottom:12px;">🏢 Business Details</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.9rem;">
                ${renderRow('Legal Business Name', vendorDetails.legalBusinessName, false, true)}
                ${renderRow('Trade Name', vendorDetails.tradeName, false, false)}
                ${renderRow('Business Type', vendorDetails.businessType, false, true)}
                ${renderRow('Industry Category', vendorDetails.industryCategory, false, false)}
                ${renderRow('Company Reg. Number (CIN)', vendorDetails.companyRegistrationNumber, false, true)}
                ${renderRow('Date of Incorporation', vendorDetails.dateOfIncorporation, false, false)}
                ${renderRow('Company Website', vendorDetails.companyWebsite, false, true)}
              </table>
            </div>

            <!-- SECTION 2: CONTACT DETAILS -->
            <div style="margin-bottom:28px;">
              <div style="font-size:1rem;font-weight:700;color:#003366;border-bottom:2px solid #e8edf3;padding-bottom:6px;margin-bottom:12px;">👤 Contact Information</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.9rem;">
                ${renderRow('Primary Contact Name', vendorDetails.primaryContactName, false, true)}
                ${renderRow('Designation', vendorDetails.designation, false, false)}
                ${renderRow('Email Address', vendorDetails.emailAddress, false, true)}
                ${renderRow('Phone Number', vendorDetails.phoneNumber, false, false)}
                ${renderRow('Registered Address', vendorDetails.registeredOfficeAddress, false, true)}
                ${renderRow('State', vendorDetails.state, false, false)}
                ${renderRow('Postal/PIN Code', vendorDetails.postalCode, false, true)}
              </table>
            </div>

            <!-- SECTION 3: TAX & REGULATORY -->
            <div style="margin-bottom:28px;">
              <div style="font-size:1rem;font-weight:700;color:#003366;border-bottom:2px solid #e8edf3;padding-bottom:6px;margin-bottom:12px;">💳 Tax & Regulatory Details</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.9rem;">
                ${renderRow('GSTIN', vendorDetails.gstin, false, true)}
                ${renderRow('PAN Number', vendorDetails.panNumber, false, false)}
                ${renderRow('MSME Registered', vendorDetails.msmeRegistered, false, true)}
                ${renderRow('RCM Applicable', vendorDetails.rcmApplicable, false, false)}
              </table>
            </div>

            <!-- SECTION 4: MSME DETAILS (Conditional) -->
            ${vendorDetails.msmeRegistered === 'Yes' ? `
            <div style="margin-bottom:28px;">
              <div style="font-size:1rem;font-weight:700;color:#003366;border-bottom:2px solid #e8edf3;padding-bottom:6px;margin-bottom:12px;">🏭 MSME / Udyam Details</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.9rem;">
                ${renderRow('MSME Number', vendorDetails.msmeNumber, false, true)}
                ${renderRow('Enterprise Name', vendorDetails.enterpriseName, false, false)}
                ${renderRow('Udyam Registration Date', vendorDetails.udyamDate, false, true)}
                ${renderRow('MSME Category', vendorDetails.msmeCategory, false, false)}
              </table>
            </div>
            ` : ''}

            <!-- SECTION 5: UPLOADED DOCUMENTS -->
            <div style="margin-bottom:12px;">
              <div style="font-size:1rem;font-weight:700;color:#003366;border-bottom:2px solid #e8edf3;padding-bottom:6px;margin-bottom:12px;">📁 Supporting Documents</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.9rem;">
                ${renderRow('GST Certificate', vendorDetails.gstCertificateUrl, true, true)}
                ${renderRow('PAN Card', vendorDetails.panCardUrl, true, false)}
                ${renderRow('MSME Certificate', vendorDetails.msmeFileUrl, true, true)}
                ${renderRow('Certificate of Incorporation (COI)', vendorDetails.coiFileUrl, true, false)}
                ${renderRow('Cancelled Cheque / Statement', vendorDetails.cancelledChequeUrl, true, true)}
              </table>
            </div>

          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e8edf3;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:0.75rem;color:#8a9bac;">
              &copy; 2024 All India Management Association (AIMA) &middot; Management House, New Delhi
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({ from, to, bcc, subject, text, html });
}
