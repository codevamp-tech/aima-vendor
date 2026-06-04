import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    // Find the latest valid OTP for this email
    const [rows] = await pool.query(
      `SELECT id FROM email_otps
       WHERE email = ?
         AND otp = ?
         AND used = 0
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, String(otp).trim()]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { verified: false, error: 'Invalid or expired OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await pool.query('UPDATE email_otps SET used = 1 WHERE id = ?', [rows[0].id]);

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
