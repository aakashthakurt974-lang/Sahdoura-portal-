export type ComplaintStatus =
  | 'प्राप्त हुई'
  | 'प्रारंभिक जाँच'
  | 'संबंधित अधिकारी को भेजी गई'
  | 'कार्रवाई प्रगति पर'
  | 'अतिरिक्त जानकारी आवश्यक'
  | 'समाधान प्रस्तावित'
  | 'शिकायतकर्ता की प्रतिक्रिया लंबित'
  | 'निराकरण दर्ज'
  | 'पुनः खोली गई'
  | 'बंद';

// Tab 7: Complaints
export interface Complaint {
  complaint_id: string;
  created_at: string;
  updated_at: string;
  citizen_user_id: string;
  citizen_name: string;
  verified_mobile_reference: string;
  village: string;
  ward_or_mohalla: string;
  address: string;
  category: string;
  subject: string;
  description: string;
  assigned_department: string;
  assigned_officer_id: string;
  scheme_or_work?: string;
  location: string;
  attachment_reference?: string;
  status: ComplaintStatus;
  public_remark?: string;
  internal_remark?: string;
  resolved_at?: string;
  citizen_feedback?: string;
  reopened_count: number;
}

// Tab 8: ComplaintHistory
export interface ComplaintHistoryEntry {
  history_id: string;
  complaint_id: string;
  timestamp: string;
  old_status: string;
  new_status: string;
  action_by: string;
  public_comment: string;
  internal_comment?: string;
  evidence_reference?: string;
}

// Tab 1: PortalContent (General Info, News, Announcements, Schemes)
export type ContentType =
  | 'पंचायत की खबर'
  | 'सरकारी योजना'
  | 'महत्वपूर्ण सूचना'
  | 'सामान्य जानकारी'
  | 'सार्वजनिक FAQ'
  | 'विकास कार्य'
  | 'पूर्ण हुआ कार्य'
  | 'ग्राम सभा की सूचना'
  | 'ग्राम सभा का निर्णय'
  | 'फोटो गैलरी';

export interface PortalContent {
  content_id: string;
  content_type: ContentType;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  document_url?: string;
  publish_date: string;
  event_date?: string;
  expiry_date?: string;
  location?: string;
  status: string;
  display_order: number;
  published: boolean;
  source: string;
  last_updated: string;
  updated_by: string;
  // Scheme specific fields
  eligibility?: string;
  required_documents?: string;
  official_link?: string;
}

// Tab 2: DevelopmentWorks (Village Development Works)
export interface DevelopmentWork {
  work_id: string;
  work_name: string;
  location: string;
  description: string;
  scheme_source: string; // e.g. 15वाँ वित्त आयोग, मनरेगा
  budget_allocated: string;
  budget_spent: string;
  start_date: string;
  target_end_date: string;
  current_status: 'प्रस्तावित' | 'स्वीकृत' | 'प्रगतिरत' | 'पूर्ण' | 'रुका हुआ';
  image_before?: string;
  image_after?: string;
  source_of_data: string;
  last_updated: string;
  published: boolean;
  display_order: number;
}

// Tab 3: GramSabha (Meetings, Agenda, Public Resolutions)
export interface GramSabhaEntry {
  meeting_id: string;
  meeting_type: 'आगामी ग्राम सभा सूचना' | 'विगत बैठक कार्यवाही एवं निर्णय';
  meeting_date: string;
  meeting_time?: string;
  venue: string;
  agenda: string;
  description: string;
  resolution_summary?: string;
  document_url?: string;
  status: 'निर्धारित' | 'सम्पन्न' | 'सत्यापन लंबित';
  source: string;
  last_updated: string;
  published: boolean;
  display_order: number;
}

// Tab 4: Gallery (Photos, Captions, Google Drive links)
export interface GalleryItem {
  image_id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  upload_date: string;
  published: boolean;
  display_order: number;
  source?: string;
}

// Tab 5: Categories (Grievance categories)
export interface Category {
  category_id: string;
  category_name: string;
  description: string;
  default_department: string;
  default_officer_id: string;
  active: boolean;
  display_order: number;
}

// Tab 6: Officers (Elected & Administrative Representatives)
export interface Officer {
  officer_id: string;
  officer_name: string;
  designation: string;
  department: string;
  public_contact: string;
  active: boolean;
  verification_status: 'सत्यापित' | 'सत्यापन लंबित (यूजर इनपुट)' | 'जानकारी उपलब्ध नहीं';
  last_verified: string;
}

// Tab 9: Settings (Portal Title, Tagline, Marquee Notice, Contacts)
export interface PortalSettings {
  portal_title_hi: string;
  portal_title_en: string;
  tagline_hi: string;
  tagline_en: string;
  panchayat_name: string;
  block_janpad: string;
  district: string;
  state: string;
  marquee_notice?: string;
  cm_helpline: string;
  emergency_helpline: string;
  panchayat_contact?: string;
  last_sheets_sync?: string;
}

export interface User {
  user_id: string;
  display_name: string;
  mobile_reference: string;
  role: 'citizen' | 'admin' | 'editor';
  account_status: 'active' | 'blocked';
  created_at: string;
  last_login: string;
}

export interface AdminAuditLog {
  audit_id: string;
  timestamp: string;
  actor_id: string;
  action_type: string;
  record_type: string;
  record_id: string;
  change_summary: string;
}

export interface SheetsSyncStatus {
  configured: boolean;
  scriptUrl?: string;
  spreadsheetId?: string;
  lastSync?: string;
  status: 'connected' | 'not_configured' | 'error';
  errorMessage?: string;
  cachedCount?: {
    portalContent: number;
    developmentWorks: number;
    gramSabha: number;
    gallery: number;
    categories: number;
    officers: number;
    complaints: number;
  };
}

/**
 * Utility to convert Google Drive shareable URLs into direct, web-embeddable URLs.
 * Works with URLs like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function formatDriveImageUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    // lh3.googleusercontent.com/d/FILE_ID is the public high-speed CDN endpoint
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}
