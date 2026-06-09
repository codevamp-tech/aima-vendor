import { NextResponse } from 'next/server';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Confirmed available on this API key via ListModels (v1beta & v1)
// Using gemini-1.5-flash — multimodal, 1M ctx, best for OCR
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL    = 'gemini-2.5-flash';


const IMAGE_EXTS  = /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i;
const PDF_EXT     = /\.pdf$/i;
const DOCX_EXT    = /\.docx?$/i;

const IMAGE_MIMES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/bmp', 'image/tiff',
]);
const PDF_MIME  = 'application/pdf';
const DOCX_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

// ─── Prompts ─────────────────────────────────────────────────────────────────

const GST_PROMPT = `You are an OCR expert for Indian GST Certificates.
Extract the following fields and return ONLY a valid JSON object (no markdown, no backticks):
{
  "gstin": "15-char GSTIN e.g. 27AABCT1332L1ZG",
  "legalBusinessName": "Legal name as registered under GST",
  "tradeName": "Trade name if different, else empty string",
  "registeredAddress": "Full registered address as a single string",
  "state": "Full state name e.g. Maharashtra, Delhi",
  "postalCode": "6-digit PIN code",
  "businessType": "One of: Proprietorship, Partnership, Private Limited, LLP, Public Limited, Other",
  "dateOfRegistration": "YYYY-MM-DD if visible, else empty string"
}`;

const PAN_PROMPT = `You are an OCR expert for Indian PAN Cards.
Extract the following fields and return ONLY a valid JSON object (no markdown, no backticks):
{
  "panNumber": "10-char PAN e.g. AABCT1332L",
  "panHolderName": "Name exactly as on PAN card",
  "panHolderDOB": "Date of birth YYYY-MM-DD if visible, else empty string"
}`;

const MSME_PROMPT = `You are an OCR expert for Indian MSME / Udyam Registration Certificates.
Extract the following fields and return ONLY a valid JSON object (no markdown, no backticks):
{
  "msmeNumber": "Udyam Registration Number e.g. UDYAM-XX-00-0000000",
  "enterpriseName": "Name of Enterprise exactly as on certificate",
  "udyamDate": "Date of Udyam Registration YYYY-MM-DD if visible, else empty string",
  "msmeCategory": "One of: Micro, Small, Medium"
}`;

// ─── Gemini REST helper ───────────────────────────────────────────────────────

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(parts: GeminiPart[], retries = 3): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,  // low temperature for factual extraction
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      if (res.status === 503 && attempt < retries) {
        console.warn(`Gemini 503 High Demand (attempt ${attempt}/${retries}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) {
      if (attempt < retries) {
        console.warn(`Gemini returned empty response (attempt ${attempt}/${retries}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      throw new Error('Gemini returned empty response');
    }
    return text;
  }
  
  throw new Error('Gemini API failed after retries');
}

function parseJSON(raw: string): Record<string, string> {
  try {
    // Find the first '{' and last '}'
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object found in response");
    }
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse JSON. Raw output:", raw);
    throw err;
  }
}

// ─── Extractors ──────────────────────────────────────────────────────────────

async function extractFromImage(
  buffer: Buffer,
  mimeType: string,
  docType: 'gst' | 'pan' | 'msme'
): Promise<Record<string, string>> {
  const prompt = docType === 'gst' ? GST_PROMPT : docType === 'pan' ? PAN_PROMPT : MSME_PROMPT;
  const text = await callGemini([
    { text: prompt },
    { inlineData: { mimeType, data: buffer.toString('base64') } },
  ]);
  return parseJSON(text);
}

async function extractFromPDF(
  buffer: Buffer,
  docType: 'gst' | 'pan' | 'msme'
): Promise<Record<string, string>> {
  const prompt = docType === 'gst' ? GST_PROMPT : docType === 'pan' ? PAN_PROMPT : MSME_PROMPT;
  // Gemini 1.5 Flash supports PDF via inlineData
  const text = await callGemini([
    { text: prompt },
    { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
  ]);
  return parseJSON(text);
}

async function extractFromDOCX(
  buffer: Buffer,
  docType: 'gst' | 'pan' | 'msme'
): Promise<Record<string, string>> {
  const mammoth = await import('mammoth');
  const { value: docText } = await mammoth.extractRawText({ buffer });

  const prompt = docType === 'gst' ? GST_PROMPT : docType === 'pan' ? PAN_PROMPT : MSME_PROMPT;
  const text = await callGemini([
    { text: `${prompt}\n\nDocument text:\n${docText.substring(0, 8000)}` },
  ]);
  return parseJSON(text);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    const docType  = ((formData.get('docType') as string) || 'gst') as 'gst' | 'pan' | 'msme';

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 20 MB limit' },
        { status: 413 }
      );
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const mime     = (file.type || '').toLowerCase();
    const name     = (file.name || '').toLowerCase();

    let extracted: Record<string, string>;

    if (IMAGE_MIMES.has(mime) || IMAGE_EXTS.test(name)) {
      const resolvedMime = IMAGE_MIMES.has(mime) ? mime : 'image/jpeg';
      extracted = await extractFromImage(buffer, resolvedMime, docType);

    } else if (mime === PDF_MIME || PDF_EXT.test(name)) {
      extracted = await extractFromPDF(buffer, docType);

    } else if (DOCX_MIMES.has(mime) || DOCX_EXT.test(name)) {
      extracted = await extractFromDOCX(buffer, docType);

    } else {
      // Unknown type — try as image (Gemini is flexible)
      try {
        extracted = await extractFromImage(buffer, 'image/jpeg', docType);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Unsupported file type. Please upload JPG, PNG, PDF, or DOCX.' },
          { status: 415 }
        );
      }
    }

    return NextResponse.json({ success: true, data: extracted });

  } catch (err: any) {
    const msg: string = err?.message || String(err);
    console.error('Document scan error:', msg);

    if (msg.includes('GEMINI_API_KEY not configured')) {
      return NextResponse.json(
        { success: false, error: 'AI scanning not configured. Add GEMINI_API_KEY to .env.local.' },
        { status: 503 }
      );
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Could not parse document. Please fill in details manually.' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Document scanning failed. Please fill in details manually.' },
      { status: 500 }
    );
  }
}
