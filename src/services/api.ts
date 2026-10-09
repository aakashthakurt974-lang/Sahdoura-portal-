import {
  Complaint,
  PortalContent,
  DevelopmentWork,
  GramSabhaEntry,
  GalleryItem,
  PortalSettings,
  Category,
  Officer,
  AdminAuditLog,
  SheetsSyncStatus
} from '../types/index.ts';

const TOKEN_KEY = 'saidoura_portal_token';
const USER_KEY = 'saidoura_portal_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token: string, user: any) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `सर्वर त्रुटि: (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public Data Endpoints (Tabs 1-6 & 9)
  getHealth: () => request<any>('/api/health'),
  getPortalContent: (all = false) => request<{ success: boolean; data: PortalContent[]; lastSync?: string }>(`/api/portal-content?all=${all}`),
  getDevelopmentWorks: (all = false) => request<{ success: boolean; data: DevelopmentWork[]; lastSync?: string }>(`/api/development-works?all=${all}`),
  getGramSabha: (all = false) => request<{ success: boolean; data: GramSabhaEntry[]; lastSync?: string }>(`/api/gram-sabha?all=${all}`),
  getGallery: (all = false) => request<{ success: boolean; data: GalleryItem[]; lastSync?: string }>(`/api/gallery?all=${all}`),
  getCategories: () => request<{ success: boolean; data: Category[] }>('/api/categories'),
  getOfficers: () => request<{ success: boolean; data: Officer[] }>('/api/officers'),
  getSettings: () => request<{ success: boolean; data: PortalSettings }>('/api/settings'),
  triggerSheetsSync: () => request<{ success: boolean; message: string; count?: any }>('/api/sheets/sync', { method: 'POST' }),
  getSheetsConnectionStatus: () =>
    request<{
      success: boolean;
      configured: boolean;
      connected: boolean;
      status: 'connected' | 'not_configured' | 'error';
      lastSync: string | null;
      lastSyncError: string | null;
      cachedCounts?: Record<string, number>;
      timestamp?: string;
    }>('/api/sheets/connection-status'),

  trackComplaint: (id: string) => request<{ success: boolean; data: any }>(`/api/complaints/track/${encodeURIComponent(id)}`),

  // Citizen Auth
  sendOtp: (mobile: string, name?: string) =>
    request<{ success: boolean; message: string; isDemoMode: boolean; demoOtp?: string; expiresInSeconds: number }>(
      '/api/auth/send-otp',
      { method: 'POST', body: JSON.stringify({ mobile, name }) }
    ),
  verifyOtp: (mobile: string, otp: string) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp })
    }),
  getMe: () => request<{ authenticated: boolean; user?: any }>('/api/auth/me'),

  // Admin Auth
  adminLogin: (username: string, password: string) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  // Citizen Actions
  submitComplaint: (payload: any) =>
    request<{ success: boolean; complaint_id: string; message: string; created_at: string; status: string }>(
      '/api/complaints',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  getMyComplaints: () => request<{ success: boolean; data: Complaint[] }>('/api/citizen/my-complaints'),
  submitCitizenFeedback: (id: string, payload: { feedback?: string; request_reopen?: boolean; reopen_reason?: string }) =>
    request<{ success: boolean; message: string }>(`/api/citizen/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin Actions
  getAdminComplaints: (params: { status?: string; category?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    return request<{ success: boolean; summary: any; data: Complaint[] }>(`/api/admin/complaints?${q.toString()}`);
  },
  updateComplaintStatus: (id: string, payload: any) =>
    request<{ success: boolean; message: string }>(`/api/admin/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  // Admin 9-Tab CMS Operations
  saveContent: (payload: Partial<PortalContent>) =>
    request<{ success: boolean; message: string; content_id?: string }>('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deleteContent: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/content/${id}`, {
      method: 'DELETE'
    }),

  saveDevelopmentWork: (payload: Partial<DevelopmentWork>) =>
    request<{ success: boolean; message: string; work_id?: string }>('/api/admin/development-works', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  saveGramSabha: (payload: Partial<GramSabhaEntry>) =>
    request<{ success: boolean; message: string; meeting_id?: string }>('/api/admin/gram-sabha', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  saveGallery: (payload: Partial<GalleryItem>) =>
    request<{ success: boolean; message: string; image_id?: string }>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  saveSettings: (payload: Partial<PortalSettings>) =>
    request<{ success: boolean; message: string }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAuditLogs: () => request<{ success: boolean; data: AdminAuditLog[] }>('/api/admin/audit-logs'),
  getSheetsStatus: () => request<SheetsSyncStatus>('/api/admin/sheets/status'),
  saveSheetsConfig: (scriptUrl: string, spreadsheetId?: string) =>
    request<{ success: boolean; message: string; warning?: string; syncCount?: any }>('/api/admin/sheets/config', {
      method: 'POST',
      body: JSON.stringify({ scriptUrl, spreadsheetId })
    }),
  getExportCsvUrl: () => '/api/admin/export/complaints.csv'
};
