import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Complaint, Category, Officer, AdminAuditLog, PortalContent } from '../../types/index.ts';
import {
  Shield,
  Layers,
  FileSpreadsheet,
  History,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Download,
  Link,
  ChevronRight,
  X,
  Copy,
  Check,
  Radio,
  Database,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'complaints' | 'content' | 'audit' | 'sheets'>('complaints');

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    received: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    reopened: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Selected Complaint for Edit Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [publicRemark, setPublicRemark] = useState('');
  const [internalRemark, setInternalRemark] = useState('');
  const [assignedDept, setAssignedDept] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Content CMS State
  const [portalContent, setPortalContent] = useState<PortalContent[]>([]);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentFormData, setContentFormData] = useState<Partial<PortalContent>>({
    content_type: 'पंचायत की खबर',
    title: '',
    description: '',
    category: 'सामान्य',
    status: 'सक्रिय',
    published: true,
    display_order: 1,
    source: 'ग्राम पंचायत सैदौरा'
  });

  // Additional 9-tab items counts
  const [worksCount, setWorksCount] = useState(0);
  const [sabhaCount, setSabhaCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Google Sheets Config State
  const [sheetsConfig, setSheetsConfig] = useState<any>({
    configured: false,
    scriptUrl: '',
    lastSync: null
  });
  const [scriptUrlInput, setScriptUrlInput] = useState('');
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');
  const [savingSheets, setSavingSheets] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsFeedback, setSheetsFeedback] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes, offRes, contRes, audRes, sheetRes, worksRes, sabhaRes, galleryRes] = await Promise.all([
        api.getAdminComplaints({ search, status: statusFilter, category: categoryFilter }),
        api.getCategories(),
        api.getOfficers(),
        api.getPortalContent(true),
        api.getAuditLogs(),
        api.getSheetsStatus(),
        api.getDevelopmentWorks(true),
        api.getGramSabha(true),
        api.getGallery(true)
      ]);

      if (compRes.success) {
        setComplaints(compRes.data);
        setSummary(compRes.summary);
      }
      if (catRes.success) setCategories(catRes.data);
      if (offRes.success) setOfficers(offRes.data);
      if (contRes.success) setPortalContent(contRes.data);
      if (audRes.success) setAuditLogs(audRes.data);
      if (worksRes.success) setWorksCount(worksRes.data.length);
      if (sabhaRes.success) setSabhaCount(sabhaRes.data.length);
      if (galleryRes.success) setGalleryCount(galleryRes.data.length);

      if (sheetRes) {
        setSheetsConfig(sheetRes);
        setScriptUrlInput(sheetRes.scriptUrl || '');
        setSpreadsheetIdInput(sheetRes.spreadsheetId || '');
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [statusFilter, categoryFilter]);

  const handleSyncNow = async () => {
    setIsSyncingSheets(true);
    setSheetsFeedback(null);
    try {
      const res = await api.triggerSheetsSync();
      if (res.success) {
        setSheetsFeedback(res.message);
        await loadAllData();
      } else {
        setSheetsFeedback(res.message);
      }
    } catch (err: any) {
      setSheetsFeedback(`सिंक विफलता: ${err.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCopyWebhook = () => {
    const webhookUrl = `${window.location.origin}/api/sheets/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleCopyScript = () => {
    // Provide instructions to copy from the repository file
    fetch('/scripts/google-apps-script-code.gs')
      .then((r) => r.text())
      .then((code) => {
        navigator.clipboard.writeText(code);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2500);
      })
      .catch(() => {
        setSheetsFeedback('scripts/google-apps-script-code.gs फ़ाइल से कोड सीधे कॉपी करें।');
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAllData();
  };

  const openEditModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setPublicRemark(c.public_remark || '');
    setInternalRemark(c.internal_remark || '');
    setAssignedDept(c.assigned_department || '');
    setAssignedOfficer(c.assigned_officer_id || '');
    setUpdateMsg(null);
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.updateComplaintStatus(selectedComplaint.complaint_id, {
        status: newStatus,
        public_remark: publicRemark,
        internal_remark: internalRemark,
        assigned_department: assignedDept,
        assigned_officer_id: assignedOfficer
      });
      setUpdateMsg('शिकायत की स्थिति एवं विवरण सफलतापूर्वक अपडेट हो गया!');
      setTimeout(() => {
        setSelectedComplaint(null);
        loadAllData();
      }, 1000);
    } catch (err: any) {
      setUpdateMsg(`त्रुटि: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveContent(contentFormData);
      setShowContentModal(false);
      setContentFormData({
        content_type: 'पंचायत की खबर',
        title: '',
        description: '',
        category: 'सामान्य',
        status: 'सक्रिय',
        published: true,
        display_order: 1,
        source: 'ग्राम पंचायत सैदौरा'
      });
      loadAllData();
    } catch (err: any) {
      alert(`त्रुटि: ${err.message}`);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('क्या आप निश्चित हैं कि यह सामग्री हटाना चाहते हैं?')) return;
    try {
      await api.deleteContent(id);
      loadAllData();
    } catch (err: any) {
      alert(`त्रुटि: ${err.message}`);
    }
  };

  const handleSaveSheetsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSheets(true);
    setSheetsFeedback(null);
    try {
      const res = await api.saveSheetsConfig(scriptUrlInput.trim(), spreadsheetIdInput.trim());
      if (res.success) {
        setSheetsFeedback('Google Sheets Web App URL एवं Spreadsheet ID सफलतापूर्वक सहेजी गई और डेटा सिंक हो गया!');
      } else if (res.warning) {
        setSheetsFeedback(res.warning);
      }
      const st = await api.getSheetsStatus();
      setSheetsConfig(st);
      await loadAllData();
    } catch (err: any) {
      setSheetsFeedback(`त्रुटि: ${err.message}`);
    } finally {
      setSavingSheets(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>ग्राम पंचायत सैदौरा · आधिकारिक प्रशासनिक कंसोल</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            जन-शिकायत निवारण एवं पोर्टल नियंत्रण
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            लॉगिन: {user?.displayName} ({user?.userId})
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {sheetsConfig.configured && (
            <button
              onClick={handleSyncNow}
              disabled={isSyncingSheets}
              className="px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Google Sheets से तुरंत ताज़ा डेटा प्राप्त करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'सिंक...' : 'Sheets सिंक'}</span>
            </button>
          )}
          <a
            href={api.getExportCsvUrl()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>शिकायतें CSV एक्सपोर्ट</span>
          </a>
          <button
            onClick={loadAllData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="रिफ्रेश"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">कुल शिकायतें</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {summary.total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">नई (प्राप्त हुई)</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {summary.received}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">जाँच / अग्रेषित</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1 tabular-nums">
            {summary.underReview}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">प्रगतिरत कार्य</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
            {summary.inProgress}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">सफल निराकृत</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {summary.resolved}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">पुनः खोली गई</div>
          <div className="text-2xl font-bold font-mono text-orange-600 mt-1 tabular-nums">
            {summary.reopened}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          शिकायत प्रबंधन ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          पोर्टल सामग्री CMS ({portalContent.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ऑडिट लॉग्स (Audit Trail)
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'sheets'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Google Sheets लाइव सिंक
        </button>
      </div>

      {/* TAB 1: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="खोजें: क्रमांक, शिकायतकर्ता, वार्ड, या विषय..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800"
              >
                खोजें
              </button>
            </form>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">सभी स्थितियाँ</option>
                <option value="प्राप्त हुई">प्राप्त हुई</option>
                <option value="प्रारंभिक जाँच">प्रारंभिक जाँच</option>
                <option value="संबंधित अधिकारी को भेजी गई">संबंधित अधिकारी को भेजी गई</option>
                <option value="कार्रवाई प्रगति पर">कार्रवाई प्रगति पर</option>
                <option value="निराकरण दर्ज">निराकरण दर्ज</option>
                <option value="पुनः खोली गई">पुनः खोली गई</option>
                <option value="बंद">बंद</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white max-w-[180px] truncate"
              >
                <option value="all">सभी श्रेणियाँ</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_name}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">शिकायत क्रमांक</th>
                    <th className="py-3 px-4">दिनांक</th>
                    <th className="py-3 px-4">शिकायतकर्ता</th>
                    <th className="py-3 px-4">श्रेणी व विषय</th>
                    <th className="py-3 px-4">वार्ड / स्थान</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        कोई शिकायत नहीं मिली।
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.complaint_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                          {c.complaint_id}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {c.citizen_name}
                          <span className="block text-[11px] font-mono text-slate-400">
                            {c.verified_mobile_reference}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="text-[11px] font-semibold text-blue-800 block">
                            {c.category}
                          </span>
                          <span className="text-slate-800 truncate block">
                            {c.subject}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {c.ward_or_mohalla}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(c)}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <span>संपादित / स्थिति बदलें</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL CONTENT CMS */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              वेबसाइट सामग्री प्रबंधन (Portal Content Management)
            </h2>
            <button
              onClick={() => {
                setContentFormData({
                  content_type: 'पंचायत की खबर',
                  title: '',
                  description: '',
                  category: 'सामान्य',
                  status: 'सक्रिय',
                  published: true,
                  display_order: portalContent.length + 1,
                  source: 'ग्राम पंचायत सैदौरा'
                });
                setShowContentModal(true);
              }}
              className="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>नई सामग्री जोड़ें</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">प्रकार</th>
                  <th className="py-3 px-4">शीर्षक</th>
                  <th className="py-3 px-4">श्रेणी</th>
                  <th className="py-3 px-4">स्थिति</th>
                  <th className="py-3 px-4">स्रोत</th>
                  <th className="py-3 px-4 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portalContent.map((item) => (
                  <tr key={item.content_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-blue-900 whitespace-nowrap">
                      {item.content_type}
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-900 font-medium">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">{item.source}</td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setContentFormData(item);
                          setShowContentModal(true);
                        }}
                        className="p-1 text-slate-600 hover:text-blue-900"
                        title="संपादित करें"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item.content_id)}
                        className="p-1 text-slate-400 hover:text-red-700"
                        title="हटाएँ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-900" />
              <span>प्रशासकीय गतिविधि ऑडिट ट्रेल (Admin Audit Log)</span>
            </h2>
            <span className="text-xs text-slate-500">
              कुल प्रविष्टियाँ: {auditLogs.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.audit_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action_type}
                    </span>
                    <span className="text-slate-500">द्वारा: <strong>{log.actor_id}</strong></span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-400">{log.record_id}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.change_summary}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('hi-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE SHEETS LIVE CONNECTOR & 9-TAB CMS */}
      {activeTab === 'sheets' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Google Sheets 9-Tab CMS एवं ऑटो-सिंक नियंत्रण
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Google Sheets को पोर्टल का प्राथमिक डेटाबेस बनाकर सामग्री, विकास कार्य, शिकायतें और सेटिंग्स वास्तविक समय में नियंत्रित करें।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncingSheets || !sheetsConfig.configured}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                <span>{isSyncingSheets ? 'सिंक हो रहा है...' : 'Google Sheets से अभी सिंक करें'}</span>
              </button>
            </div>
          </div>

          {/* Connection Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-slate-500 block">वर्तमान कनेक्शन स्थिति:</span>
                <span className="font-bold text-base inline-flex items-center gap-1.5 mt-0.5 text-slate-900">
                  {sheetsConfig.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-800">सक्रिय एवं कनेक्टेड (Google Sheets Connected)</span>
                    </>
                  ) : sheetsConfig.status === 'error' ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800">कनेक्शन त्रुटि / शीट लिंक अपेक्षित (Attention Required)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700">अभी कॉन्फ़िगर नहीं है (स्थानीय बैकअप डेटा सक्रिय)</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-600 text-xs">
                {sheetsConfig.lastSync && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">अंतिम सफल सिंक समय:</span>
                    <span className="font-mono font-medium">{new Date(sheetsConfig.lastSync).toLocaleString('hi-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* If error status or message present */}
            {sheetsConfig.errorMessage && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 animate-fade-in">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Google Sheets सिंक सूचना:</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-sans">{sheetsConfig.errorMessage}</p>
                <div className="text-[11px] text-amber-700 bg-white/70 p-2 rounded border border-amber-200 mt-1">
                  💡 <strong>त्वरित समाधान:</strong> यदि आपने Apps Script सीधे <code>script.google.com</code> से बनाई है, तो नीचे दिए गए <strong>"Google Spreadsheet ID"</strong> फ़ील्ड में अपनी शीट की ID (या शीट का पूरा URL) पेस्ट करें और सहेजें। अथवा Google Sheet के अंदर मेन्यू में <code>Extensions &gt; Apps Script</code> खोलकर वहाँ कोड पेस्ट करें।
                </div>
              </div>
            )}
          </div>

          {sheetsFeedback && (
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{sheetsFeedback}</span>
              </div>
              <button onClick={() => setSheetsFeedback(null)} className="text-blue-500 hover:text-blue-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 9 Tabs Overview Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-900" />
              <span>Google Spreadsheet के सभी 9 Tabs एवं वर्तमान स्थिति:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Tab 1 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>1. PortalContent</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded font-mono text-[11px] font-bold">
                    {portalContent.length} रिकॉर्ड
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  पंचायत समाचार, सरकारी योजनाएँ, सामान्य सूचनाएँ व सार्वजनिक FAQ
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  content_id, content_type, title, description, category, published...
                </div>
              </div>

              {/* Tab 2 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>2. DevelopmentWorks</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded font-mono text-[11px] font-bold">
                    {worksCount} रिकॉर्ड
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  गाँव के विकास व निर्माण कार्य, बजट स्वीकृति, व्यय व पूर्णता स्थिति
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  work_id, work_name, location, budget_allocated, current_status...
                </div>
              </div>

              {/* Tab 3 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>3. GramSabha</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-mono text-[11px] font-bold">
                    {sabhaCount} रिकॉर्ड
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  ग्राम सभा की आगामी बैठकें, एजेंडा, स्थान एवं विगत सार्वजनिक निर्णय
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  meeting_id, meeting_type, meeting_date, venue, agenda, status...
                </div>
              </div>

              {/* Tab 4 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>4. Gallery</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-900 rounded font-mono text-[11px] font-bold">
                    {galleryCount} रिकॉर्ड
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  गाँव की फोटो गैलरी (Google Drive शेयर लिंक स्वतः वेब इमेज में बदलती है)
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  image_id, title, description, image_url, category, upload_date...
                </div>
              </div>

              {/* Tab 5 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>5. Categories</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px] font-bold">
                    {categories.length} श्रेणियाँ
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  शिकायत की श्रेणियाँ (पेयजल, सड़क, स्ट्रीट लाइट, आवास, पेंशन आदि)
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  category_id, category_name, description, default_department, active...
                </div>
              </div>

              {/* Tab 6 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>6. Officers</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px] font-bold">
                    {officers.length} अधिकारी
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  पंचायत प्रतिनिधि एवं प्रशासनिक अधिकारी (सरपंच, सचिव, नोडल)
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  officer_id, officer_name, designation, department, public_contact...
                </div>
              </div>

              {/* Tab 7 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>7. Complaints</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-900 rounded font-mono text-[11px] font-bold">
                    {complaints.length} शिकायतें
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  नागरिकों द्वारा दर्ज की गई सभी शिकायतें एवं वर्तमान स्थिति
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  complaint_id, citizen_name, category, subject, status, public_remark...
                </div>
              </div>

              {/* Tab 8 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>8. ComplaintHistory</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px] font-bold">
                    सक्रिय ट्रेल
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  शिकायत पर प्रत्येक कार्रवाई, स्थिति बदलाव व सार्वजनिक टिप्पणी का इतिहास
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  history_id, complaint_id, timestamp, old_status, new_status, action_by...
                </div>
              </div>

              {/* Tab 9 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>9. Settings</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded font-mono text-[11px] font-bold">
                    पोर्टल सेटिंग्स
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  पोर्टल शीर्षक, टैगलाइन, पंचायत नाम, आपातकालीन हेल्पलाइन व मुख्य सूचना
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  portal_title_hi, tagline_hi, marquee_notice, cm_helpline...
                </div>
              </div>
            </div>
          </div>

          {/* Web App URL Form & Webhook info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Left: Web App URL Configuration */}
            <form onSubmit={handleSaveSheetsConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Google Apps Script Web App URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Google Sheet के Apps Script डिप्लॉयमेंट से प्राप्त <code className="text-blue-900 font-bold">/exec</code> लिंक यहाँ पेस्ट करें।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Google Spreadsheet ID / Link <span className="text-slate-400 font-normal">(यदि Standalone Script उपयोग कर रहे हैं)</span>
                </label>
                <input
                  type="text"
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  placeholder="उदा. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms या शीट URL"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  यदि आपकी Apps Script स्प्रेडशीट के अंदर नहीं बनी है, तो अपनी Sheet का ID यहाँ डालें।
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingSheets}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savingSheets ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                  <span>सत्यापित करें एवं सहेजें</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncingSheets || !scriptUrlInput}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'सिंक हो रहा है...' : 'अभी सिंक करें (Sync Now)'}</span>
                </button>
              </div>
            </form>

            {/* Right: Instant Webhook & Script Code copy */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-1">
                  पोर्टल इंस्टेंट Webhook URL (त्वरित सिंक हेतु):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/sheets/webhook`}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-[11px] text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold rounded inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? 'कॉपी हो गया!' : 'कॉपी करें'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Google Sheet के Settings टैब के <code className="bg-slate-200 px-1 rounded">portal_webhook_url</code> कॉलम में यह लिंक पेस्ट करें ताकि सेल एडिट होते ही पोर्टल अपडेट हो जाए!
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Google Apps Script फ़ाइल:</span>
                  <span className="text-[11px] text-slate-500">scripts/google-apps-script-code.gs</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-blue-900 text-white hover:bg-blue-800 font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'कोड कॉपी हो गया!' : 'स्क्रिप्ट कोड कॉपी करें'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Setup Guide for User */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Google Sheet में तैनात करने का त्वरित तरीका (Step-by-Step Deployment Guide):
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <li>
                एक नया Google Spreadsheet बनाएँ और नाम दें: <strong>Saidoura_Panchayat_CMS</strong>
              </li>
              <li>
                ऊपर मेन्यू में <strong>Extensions (एक्सटेंशन) &gt; Apps Script</strong> खोलें।
              </li>
              <li>
                प्रोजेक्ट में स्थित फ़ाइल <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">scripts/google-apps-script-code.gs</code> का पूरा कोड कॉपी करके Apps Script एडिटर में पेस्ट करें (Ctrl+A, Ctrl+V, Ctrl+S)।
              </li>
              <li>
                Apps Script में फ़ंक्शन ड्रॉपडाउन से <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">setupAllSheets</code> चुनें और <strong>Run (चलाएँ)</strong> पर क्लिक करें। यह सभी 9 शीट्स एवं हेडर कॉलम स्वतः तैयार व प्रारंभिक डेटा से भर देगा।
              </li>
              <li>
                ऊपर <strong>Deploy (तैनात करें) &gt; New deployment (नई तैनाती)</strong> चुनें।
              </li>
              <li>
                गियर आइकन से <strong>Web app</strong> चुनें। <strong>Execute as:</strong> "Me" और <strong>Who has access:</strong> "Anyone" रखें और Deploy करें।
              </li>
              <li>
                मिली हुई Web App URL को ऊपर के बॉक्स में पेस्ट करके <strong>'सत्यापित करें एवं सहेजें'</strong> पर क्लिक करें।
              </li>
              <li>
                <strong>ऑटो-सिंक (बिना देरी के अपडेट):</strong> अपनी Google Sheet में मेन्यू बार में देखें, वहाँ <strong>'सैदौरा पोर्टल 🚀'</strong> मेन्यू दिखेगा। उसमें <strong>'ऑटो-सिंक ट्रिगर सक्रिय करें'</strong> पर क्लिक करें। अब शीट में कुछ भी बदलते ही वेबसाइट तुरंत अपडेट हो जाएगी!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Edit Complaint Drawer/Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">शिकायत कार्रवाई एवं स्थिति अद्यतन</h3>
                <p className="text-xs text-blue-200 font-mono">{selectedComplaint.complaint_id}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateComplaint} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {updateMsg && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-900 text-xs">
                  {updateMsg}
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div><strong>शिकायतकर्ता:</strong> {selectedComplaint.citizen_name} ({selectedComplaint.verified_mobile_reference})</div>
                <div><strong>विषय:</strong> {selectedComplaint.subject}</div>
                <div><strong>श्रेणी:</strong> {selectedComplaint.category} · {selectedComplaint.ward_or_mohalla}</div>
                <div className="pt-1 text-slate-600"><strong>विवरण:</strong> {selectedComplaint.description}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  नई स्थिति (Complaint Status) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                >
                  <option value="प्राप्त हुई">प्राप्त हुई</option>
                  <option value="प्रारंभिक जाँच">प्रारंभिक जाँच</option>
                  <option value="संबंधित अधिकारी को भेजी गई">संबंधित अधिकारी को भेजी गई</option>
                  <option value="कार्रवाई प्रगति पर">कार्रवाई प्रगति पर</option>
                  <option value="अतिरिक्त जानकारी आवश्यक">अतिरिक्त जानकारी आवश्यक</option>
                  <option value="समाधान प्रस्तावित">समाधान प्रस्तावित</option>
                  <option value="निराकरण दर्ज">निराकरण दर्ज (Resolved)</option>
                  <option value="पुनः खोली गई">पुनः खोली गई</option>
                  <option value="बंद">बंद (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सार्वजनिक टिप्पणी (नागरिक को दिखने वाली) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={publicRemark}
                  onChange={(e) => setPublicRemark(e.target.value)}
                  placeholder="नागरिक को सूचित करने हेतु स्पष्ट प्रगति या निराकरण टिप्पणी लिखें..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  आंतरिक टिप्पणी (केवल एडमिन व नोडल हेतु गोपनीय)
                </label>
                <textarea
                  rows={2}
                  value={internalRemark}
                  onChange={(e) => setInternalRemark(e.target.value)}
                  placeholder="आंतरिक पत्राचार, उपयंत्री निर्देश, बिल संख्या या निरीक्षण विवरण..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    संबंधित विभाग
                  </label>
                  <input
                    type="text"
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    असाइन अधिकारी
                  </label>
                  <select
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {officers.map((o) => (
                      <option key={o.officer_id} value={o.officer_id}>
                        {o.officer_name} ({o.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>स्थिति सहेजें एवं अपडेट करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Add/Edit Modal */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">पोर्टल सामग्री जोड़ें / संपादित करें</h3>
              <button onClick={() => setShowContentModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">सामग्री प्रकार</label>
                <select
                  value={contentFormData.content_type}
                  onChange={(e) => setContentFormData({ ...contentFormData, content_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="पंचायत की खबर">पंचायत की खबर</option>
                  <option value="विकास कार्य">विकास कार्य (प्रगतिरत)</option>
                  <option value="पूर्ण हुआ कार्य">पूर्ण हुआ कार्य</option>
                  <option value="सरकारी योजना">सरकारी योजना</option>
                  <option value="ग्राम सभा की सूचना">ग्राम सभा की सूचना</option>
                  <option value="ग्राम सभा का निर्णय">ग्राम सभा का निर्णय</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">शीर्षक <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={contentFormData.title}
                  onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">विवरण <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={contentFormData.description}
                  onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">श्रेणी</label>
                  <input
                    type="text"
                    value={contentFormData.category}
                    onChange={(e) => setContentFormData({ ...contentFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">स्रोत</label>
                  <input
                    type="text"
                    value={contentFormData.source}
                    onChange={(e) => setContentFormData({ ...contentFormData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowContentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  सहेजें (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
