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
