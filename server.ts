import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  initialCategories,
  initialOfficers,
  initialComplaints,
  initialComplaintHistory,
  initialPortalContent,
  initialDevelopmentWorks,
  initialGramSabha,
  initialGallery,
  initialSettings,
  initialAuditLogs
} from './server/initialData.ts';
import {
  Complaint,
  ComplaintHistoryEntry,
  PortalContent,
  DevelopmentWork,
  GramSabhaEntry,
  GalleryItem,
  PortalSettings,
  Category,
  Officer,
  AdminAuditLog,
  formatDriveImageUrl
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// In-Memory Database with local file backup for 9 Google Sheets tabs
interface DBState {
  portalContent: PortalContent[];
  developmentWorks: DevelopmentWork[];
  gramSabha: GramSabhaEntry[];
  gallery: GalleryItem[];
  categories: Category[];
  officers: Officer[];
  complaints: Complaint[];
  history: ComplaintHistoryEntry[];
  settings: PortalSettings;
  auditLogs: AdminAuditLog[];
  googleSheetsScriptUrl: string;
  googleSpreadsheetId?: string;
  lastSheetsSync?: string;
  lastSyncError?: string;
  nextComplaintSeq: number;
}

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portal_db.json');

function loadDB(): DBState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        portalContent: parsed.portalContent || parsed.content || initialPortalContent,
        developmentWorks: parsed.developmentWorks || initialDevelopmentWorks,
        gramSabha: parsed.gramSabha || initialGramSabha,
        gallery: parsed.gallery || initialGallery,
        categories: parsed.categories || initialCategories,
        officers: parsed.officers || initialOfficers,
        complaints: parsed.complaints || initialComplaints,
        history: parsed.history || initialComplaintHistory,
        settings: parsed.settings || initialSettings,
        auditLogs: parsed.auditLogs || initialAuditLogs,
        googleSheetsScriptUrl: parsed.googleSheetsScriptUrl || process.env.GOOGLE_SHEETS_SCRIPT_URL || '',
        googleSpreadsheetId: parsed.googleSpreadsheetId || process.env.GOOGLE_SPREADSHEET_ID || '',
        lastSheetsSync: parsed.lastSheetsSync,
        lastSyncError: parsed.lastSyncError,
        nextComplaintSeq: parsed.nextComplaintSeq || 104
      };
    }
  } catch (err) {
    console.warn('Could not read existing portal_db.json, loading defaults:', err);
  }

  return {
    portalContent: [...initialPortalContent],
    developmentWorks: [...initialDevelopmentWorks],
    gramSabha: [...initialGramSabha],
    gallery: [...initialGallery],
    categories: [...initialCategories],
    officers: [...initialOfficers],
    complaints: [...initialComplaints],
    history: [...initialComplaintHistory],
    settings: { ...initialSettings },
    auditLogs: [...initialAuditLogs],
    googleSheetsScriptUrl: process.env.GOOGLE_SHEETS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwuyPeiwJWEZwXufSFM2QY1BE8s5Bbox3EkBLkFXnWmHrYIlSP_2_vgBCJ1Np6irbOi/exec',
    googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    nextComplaintSeq: 104
  };
}

let db = loadDB();

function saveDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write portal_db.json:', err);
  }
}

// In-memory OTP storage
interface OtpRecord {
  mobile: string;
  name: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}
const otpStore = new Map<string, OtpRecord>();

// Session tokens
interface SessionUser {
  userId: string;
  displayName: string;
  mobile: string;
  role: 'citizen' | 'admin' | 'editor';
}
const sessionStore = new Map<string, { user: SessionUser; expiresAt: number }>();

// Idempotency cache for complaints
const idempotencyKeys = new Set<string>();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper: Mask phone number (e.g. 9876543210 -> 98******10)
function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 6) return '******';
  return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`;
}

// Middleware: Authenticate User or Admin
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const session = sessionStore.get(token);
  if (session && session.expiresAt > Date.now()) {
    (req as any).user = session.user;
  }
  next();
}

app.use(authenticate);

function requireCitizen(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as SessionUser | undefined;
  if (!user) {
    return res.status(401).json({ error: 'कृपया शिकायत दर्ज करने या देखने के लिए मोबाइल OTP से लॉगिन करें।' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as SessionUser | undefined;
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return res.status(403).json({ error: 'इस कार्रवाई के लिए केवल अधिकृत एडमिन की अनुमति है।' });
  }
  next();
}

// -------------------------------------------------------------
// GOOGLE SHEETS LIVE SYNC ENGINE
// -------------------------------------------------------------

async function syncFromGoogleSheets(): Promise<{ success: boolean; message: string; count?: any }> {
  if (!db.googleSheetsScriptUrl) {
    return { success: false, message: 'Google Sheets Apps Script URL कॉन्फ़िगर नहीं है।' };
  }

  try {
    // URL normalize
    let base = db.googleSheetsScriptUrl.trim();
    const queryChar = base.includes('?') ? '&' : '?';
    let fetchUrl = `${base}${queryChar}sheet=all`;
    if (db.googleSpreadsheetId) {
      fetchUrl += `&spreadsheet_id=${encodeURIComponent(db.googleSpreadsheetId)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response: any;
    try {
      response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errHttp = `Google Sheets HTTP Error (${response.status}: ${response.statusText})`;
      db.lastSyncError = errHttp;
      return { success: false, message: errHttp };
    }

    const text = await response.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      // Handle HTML or non-JSON responses gracefully
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        const isAuthError = text.includes('accounts.google.com') || text.includes('Sign in') || text.includes('ServiceLogin');
        const helpfulMsg = isAuthError
          ? 'Google Apps Script प्रमाणीकरण त्रुटि: कृपया Google Apps Script को Deploy > Manage deployments में "Who has access: Anyone" (कोई भी) सेट करें।'
          : 'Google Sheets Apps Script ने HTML पेज लौटाया (Web App URL मान्य नहीं है या अनुमति नहीं है)।';
        db.lastSyncError = helpfulMsg;
        return { success: false, message: helpfulMsg };
      }
      const errParse = `Google Sheets से अमान्य प्रतिक्रिया मिली: ${text.slice(0, 120)}`;
      db.lastSyncError = errParse;
      return { success: false, message: errParse };
    }

    // Validate result data
    const hasAnyTab = Boolean(
      result && typeof result === 'object' && (
        result.data ||
        result.PortalContent !== undefined ||
        result.DevelopmentWorks !== undefined ||
        result.GramSabha !== undefined ||
        result.Gallery !== undefined ||
        result.Categories !== undefined ||
        result.Officers !== undefined ||
        result.Complaints !== undefined ||
        result.ComplaintHistory !== undefined ||
        result.Settings !== undefined
      )
    );

    if (!result || result.status === 'error' || result.success === false || !hasAnyTab) {
      const rawMsg = result?.message || result?.error || result?.details || 'अमान्य Google Sheets प्रतिक्रिया';
      let helpfulMsg = rawMsg;
      if (rawMsg.includes('getSheetByName') || rawMsg.includes('null') || result?.error_code === 'SPREADSHEET_NOT_FOUND') {
        helpfulMsg = 'Google Spreadsheet लिंक नहीं मिली (SpreadsheetApp.getActiveSpreadsheet() null है)। कृपया Google Sheet खोलकर "Extensions > Apps Script" में स्क्रिप्ट कोड डालें, अथवा Admin Dashboard में "Google Spreadsheet ID" दर्ज करें।';
      }
      db.lastSyncError = helpfulMsg;
      return { success: false, message: helpfulMsg };
    }

    const data = result.data || result;
    const nowIso = new Date().toISOString();

    // 1. PortalContent
    if (Array.isArray(data.PortalContent) && data.PortalContent.length > 0) {
      db.portalContent = data.PortalContent.map((row: any) => ({
        content_id: String(row.content_id || `CNT-${Math.random().toString(36).substring(2, 7)}`),
        content_type: row.content_type || 'पंचायत की खबर',
        title: String(row.title || ''),
        description: String(row.description || ''),
        category: String(row.category || 'सामान्य'),
        image_url: formatDriveImageUrl(row.image_url),
        document_url: row.document_url || '',
        publish_date: String(row.publish_date || nowIso.slice(0, 10)),
        eligibility: row.eligibility || '',
        required_documents: row.required_documents || '',
        official_link: row.official_link || '',
        status: String(row.status || 'सक्रिय'),
        display_order: Number(row.display_order) || 1,
        published: row.published === true || String(row.published).toUpperCase() === 'TRUE',
        source: String(row.source || 'ग्राम पंचायत सैदौरा'),
        last_updated: String(row.last_updated || nowIso.slice(0, 10)),
        updated_by: String(row.updated_by || 'Google Sheets')
      }));
    }

    // 2. DevelopmentWorks
    if (Array.isArray(data.DevelopmentWorks) && data.DevelopmentWorks.length > 0) {
      db.developmentWorks = data.DevelopmentWorks.map((row: any) => ({
        work_id: String(row.work_id || `WRK-${Math.random().toString(36).substring(2, 7)}`),
        work_name: String(row.work_name || row.title || ''),
        location: String(row.location || 'सैदौरा'),
        description: String(row.description || ''),
        scheme_source: String(row.scheme_source || row.source || '15वाँ वित्त आयोग'),
        budget_allocated: String(row.budget_allocated || 'सत्यापन लंबित'),
        budget_spent: String(row.budget_spent || 'सत्यापन लंबित'),
        start_date: String(row.start_date || ''),
        target_end_date: String(row.target_end_date || ''),
        current_status: (row.current_status || row.status || 'प्रगतिरत') as any,
        image_before: formatDriveImageUrl(row.image_before),
        image_after: formatDriveImageUrl(row.image_after),
        source_of_data: String(row.source_of_data || 'कार्य अभिलेख'),
        last_updated: String(row.last_updated || nowIso.slice(0, 10)),
        published: row.published === true || String(row.published).toUpperCase() === 'TRUE',
        display_order: Number(row.display_order) || 1
      }));
    }

    // 3. GramSabha
    if (Array.isArray(data.GramSabha) && data.GramSabha.length > 0) {
      db.gramSabha = data.GramSabha.map((row: any) => ({
        meeting_id: String(row.meeting_id || `GS-${Math.random().toString(36).substring(2, 7)}`),
        meeting_type: (row.meeting_type || 'आगामी ग्राम सभा सूचना') as any,
        meeting_date: String(row.meeting_date || nowIso.slice(0, 10)),
        meeting_time: row.meeting_time || '11:00 AM',
        venue: String(row.venue || row.location || 'पंचायत भवन, सैदौरा'),
        agenda: String(row.agenda || ''),
        description: String(row.description || ''),
        resolution_summary: row.resolution_summary || '',
        document_url: row.document_url || '',
        status: (row.status || 'निर्धारित') as any,
        source: String(row.source || 'ग्राम पंचायत अभिलेख'),
        last_updated: String(row.last_updated || nowIso.slice(0, 10)),
        published: row.published === true || String(row.published).toUpperCase() === 'TRUE',
        display_order: Number(row.display_order) || 1
      }));
    }

    // 4. Gallery
    if (Array.isArray(data.Gallery) && data.Gallery.length > 0) {
      db.gallery = data.Gallery.map((row: any) => ({
        image_id: String(row.image_id || `GAL-${Math.random().toString(36).substring(2, 7)}`),
        title: String(row.title || ''),
        description: String(row.description || ''),
        image_url: formatDriveImageUrl(row.image_url),
        category: String(row.category || 'सामान्य'),
        upload_date: String(row.upload_date || nowIso.slice(0, 10)),
        published: row.published === true || String(row.published).toUpperCase() === 'TRUE',
        display_order: Number(row.display_order) || 1,
        source: row.source || 'सामुदायिक योगदान'
      }));
    }

    // 5. Categories
    if (Array.isArray(data.Categories) && data.Categories.length > 0) {
      db.categories = data.Categories.map((row: any) => ({
        category_id: String(row.category_id || `CAT-${Math.random().toString(36).substring(2, 7)}`),
        category_name: String(row.category_name || ''),
        description: String(row.description || ''),
        default_department: String(row.default_department || 'ग्राम पंचायत सैदौरा'),
        default_officer_id: String(row.default_officer_id || 'OFF-01'),
        active: row.active === true || String(row.active).toUpperCase() === 'TRUE',
        display_order: Number(row.display_order) || 1
      }));
    }

    // 6. Officers
    if (Array.isArray(data.Officers) && data.Officers.length > 0) {
      db.officers = data.Officers.map((row: any) => ({
        officer_id: String(row.officer_id || `OFF-${Math.random().toString(36).substring(2, 7)}`),
        officer_name: String(row.officer_name || ''),
        designation: String(row.designation || ''),
        department: String(row.department || ''),
        public_contact: String(row.public_contact || 'सत्यापन लंबित'),
        active: row.active === true || String(row.active).toUpperCase() === 'TRUE',
        verification_status: (row.verification_status || 'सत्यापन लंबित (यूजर इनपुट)') as any,
        last_verified: String(row.last_verified || nowIso.slice(0, 10))
      }));
    }

    // 7. Complaints (Sync any newly added or updated complaints)
    if (Array.isArray(data.Complaints) && data.Complaints.length > 0) {
      const existingMap = new Map(db.complaints.map((c) => [c.complaint_id, c]));
      data.Complaints.forEach((row: any) => {
        if (row.complaint_id) {
          const existing = existingMap.get(row.complaint_id);
          const complaintObj: Complaint = {
            complaint_id: String(row.complaint_id),
            created_at: String(row.created_at || nowIso),
            updated_at: String(row.updated_at || nowIso),
            citizen_user_id: String(row.citizen_user_id || existing?.citizen_user_id || 'USR-ANON'),
            citizen_name: String(row.citizen_name || existing?.citizen_name || 'नागरिक'),
            verified_mobile_reference: String(row.verified_mobile_reference || existing?.verified_mobile_reference || '******'),
            village: String(row.village || 'सैदौरा'),
            ward_or_mohalla: String(row.ward_or_mohalla || ''),
            address: String(row.address || ''),
            category: String(row.category || 'सामान्य'),
            subject: String(row.subject || ''),
            description: String(row.description || ''),
            assigned_department: String(row.assigned_department || 'ग्राम पंचायत सैदौरा'),
            assigned_officer_id: String(row.assigned_officer_id || 'OFF-01'),
            scheme_or_work: row.scheme_or_work || '',
            location: String(row.location || ''),
            attachment_reference: row.attachment_reference || '',
            status: (row.status || 'प्राप्त हुई') as any,
            public_remark: row.public_remark || '',
            internal_remark: row.internal_remark || '',
            resolved_at: row.resolved_at || '',
            citizen_feedback: row.citizen_feedback || '',
            reopened_count: Number(row.reopened_count) || 0
          };
          existingMap.set(complaintObj.complaint_id, complaintObj);
        }
      });
      db.complaints = Array.from(existingMap.values());
    }

    // 8. ComplaintHistory
    if (Array.isArray(data.ComplaintHistory) && data.ComplaintHistory.length > 0) {
      const historyIds = new Set(db.history.map((h) => h.history_id));
      data.ComplaintHistory.forEach((row: any) => {
        if (row.history_id && !historyIds.has(row.history_id)) {
          db.history.push({
            history_id: String(row.history_id),
            complaint_id: String(row.complaint_id),
            timestamp: String(row.timestamp || nowIso),
            old_status: String(row.old_status || ''),
            new_status: String(row.new_status || ''),
            action_by: String(row.action_by || ''),
            public_comment: String(row.public_comment || ''),
            internal_comment: row.internal_comment || '',
            evidence_reference: row.evidence_reference || ''
          });
          historyIds.add(row.history_id);
        }
      });
    }

    // 9. Settings
    if (Array.isArray(data.Settings) && data.Settings.length > 0) {
      const kvMap: Record<string, any> = {};
      data.Settings.forEach((row: any) => {
        const k = row.Key || row.key || row.setting_key;
        const v = row.Value !== undefined ? row.Value : (row.value !== undefined ? row.value : row.setting_value);
        if (k) {
          kvMap[String(k).trim().toLowerCase()] = v;
        }
      });
      const s = data.Settings[0] || {};
      db.settings = {
        portal_title_hi: kvMap['portal_title_hi'] || kvMap['portal_title'] || s.portal_title_hi || db.settings.portal_title_hi,
        portal_title_en: kvMap['portal_title_en'] || s.portal_title_en || db.settings.portal_title_en,
        tagline_hi: kvMap['tagline_hi'] || kvMap['tagline'] || s.tagline_hi || db.settings.tagline_hi,
        tagline_en: kvMap['tagline_en'] || s.tagline_en || db.settings.tagline_en,
        panchayat_name: kvMap['panchayat_name'] || s.panchayat_name || db.settings.panchayat_name,
        block_janpad: kvMap['block_janpad'] || s.block_janpad || db.settings.block_janpad,
        district: kvMap['district'] || s.district || db.settings.district,
        state: kvMap['state'] || s.state || db.settings.state,
        marquee_notice: kvMap['marquee_notice'] || s.marquee_notice || db.settings.marquee_notice,
        cm_helpline: String(kvMap['helpline_181'] || kvMap['cm_helpline'] || s.cm_helpline || db.settings.cm_helpline),
        emergency_helpline: String(kvMap['helpline_112'] || kvMap['emergency_helpline'] || s.emergency_helpline || db.settings.emergency_helpline),
        panchayat_contact: kvMap['panchayat_contact'] || s.panchayat_contact || db.settings.panchayat_contact,
        last_sheets_sync: nowIso
      };
    }

    db.lastSheetsSync = nowIso;
    db.lastSyncError = undefined;
    saveDB();

    return {
      success: true,
      message: 'Google Sheets 9-Tab CMS से डेटा सफलतापूर्वक सिंक्रोनाइज़ हो गया!',
      count: {
        portalContent: db.portalContent.length,
        developmentWorks: db.developmentWorks.length,
        gramSabha: db.gramSabha.length,
        gallery: db.gallery.length,
        categories: db.categories.length,
        officers: db.officers.length,
        complaints: db.complaints.length
      }
    };
  } catch (err: any) {
    const errMessage = err.name === 'AbortError'
      ? 'Google Sheets से संपर्क समय समाप्त (Timeout)'
      : `Google Sheets सिंक विफलता: ${err.message || err}`;
    db.lastSyncError = errMessage;
    return { success: false, message: errMessage };
  }
}

// Helper: Post payload to Google Apps Script Web App
async function postToGoogleSheets(payload: any) {
  if (!db.googleSheetsScriptUrl) return;
  try {
    const res = await fetch(db.googleSheetsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    db.lastSheetsSync = new Date().toISOString();
    db.lastSyncError = undefined;
    saveDB();
    return await res.json();
  } catch (err: any) {
    console.warn('Failed to post to Google Sheets Web App:', err.message || err);
  }
}

// Background auto-sync interval (every 30 seconds if Google Sheets URL is configured)
let lastLoggedSyncNotice = '';
setInterval(async () => {
  if (db.googleSheetsScriptUrl) {
    try {
      const res = await syncFromGoogleSheets();
      if (!res.success && res.message !== lastLoggedSyncNotice) {
        lastLoggedSyncNotice = res.message;
        console.warn('[Google Sheets Sync Notice]:', res.message);
      } else if (res.success && lastLoggedSyncNotice) {
        lastLoggedSyncNotice = '';
        console.log('[Google Sheets Sync Active]: डेटा सफलतापूर्वक अपडेट हुआ।');
      }
    } catch (e: any) {
      console.warn('Periodic Google Sheets sync notice:', e?.message || e);
    }
  }
}, 30000);

let lastBackgroundSyncTime = 0;
function maybeTriggerBackgroundSync() {
  if (!db.googleSheetsScriptUrl) return;
  const now = Date.now();
  if (now - lastBackgroundSyncTime > 15000) { // Throttle: at most once every 15s per client request
    lastBackgroundSyncTime = now;
    syncFromGoogleSheets().catch((err) => {
      console.warn('Background sync on request failed:', err);
    });
  }
}

// -------------------------------------------------------------
// PUBLIC & CMS API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  const isConfigured = Boolean(db.googleSheetsScriptUrl);
  const isConnected = isConfigured && !db.lastSyncError;
  res.json({
    status: 'ok',
    panchayat: `${db.settings.panchayat_name}, जनपद ${db.settings.block_janpad}, जिला ${db.settings.district} (${db.settings.state})`,
    timestamp: new Date().toISOString(),
    sheetsConnected: isConnected,
    sheetsConfigured: isConfigured,
    sheetsStatus: !isConfigured ? 'not_configured' : (db.lastSyncError ? 'error' : 'connected'),
    lastSync: db.lastSheetsSync,
    lastSyncError: db.lastSyncError || null
  });
});

// Public Google Sheets Connection Status (used by Header offline/connected status monitor)
app.get('/api/sheets/connection-status', (req: Request, res: Response) => {
  const isConfigured = Boolean(db.googleSheetsScriptUrl);
  const isConnected = isConfigured && !db.lastSyncError;
  res.json({
    success: true,
    configured: isConfigured,
    connected: isConnected,
    status: !isConfigured ? 'not_configured' : (db.lastSyncError ? 'error' : 'connected'),
    lastSync: db.lastSheetsSync || null,
    lastSyncError: db.lastSyncError || null,
    cachedCounts: {
      portalContent: db.portalContent.length,
      developmentWorks: db.developmentWorks.length,
      gramSabha: db.gramSabha.length,
      gallery: db.gallery.length,
      categories: db.categories.length,
      officers: db.officers.length,
      complaints: db.complaints.length
    },
    timestamp: new Date().toISOString()
  });
});

// Trigger live sync from Google Sheets (Admin & Manual Button)
app.post('/api/sheets/sync', async (req: Request, res: Response) => {
  const result = await syncFromGoogleSheets();
  res.json(result);
});

// Google Sheets Instant Webhook Trigger (POST & GET)
// Called automatically by Google Apps Script onEdit / onChange trigger
app.all('/api/sheets/webhook', async (req: Request, res: Response) => {
  console.log(`[Webhook] Google Sheets update received (${req.method}):`, req.body || req.query);
  const result = await syncFromGoogleSheets();
  res.json({
    success: result.success,
    message: result.message || 'Google Sheets Webhook Received - Portal Synchronized',
    syncedAt: new Date().toISOString(),
    details: result
  });
});

// Tab 1: PortalContent (News, Schemes, Notices)
app.get('/api/portal-content', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const publishedOnly = req.query.all !== 'true';
  const list = publishedOnly
    ? db.portalContent.filter((c) => c.published)
    : db.portalContent;

  list.sort((a, b) => a.display_order - b.display_order);
  res.json({ success: true, data: list, lastSync: db.lastSheetsSync });
});

// Tab 2: DevelopmentWorks (Village Development Works)
app.get('/api/development-works', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const publishedOnly = req.query.all !== 'true';
  const list = publishedOnly
    ? db.developmentWorks.filter((w) => w.published)
    : db.developmentWorks;

  list.sort((a, b) => a.display_order - b.display_order);
  res.json({ success: true, data: list, lastSync: db.lastSheetsSync });
});

// Tab 3: GramSabha (Meetings & Decisions)
app.get('/api/gram-sabha', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const publishedOnly = req.query.all !== 'true';
  const list = publishedOnly
    ? db.gramSabha.filter((g) => g.published)
    : db.gramSabha;

  list.sort((a, b) => a.display_order - b.display_order);
  res.json({ success: true, data: list, lastSync: db.lastSheetsSync });
});

// Tab 4: Gallery (Photos with Google Drive CDN URL)
app.get('/api/gallery', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const publishedOnly = req.query.all !== 'true';
  const list = publishedOnly
    ? db.gallery.filter((g) => g.published)
    : db.gallery;

  list.sort((a, b) => a.display_order - b.display_order);
  res.json({ success: true, data: list, lastSync: db.lastSheetsSync });
});

// Tab 5: Categories
app.get('/api/categories', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const activeOnly = req.query.all !== 'true';
  const list = activeOnly ? db.categories.filter((c) => c.active) : db.categories;
  list.sort((a, b) => a.display_order - b.display_order);
  res.json({ success: true, data: list });
});

// Tab 6: Officers
app.get('/api/officers', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  const activeOnly = req.query.all !== 'true';
  const list = activeOnly ? db.officers.filter((o) => o.active) : db.officers;
  res.json({ success: true, data: list });
});

// Tab 9: Settings
app.get('/api/settings', (req: Request, res: Response) => {
  maybeTriggerBackgroundSync();
  res.json({ success: true, data: db.settings });
});

// -------------------------------------------------------------
// CITIZEN AUTH & OTP ROUTES
// -------------------------------------------------------------

app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { mobile, name } = req.body;

  if (!mobile || !/^[6-9]\d{9}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'कृपया वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (शुरुआत 6, 7, 8, या 9 से)।' });
  }

  const cleanMobile = String(mobile).trim();
  const citizenName = name ? String(name).trim() : 'नागरिक';

  const existing = otpStore.get(cleanMobile);
  if (existing && Date.now() - existing.lastSentAt < 60000) {
    const waitSec = Math.ceil((60000 - (Date.now() - existing.lastSentAt)) / 1000);
    return res.status(429).json({ error: `कृपया नया OTP प्राप्त करने के लिए ${waitSec} सेकंड प्रतीक्षा करें।` });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore.set(cleanMobile, {
    mobile: cleanMobile,
    name: citizenName,
    otp: otpCode,
    expiresAt,
    attempts: 0,
    lastSentAt: Date.now()
  });

  const hasRealSmsGateway = Boolean(process.env.FAST2SMS_API_KEY || process.env.SMS_GATEWAY_URL);

  if (hasRealSmsGateway) {
    return res.json({
      success: true,
      message: `OTP आपके मोबाइल नंबर ${maskMobile(cleanMobile)} पर भेज दिया गया है।`,
      isDemoMode: false,
      expiresInSeconds: 300
    });
  } else {
    return res.json({
      success: true,
      message: 'DEMO / TEST MODE — वास्तविक OTP प्रदाता अभी कॉन्फ़िगर नहीं है। नीचे दिया गया परीक्षण OTP दर्ज करें।',
      isDemoMode: true,
      demoOtp: otpCode,
      expiresInSeconds: 300
    });
  }
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: 'मोबाइल नंबर और OTP दोनों आवश्यक हैं।' });
  }

  const cleanMobile = String(mobile).trim();
  const record = otpStore.get(cleanMobile);

  if (!record) {
    return res.status(400).json({ error: 'कोई सक्रिय OTP अनुरोध नहीं मिला। कृपया पहले OTP भेजें।' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanMobile);
    return res.status(400).json({ error: 'OTP की वैधता समाप्त हो चुकी है। कृपया नया OTP प्राप्त करें।' });
  }

  if (record.attempts >= 3) {
    otpStore.delete(cleanMobile);
    return res.status(403).json({ error: 'अधिकतम 3 गलत प्रयासों के कारण OTP निरस्त कर दिया गया है।' });
  }

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1;
    return res.status(400).json({ error: `गलत OTP दर्ज किया गया है। शेष प्रयास: ${3 - record.attempts}` });
  }

  otpStore.delete(cleanMobile);

  const token = crypto.randomBytes(32).toString('hex');
  const sessionUser: SessionUser = {
    userId: `USR-${cleanMobile.slice(-4)}-${Date.now().toString().slice(-4)}`,
    displayName: record.name,
    mobile: cleanMobile,
    role: 'citizen'
  };

  sessionStore.set(token, {
    user: sessionUser,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    token,
    user: {
      userId: sessionUser.userId,
      displayName: sessionUser.displayName,
      mobileMasked: maskMobile(cleanMobile),
      role: 'citizen'
    }
  });
});

app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const defaultAdminUser = process.env.ADMIN_USERNAME || 'admin';
  const defaultAdminPass = process.env.ADMIN_PASSWORD || 'SaidouraAdmin@2026';

  if (username === defaultAdminUser && password === defaultAdminPass) {
    const token = crypto.randomBytes(32).toString('hex');
    const adminUser: SessionUser = {
      userId: 'ADMIN-SAIDOURA-01',
      displayName: 'ग्राम पंचायत प्रशासक (सैदौरा)',
      mobile: '9999999999',
      role: 'admin'
    };

    sessionStore.set(token, {
      user: adminUser,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    db.auditLogs.unshift({
      audit_id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actor_id: adminUser.userId,
      action_type: 'ADMIN_LOGIN',
      record_type: 'AUTH',
      record_id: adminUser.userId,
      change_summary: 'प्रशासक द्वारा सफलतापूर्वक लॉगिन किया गया।'
    });
    saveDB();

    return res.json({
      success: true,
      token,
      user: {
        userId: adminUser.userId,
        displayName: adminUser.displayName,
        role: adminUser.role
      }
    });
  }

  return res.status(401).json({ error: 'अमान्य एडमिन यूज़रनेम या पासवर्ड।' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser | undefined;
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      userId: user.userId,
      displayName: user.displayName,
      mobileMasked: maskMobile(user.mobile),
      role: user.role
    }
  });
});

// -------------------------------------------------------------
// COMPLAINT SUBMISSION (SYNCED TO TAB 7 & 8)
// -------------------------------------------------------------

app.post('/api/complaints', requireCitizen, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const {
    citizen_name,
    village,
    ward_or_mohalla,
    address,
    category,
    subject,
    description,
    assigned_department,
    assigned_officer_id,
    scheme_or_work,
    location,
    attachment_reference,
    declaration_agreed,
    idempotency_key
  } = req.body;

  if (!declaration_agreed) {
    return res.status(400).json({ error: 'कृपया घोषणा पत्र स्वीकार करें।' });
  }

  if (!citizen_name || !ward_or_mohalla || !category || !subject || !description) {
    return res.status(400).json({ error: 'कृपया सभी आवश्यक फ़ील्ड भरें।' });
  }

  if (idempotency_key) {
    if (idempotencyKeys.has(idempotency_key)) {
      return res.status(409).json({ error: 'यह शिकायत पहले ही दर्ज की जा चुकी है।' });
    }
    idempotencyKeys.add(idempotency_key);
  }

  const currentYear = new Date().getFullYear();
  const complaintId = `SDGP-${currentYear}-${String(db.nextComplaintSeq).padStart(6, '0')}`;
  db.nextComplaintSeq += 1;
  const nowIso = new Date().toISOString();

  const newComplaint: Complaint = {
    complaint_id: complaintId,
    created_at: nowIso,
    updated_at: nowIso,
    citizen_user_id: user.userId,
    citizen_name: String(citizen_name).trim(),
    verified_mobile_reference: user.mobile,
    village: village ? String(village).trim() : 'सैदौरा',
    ward_or_mohalla: String(ward_or_mohalla).trim(),
    address: address ? String(address).trim() : '',
    category: String(category).trim(),
    subject: String(subject).trim(),
    description: String(description).trim(),
    assigned_department: assigned_department || 'ग्राम पंचायत सैदौरा',
    assigned_officer_id: assigned_officer_id || 'OFF-01',
    scheme_or_work: scheme_or_work || '',
    location: location || ward_or_mohalla,
    attachment_reference: attachment_reference || '',
    status: 'प्राप्त हुई',
    public_remark: 'शिकायत पोर्टल पर प्राप्त हुई। प्रारंभिक समीक्षा के लिए सूचीबद्ध।',
    reopened_count: 0
  };

  const initialHistory: ComplaintHistoryEntry = {
    history_id: `HIST-${Date.now().toString().slice(-6)}`,
    complaint_id: complaintId,
    timestamp: nowIso,
    old_status: 'कोई नहीं',
    new_status: 'प्राप्त हुई',
    action_by: `नागरिक (${newComplaint.citizen_name})`,
    public_comment: 'शिकायत नागरिक द्वारा जन-सेवा पोर्टल पर सफलतापूर्वक दर्ज की गई।'
  };

  const auditEntry: AdminAuditLog = {
    audit_id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: nowIso,
    actor_id: user.userId,
    action_type: 'COMPLAINT_CREATED',
    record_type: 'COMPLAINT',
    record_id: complaintId,
    change_summary: `नई शिकायत दर्ज: ${newComplaint.category} - ${newComplaint.subject}`
  };

  db.complaints.unshift(newComplaint);
  db.history.unshift(initialHistory);
  db.auditLogs.unshift(auditEntry);
  saveDB();

  // Async push to Google Sheets (Tab 7: Complaints & Tab 8: ComplaintHistory)
  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({
      action: 'CREATE_COMPLAINT',
      complaint: {
        ...newComplaint,
        verified_mobile_reference: maskMobile(newComplaint.verified_mobile_reference)
      },
      history: initialHistory
    }).catch((err) => console.error('Google Sheets sync error:', err));
  }

  res.status(201).json({
    success: true,
    complaint_id: complaintId,
    created_at: nowIso,
    status: 'प्राप्त हुई',
    message: 'आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है एवं Google Sheets में सुरक्षित हो गई है।'
  });
});

// Public Track Complaint (Sanitized)
app.get('/api/complaints/track/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const complaint = db.complaints.find(
    (c) => c.complaint_id.toLowerCase() === id.trim().toLowerCase()
  );

  if (!complaint) {
    return res.status(404).json({ error: `शिकायत क्रमांक '${id}' रिकॉर्ड में नहीं मिला।` });
  }

  const historyEntries = db.history
    .filter((h) => h.complaint_id.toLowerCase() === complaint.complaint_id.toLowerCase())
    .map((h) => ({
      history_id: h.history_id,
      timestamp: h.timestamp,
      old_status: h.old_status,
      new_status: h.new_status,
      action_by: h.action_by,
      public_comment: h.public_comment,
      evidence_reference: h.evidence_reference
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sanitized = {
    complaint_id: complaint.complaint_id,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    citizen_name: complaint.citizen_name,
    mobile_masked: maskMobile(complaint.verified_mobile_reference),
    village: complaint.village,
    ward_or_mohalla: complaint.ward_or_mohalla,
    category: complaint.category,
    subject: complaint.subject,
    description: complaint.description,
    assigned_department: complaint.assigned_department,
    location: complaint.location,
    status: complaint.status,
    public_remark: complaint.public_remark,
    resolved_at: complaint.resolved_at,
    citizen_feedback: complaint.citizen_feedback,
    reopened_count: complaint.reopened_count,
    history: historyEntries
  };

  res.json({ success: true, data: sanitized });
});

// Citizen's Own Complaints List
app.get('/api/citizen/my-complaints', requireCitizen, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const userComplaints = db.complaints.filter(
    (c) => c.citizen_user_id === user.userId || c.verified_mobile_reference === user.mobile
  );

  res.json({
    success: true,
    data: userComplaints.map((c) => ({
      ...c,
      verified_mobile_reference: maskMobile(c.verified_mobile_reference)
    }))
  });
});

// Citizen Feedback or Reopen Request
app.post('/api/citizen/complaints/:id/feedback', requireCitizen, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { id } = req.params;
  const { feedback, request_reopen, reopen_reason } = req.body;

  const complaint = db.complaints.find(
    (c) => c.complaint_id === id && (c.citizen_user_id === user.userId || c.verified_mobile_reference === user.mobile)
  );

  if (!complaint) {
    return res.status(404).json({ error: 'शिकायत नहीं मिली।' });
  }

  const nowIso = new Date().toISOString();

  if (request_reopen) {
    const oldStatus = complaint.status;
    complaint.status = 'पुनः खोली गई';
    complaint.reopened_count = (complaint.reopened_count || 0) + 1;
    complaint.updated_at = nowIso;
    complaint.public_remark = `नागरिक द्वारा पुनः खोली गई: ${reopen_reason || 'समाधान से असंतुष्ट'}`;

    const historyEntry: ComplaintHistoryEntry = {
      history_id: `HIST-${Date.now().toString().slice(-6)}`,
      complaint_id: complaint.complaint_id,
      timestamp: nowIso,
      old_status: oldStatus,
      new_status: 'पुनः खोली गई',
      action_by: `नागरिक (${complaint.citizen_name})`,
      public_comment: `पुनः खोलने का कारण: ${reopen_reason || 'शिकायतकर्ता द्वारा असंतोष व्यक्त किया गया'}`
    };

    db.history.unshift(historyEntry);
    db.auditLogs.unshift({
      audit_id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: nowIso,
      actor_id: user.userId,
      action_type: 'COMPLAINT_REOPENED',
      record_type: 'COMPLAINT',
      record_id: complaint.complaint_id,
      change_summary: `नागरिक द्वारा शिकायत पुनः खोली गई। कारण: ${reopen_reason}`
    });

    if (db.googleSheetsScriptUrl) {
      postToGoogleSheets({
        action: 'UPDATE_COMPLAINT_STATUS',
        complaint_id: complaint.complaint_id,
        new_status: complaint.status,
        public_remark: complaint.public_remark,
        history: historyEntry
      }).catch((e) => console.error(e));
    }
  }

  if (feedback) {
    complaint.citizen_feedback = feedback;
    complaint.updated_at = nowIso;
  }

  saveDB();
  res.json({ success: true, message: 'प्रतिक्रिया सफलतापूर्वक दर्ज कर ली गई।' });
});

// -------------------------------------------------------------
// ADMIN CONTROLS & 9-TAB CMS MANAGEMENT
// -------------------------------------------------------------

app.get('/api/admin/complaints', requireAdmin, (req: Request, res: Response) => {
  const { status, category, search } = req.query;
  let filtered = [...db.complaints];

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.complaint_id.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.citizen_name.toLowerCase().includes(q) ||
        c.ward_or_mohalla.toLowerCase().includes(q)
    );
  }

  const summary = {
    total: db.complaints.length,
    received: db.complaints.filter((c) => c.status === 'प्राप्त हुई').length,
    underReview: db.complaints.filter((c) => c.status === 'प्रारंभिक जाँच' || c.status === 'संबंधित अधिकारी को भेजी गई').length,
    inProgress: db.complaints.filter((c) => c.status === 'कार्रवाई प्रगति पर').length,
    resolved: db.complaints.filter((c) => c.status === 'निराकरण दर्ज').length,
    reopened: db.complaints.filter((c) => c.status === 'पुनः खोली गई').length,
    closed: db.complaints.filter((c) => c.status === 'बंद').length
  };

  res.json({ success: true, summary, data: filtered });
});

app.patch('/api/admin/complaints/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as SessionUser;
  const { id } = req.params;
  const { status, public_remark, internal_remark, assigned_department, assigned_officer_id, evidence_reference } = req.body;

  const complaint = db.complaints.find((c) => c.complaint_id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'शिकायत नहीं मिली।' });
  }

  const nowIso = new Date().toISOString();
  const oldStatus = complaint.status;

  if (status && status !== oldStatus) {
    complaint.status = status;
    if (status === 'निराकरण दर्ज' || status === 'बंद') {
      complaint.resolved_at = nowIso;
    }
  }

  if (public_remark) complaint.public_remark = public_remark;
  if (internal_remark) complaint.internal_remark = internal_remark;
  if (assigned_department) complaint.assigned_department = assigned_department;
  if (assigned_officer_id) complaint.assigned_officer_id = assigned_officer_id;
  complaint.updated_at = nowIso;

  const historyEntry: ComplaintHistoryEntry = {
    history_id: `HIST-${Date.now().toString().slice(-6)}`,
    complaint_id: complaint.complaint_id,
    timestamp: nowIso,
    old_status: oldStatus,
    new_status: complaint.status,
    action_by: `प्रशासक (${admin.displayName})`,
    public_comment: public_remark || `स्थिति बदलकर '${complaint.status}' की गई।`,
    internal_comment: internal_remark || '',
    evidence_reference: evidence_reference || ''
  };

  const auditEntry: AdminAuditLog = {
    audit_id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: nowIso,
    actor_id: admin.userId,
    action_type: 'UPDATE_COMPLAINT_STATUS',
    record_type: 'COMPLAINT',
    record_id: complaint.complaint_id,
    change_summary: `स्थिति: '${oldStatus}' -> '${complaint.status}'. टिप्पणी: ${public_remark || 'अद्यतन किया गया'}`
  };

  db.history.unshift(historyEntry);
  db.auditLogs.unshift(auditEntry);
  saveDB();

  // Async push to Google Sheets
  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({
      action: 'UPDATE_COMPLAINT_STATUS',
      complaint_id: complaint.complaint_id,
      new_status: complaint.status,
      public_remark: complaint.public_remark,
      internal_remark: complaint.internal_remark,
      history: historyEntry
    }).catch((err) => console.error('Google Sheet update error:', err));
  }

  res.json({ success: true, message: 'शिकायत की स्थिति एवं विवरण सफलतापूर्वक अपडेट हो गया।' });
});

// CSV Export
app.get('/api/admin/export/complaints.csv', requireAdmin, (req: Request, res: Response) => {
  const headers = [
    'complaint_id', 'created_at', 'citizen_name', 'village', 'ward_or_mohalla',
    'category', 'subject', 'description', 'assigned_department', 'status',
    'public_remark', 'internal_remark', 'resolved_at'
  ];

  const escapeCsv = (str: string | undefined) => {
    if (!str) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = db.complaints.map((c) => [
    escapeCsv(c.complaint_id),
    escapeCsv(c.created_at),
    escapeCsv(c.citizen_name),
    escapeCsv(c.village),
    escapeCsv(c.ward_or_mohalla),
    escapeCsv(c.category),
    escapeCsv(c.subject),
    escapeCsv(c.description),
    escapeCsv(c.assigned_department),
    escapeCsv(c.status),
    escapeCsv(c.public_remark),
    escapeCsv(c.internal_remark),
    escapeCsv(c.resolved_at)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="saidoura_complaints_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csvContent);
});

// Admin CMS: Tab 1 - PortalContent (News, Schemes)
app.post('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as SessionUser;
  const contentItem: PortalContent = req.body;

  if (!contentItem.title || !contentItem.content_type) {
    return res.status(400).json({ error: 'शीर्षक और प्रकार आवश्यक हैं।' });
  }

  const nowIso = new Date().toISOString();
  let itemToSave: PortalContent;

  if (contentItem.content_id) {
    const idx = db.portalContent.findIndex((c) => c.content_id === contentItem.content_id);
    if (idx !== -1) {
      db.portalContent[idx] = {
        ...db.portalContent[idx],
        ...contentItem,
        image_url: formatDriveImageUrl(contentItem.image_url),
        last_updated: nowIso,
        updated_by: admin.displayName
      };
      itemToSave = db.portalContent[idx];
    } else {
      itemToSave = { ...contentItem, last_updated: nowIso, updated_by: admin.displayName };
      db.portalContent.unshift(itemToSave);
    }
  } else {
    const newId = `CNT-${Date.now().toString().slice(-6)}`;
    itemToSave = {
      ...contentItem,
      content_id: newId,
      image_url: formatDriveImageUrl(contentItem.image_url),
      publish_date: contentItem.publish_date || nowIso.slice(0, 10),
      last_updated: nowIso,
      updated_by: admin.displayName,
      published: contentItem.published ?? true,
      display_order: contentItem.display_order || db.portalContent.length + 1
    };
    db.portalContent.unshift(itemToSave);
  }

  saveDB();

  // Push to Google Sheets
  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({ action: 'SAVE_PORTAL_CONTENT', content: itemToSave }).catch((e) => console.error(e));
  }

  res.json({ success: true, message: 'सामग्री सुरक्षित हो गई है।', content_id: itemToSave.content_id });
});

app.delete('/api/admin/content/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.portalContent = db.portalContent.filter((c) => c.content_id !== id);
  saveDB();
  res.json({ success: true, message: 'सामग्री हटा दी गई।' });
});

// Admin CMS: Tab 2 - DevelopmentWorks
app.post('/api/admin/development-works', requireAdmin, (req: Request, res: Response) => {
  const workItem: DevelopmentWork = req.body;
  if (!workItem.work_name) {
    return res.status(400).json({ error: 'कार्य का नाम आवश्यक है।' });
  }

  const nowIso = new Date().toISOString();
  let itemToSave: DevelopmentWork;

  if (workItem.work_id) {
    const idx = db.developmentWorks.findIndex((w) => w.work_id === workItem.work_id);
    if (idx !== -1) {
      db.developmentWorks[idx] = {
        ...db.developmentWorks[idx],
        ...workItem,
        image_before: formatDriveImageUrl(workItem.image_before),
        image_after: formatDriveImageUrl(workItem.image_after),
        last_updated: nowIso
      };
      itemToSave = db.developmentWorks[idx];
    } else {
      itemToSave = { ...workItem, last_updated: nowIso };
      db.developmentWorks.unshift(itemToSave);
    }
  } else {
    const newId = `WRK-${Date.now().toString().slice(-6)}`;
    itemToSave = {
      ...workItem,
      work_id: newId,
      image_before: formatDriveImageUrl(workItem.image_before),
      image_after: formatDriveImageUrl(workItem.image_after),
      last_updated: nowIso,
      published: workItem.published ?? true,
      display_order: workItem.display_order || db.developmentWorks.length + 1
    };
    db.developmentWorks.unshift(itemToSave);
  }

  saveDB();

  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({ action: 'SAVE_DEVELOPMENT_WORK', work: itemToSave }).catch((e) => console.error(e));
  }

  res.json({ success: true, message: 'विकास कार्य सुरक्षित हो गया।', work_id: itemToSave.work_id });
});

// Admin CMS: Tab 3 - GramSabha
app.post('/api/admin/gram-sabha', requireAdmin, (req: Request, res: Response) => {
  const entry: GramSabhaEntry = req.body;
  if (!entry.agenda) {
    return res.status(400).json({ error: 'एजेंडा / विषय आवश्यक है।' });
  }

  const nowIso = new Date().toISOString();
  let itemToSave: GramSabhaEntry;

  if (entry.meeting_id) {
    const idx = db.gramSabha.findIndex((g) => g.meeting_id === entry.meeting_id);
    if (idx !== -1) {
      db.gramSabha[idx] = { ...db.gramSabha[idx], ...entry, last_updated: nowIso };
      itemToSave = db.gramSabha[idx];
    } else {
      itemToSave = { ...entry, last_updated: nowIso };
      db.gramSabha.unshift(itemToSave);
    }
  } else {
    const newId = `GS-${Date.now().toString().slice(-6)}`;
    itemToSave = {
      ...entry,
      meeting_id: newId,
      last_updated: nowIso,
      published: entry.published ?? true,
      display_order: entry.display_order || db.gramSabha.length + 1
    };
    db.gramSabha.unshift(itemToSave);
  }

  saveDB();

  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({ action: 'SAVE_GRAM_SABHA', entry: itemToSave }).catch((e) => console.error(e));
  }

  res.json({ success: true, message: 'ग्राम सभा प्रविष्टि सुरक्षित हो गई।', meeting_id: itemToSave.meeting_id });
});

// Admin CMS: Tab 4 - Gallery (Photos with Drive converter)
app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
  const item: GalleryItem = req.body;
  if (!item.title || !item.image_url) {
    return res.status(400).json({ error: 'शीर्षक और फोटो URL आवश्यक हैं।' });
  }

  const nowIso = new Date().toISOString();
  let itemToSave: GalleryItem;

  if (item.image_id) {
    const idx = db.gallery.findIndex((g) => g.image_id === item.image_id);
    if (idx !== -1) {
      db.gallery[idx] = {
        ...db.gallery[idx],
        ...item,
        image_url: formatDriveImageUrl(item.image_url)
      };
      itemToSave = db.gallery[idx];
    } else {
      itemToSave = { ...item, image_url: formatDriveImageUrl(item.image_url) };
      db.gallery.unshift(itemToSave);
    }
  } else {
    const newId = `GAL-${Date.now().toString().slice(-6)}`;
    itemToSave = {
      ...item,
      image_id: newId,
      image_url: formatDriveImageUrl(item.image_url),
      upload_date: item.upload_date || nowIso.slice(0, 10),
      published: item.published ?? true,
      display_order: item.display_order || db.gallery.length + 1
    };
    db.gallery.unshift(itemToSave);
  }

  saveDB();

  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({ action: 'SAVE_GALLERY', image: itemToSave }).catch((e) => console.error(e));
  }

  res.json({ success: true, message: 'फोटो गैलरी में सुरक्षित हो गई।', image_id: itemToSave.image_id });
});

// Admin CMS: Tab 9 - Settings
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const newSettings: Partial<PortalSettings> = req.body;
  db.settings = { ...db.settings, ...newSettings };
  saveDB();

  if (db.googleSheetsScriptUrl) {
    postToGoogleSheets({ action: 'SAVE_SETTINGS', settings: db.settings }).catch((e) => console.error(e));
  }

  res.json({ success: true, message: 'पोर्टल सेटिंग्स सहेज ली गईं।' });
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, data: db.auditLogs });
});

// Google Sheets Settings & Status
app.get('/api/admin/sheets/status', requireAdmin, (req: Request, res: Response) => {
  res.json({
    configured: Boolean(db.googleSheetsScriptUrl),
    scriptUrl: db.googleSheetsScriptUrl,
    spreadsheetId: db.googleSpreadsheetId,
    lastSync: db.lastSheetsSync,
    status: !db.googleSheetsScriptUrl ? 'not_configured' : (db.lastSyncError ? 'error' : 'connected'),
    errorMessage: db.lastSyncError,
    cachedCount: {
      portalContent: db.portalContent.length,
      developmentWorks: db.developmentWorks.length,
      gramSabha: db.gramSabha.length,
      gallery: db.gallery.length,
      categories: db.categories.length,
      officers: db.officers.length,
      complaints: db.complaints.length
    }
  });
});

app.post('/api/admin/sheets/config', requireAdmin, async (req: Request, res: Response) => {
  const { scriptUrl, spreadsheetId } = req.body;
  let cleanUrl = String(scriptUrl || '').trim();
  let cleanSheetId = String(spreadsheetId || '').trim();

  // If user pasted a Google Spreadsheet URL into the field, extract spreadsheet ID
  const sheetMatch = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1]) {
    if (!cleanSheetId) cleanSheetId = sheetMatch[1];
  }

  db.googleSheetsScriptUrl = cleanUrl;
  if (cleanSheetId) {
    db.googleSpreadsheetId = cleanSheetId;
  }
  db.lastSyncError = undefined;
  saveDB();

  if (db.googleSheetsScriptUrl) {
    const syncRes = await syncFromGoogleSheets();
    if (syncRes.success) {
      return res.json({
        success: true,
        message: 'Google Sheets 9-Tab CMS से संपर्क स्थापित हुआ और डेटा सिंक्रोनाइज़ हो गया!',
        syncCount: syncRes.count
      });
    } else {
      return res.json({
        success: false,
        warning: syncRes.message
      });
    }
  }

  res.json({ success: true, message: 'Google Sheets URL साफ़ कर दिया गया।' });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`सैदौरा जन-सेवा पोर्टल सर्वर सक्रिय: http://localhost:${PORT}`);
    console.log(`Google Sheets 9-Tab CMS एकीकरण सक्रिय`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
