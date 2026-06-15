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
    const saveFile = async (fileKey: string): Promise<string> => {
      const file = formData.get(fileKey) as File;
      if (!file || file.size === 0) return '';
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.pdf';
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
      
      await writeFile(filePath, buffer);
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/account';
      return `${basePath}/uploads/${uniqueName}`; // Return relative path for web access
    };

    // Save files
    const gstCertificatePath = await saveFile('gstCertificate');
    const panCardPath = await saveFile('panCard');
    const msmeFilePath = await saveFile('msmeFile');
    const coiFilePath = await saveFile('certificateOfIncorporation');
    const cancelledChequePath = await saveFile('cancelledCheque');

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

    // Send notification email to admin (fire-and-forget — don't block response)
    sendAdminNotificationEmail({
      legalBusinessName,
      tradeName,
      primaryContactName,
      emailAddress,
      phoneNumber,
      businessType,
      industryCategory,
      state: stateUnionTerritory,
      panNumber,
      gstin,
    }).catch(err => console.error('Admin notification email error:', err));

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process registration' }, { status: 500 });
  }
}
