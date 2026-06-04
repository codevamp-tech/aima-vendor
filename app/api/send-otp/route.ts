import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // TODO: re-enable before production
    // Rate limit: max 3 OTPs in last 10 minutes per email
    // const [recentRows] = await pool.query(
    //   `SELECT COUNT(*) as cnt FROM email_otps
    //    WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
    //   [email]
    // ) as any[];
    // if (recentRows[0].cnt >= 3) {
    //   return NextResponse.json(
    //     { error: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
    //     { status: 429 }
    //   );
    // }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store in DB with 10-minute expiry
    await pool.query(
      `INSERT INTO email_otps (email, otp, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [email, otp]
    );

    // DEBUG — remove after confirming env vars are correct
    const pass = process.env.SMTP_PASS || '';
    console.log('[SMTP DEBUG] user:', process.env.SMTP_USER, '| pass preview:', pass.slice(0, 5) + '*'.repeat(Math.max(0, pass.length - 5)), '| length:', pass.length);

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
