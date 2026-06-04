import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ── Auth check ──────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse query params ───────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const page      = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
  const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const offset    = (page - 1) * limit;

  const company   = (searchParams.get('company')   || '').trim();
  const pan       = (searchParams.get('pan')        || '').trim();
  const gstin     = (searchParams.get('gstin')      || '').trim();
  const dateFrom  = (searchParams.get('date_from')  || '').trim();
  const dateTo    = (searchParams.get('date_to')    || '').trim();

  // ── Build dynamic WHERE clause ───────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (company) {
    conditions.push('legal_business_name LIKE ?');
    params.push(`%${company}%`);
  }
  if (pan) {
    conditions.push('pan_number LIKE ?');
    params.push(`%${pan}%`);
  }
  if (gstin) {
    conditions.push('gstin LIKE ?');
    params.push(`%${gstin}%`);
  }
  if (dateFrom) {
    conditions.push('DATE(created_at) >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('DATE(created_at) <= ?');
    params.push(dateTo);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  try {
    // Count query (for pagination metadata)
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM vendors ${whereClause}`,
      params
    ) as any[];
    const total: number = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Data query (paginated)
    const [vendors] = await pool.query(
      `SELECT id, legal_business_name, gstin, pan_number, email_address,
              phone_number, state, created_at
       FROM vendors
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ) as any[];

    return NextResponse.json({
      vendors,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Vendors API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
