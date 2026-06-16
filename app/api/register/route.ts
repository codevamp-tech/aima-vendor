import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sendSubmissionConfirmationEmail, sendAdminNotificationEmail } from '@/lib/mailer';

// App Router handles formData / body parsing automatically — no config needed

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Process text fields
    const gstin = formData.get('gstin') as string || '';
    const legalBusinessName = formData.get('legalBusinessName') as string || '';
    const tradeName = formData.get('tradeName') as string || '';
    const businessType = formData.get('businessType') as string || '';
    const industryCategory = formData.get('industryCategory') as string || '';
    const companyRegistrationNumber = formData.get('companyRegistrationNumber') as string || '';
    const dateOfIncorporation = formData.get('dateOfIncorporation') as string || null;
    const companyWebsite = formData.get('companyWebsite') as string || '';
    const primaryContactName = formData.get('primaryContactName') as string || '';
    const designation = formData.get('designation') as string || '';
    const emailAddress = formData.get('emailAddress') as string || '';
    const phoneNumber = formData.get('phoneNumber') as string || '';
    const registeredOfficeAddress = formData.get('registeredOfficeAddress') as string || '';
    const stateUnionTerritory = formData.get('stateUnionTerritory') as string || '';
    const postalCode = formData.get('postalCode') as string || '';
    const panNumber = formData.get('panNumber') as string || '';
    const msmeRegistered = formData.get('msmeRegistered') as string || 'No';
    const rcmApplicable = formData.get('rcmApplicable') as string || 'No';
    
    // MSME specific fields
    const msmeNumber = formData.get('msmeNumber') as string || '';
    const enterpriseName = formData.get('enterpriseName') as string || '';
    const udyamDate = formData.get('udyamDate') as string || null;
    const msmeCategory = formData.get('msmeCategory') as string || '';

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating upload dir', err);
    }

    // Process files helper function
    const saveFile = async (fileKey: string, displayName: string): Promise<string> => {
      const file = formData.get(fileKey) as File;
      if (!file || file.size === 0) return '';
      
      // Limit file size to 1MB (1,048,576 bytes)
      if (file.size > 1024 * 1024) {
        throw new Error(`File size of ${displayName} exceeds the 1MB limit.`);
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.pdf';
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
      
      await writeFile(filePath, buffer);
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/account';
      return `${basePath}/uploads/${uniqueName}`; // Return relative path for web access
    };

    // Save files
    const gstCertificatePath = await saveFile('gstCertificate', 'GST Certificate');
    const panCardPath = await saveFile('panCard', 'PAN Card');
    const msmeFilePath = await saveFile('msmeFile', 'MSME Certificate');
    const coiFilePath = await saveFile('certificateOfIncorporation', 'Certificate of Incorporation');
    const cancelledChequePath = await saveFile('cancelledCheque', 'Cancelled Cheque');

    // Insert into DB
    const query = `
      INSERT INTO vendors (
        gstin, legal_business_name, trade_name, business_type, industry_category, 
        company_registration_number, date_of_incorporation, company_website, 
        primary_contact_name, designation, email_address, phone_number, 
        registered_office_address, state, postal_code, pan_number, 
        msme_registered, rcm_applicable, msme_number, enterprise_name, 
        udyam_date, msme_category, gst_certificate_path, pan_card_path, 
        msme_file_path, coi_file_path, cancelled_cheque_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ensure empty strings for dates are null to avoid MySQL errors
    const safeDate = (d: string | null) => d === '' ? null : d;

    const values = [
      gstin, legalBusinessName, tradeName, businessType, industryCategory,
      companyRegistrationNumber, safeDate(dateOfIncorporation), companyWebsite,
      primaryContactName, designation, emailAddress, phoneNumber,
      registeredOfficeAddress, stateUnionTerritory, postalCode, panNumber,
      msmeRegistered, rcmApplicable, msmeNumber, enterpriseName,
      safeDate(udyamDate), msmeCategory, gstCertificatePath, panCardPath,
      msmeFilePath, coiFilePath, cancelledChequePath
    ];

    const [result] = await pool.execute(query, values);

    // Send confirmation email to vendor (fire-and-forget — don't block response)
    sendSubmissionConfirmationEmail(
      emailAddress,
      primaryContactName || legalBusinessName,
      legalBusinessName,
    ).catch(err => console.error('Confirmation email error:', err));

    // Construct absolute URLs for documents to place in the admin email
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const gstCertificateUrl = gstCertificatePath ? `${baseUrl}${gstCertificatePath}` : '';
    const panCardUrl = panCardPath ? `${baseUrl}${panCardPath}` : '';
    const msmeFileUrl = msmeFilePath ? `${baseUrl}${msmeFilePath}` : '';
    const coiFileUrl = coiFilePath ? `${baseUrl}${coiFilePath}` : '';
    const cancelledChequeUrl = cancelledChequePath ? `${baseUrl}${cancelledChequePath}` : '';

    // Send notification email to admin (fire-and-forget — don't block response)
    sendAdminNotificationEmail({
      gstin,
      legalBusinessName,
      tradeName,
      businessType,
      industryCategory,
      companyRegistrationNumber,
      dateOfIncorporation: safeDate(dateOfIncorporation),
      companyWebsite,
      primaryContactName,
      designation,
      emailAddress,
      phoneNumber,
      registeredOfficeAddress,
      state: stateUnionTerritory,
      postalCode,
      panNumber,
      msmeRegistered,
      rcmApplicable,
      msmeNumber,
      enterpriseName,
      udyamDate: safeDate(udyamDate),
      msmeCategory,
      gstCertificateUrl,
      panCardUrl,
      msmeFileUrl,
      coiFileUrl,
      cancelledChequeUrl,
    }).catch(err => console.error('Admin notification email error:', err));

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error: any) {
    console.error('Registration error:', error);
    const message = error?.message || 'Failed to process registration';
    if (message.includes('exceeds the 1MB limit')) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to process registration' }, { status: 500 });
  }
}
