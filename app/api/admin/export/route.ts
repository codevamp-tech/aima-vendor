import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ── Auth check ──────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse filters (same as vendors list) ─────────────────────
  const { searchParams } = new URL(request.url);
  const company  = (searchParams.get('company')   || '').trim();
  const pan      = (searchParams.get('pan')        || '').trim();
  const gstin    = (searchParams.get('gstin')      || '').trim();
  const dateFrom = (searchParams.get('date_from')  || '').trim();
  const dateTo   = (searchParams.get('date_to')    || '').trim();

  // ── Build WHERE clause ────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (company)  { conditions.push('legal_business_name LIKE ?'); params.push(`%${company}%`); }
  if (pan)      { conditions.push('pan_number LIKE ?');          params.push(`%${pan}%`); }
  if (gstin)    { conditions.push('gstin LIKE ?');               params.push(`%${gstin}%`); }
  if (dateFrom) { conditions.push('DATE(created_at) >= ?');      params.push(dateFrom); }
  if (dateTo)   { conditions.push('DATE(created_at) <= ?');      params.push(dateTo); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    // Fetch ALL matching records (no LIMIT)
    const [rows] = await pool.query(
      `SELECT
         id,
         gstin                    AS "GSTIN",
         legal_business_name      AS "Legal Business Name",
         trade_name               AS "Trade Name",
         business_type            AS "Business Type",
         industry_category        AS "Industry Category",
         company_registration_number  AS "Company Reg. No.",
         date_of_incorporation    AS "Date of Incorporation",
         company_website          AS "Website",
         primary_contact_name     AS "Contact Name",
         designation              AS "Designation",
         email_address            AS "Email",
         phone_number             AS "Phone",
         registered_office_address AS "Registered Address",
         state                    AS "State",
         postal_code              AS "Postal Code",
         pan_number               AS "PAN",
         msme_registered          AS "MSME Registered",
         msme_number              AS "MSME Number",
         enterprise_name          AS "Enterprise Name",
         udyam_date               AS "Udyam Date",
         msme_category            AS "MSME Category",
         rcm_applicable           AS "RCM Applicable",
         created_at               AS "Submitted On"
       FROM vendors
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    ) as any[];

    // ── Build Excel workbook ──────────────────────────────────────
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, 20),
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `aima-vendors-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
