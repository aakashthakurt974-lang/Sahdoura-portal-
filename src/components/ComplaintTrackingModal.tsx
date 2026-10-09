import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Printer,
  ChevronRight,
  MessageSquare,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

interface ComplaintTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt: (receiptData: any) => void;
  initialComplaintId?: string;
}

export const ComplaintTrackingModal: React.FC<ComplaintTrackingModalProps> = ({
  isOpen,
  onClose,
  onViewReceipt,
  initialComplaintId = ''
}) => {
  const { user } = useAuth();
  const [complaintId, setComplaintId] = useState(initialComplaintId);
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Citizen feedback / Reopen states
  const [feedbackText, setFeedbackText] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!complaintId.trim()) return;

    setError(null);
    setLoading(true);
    setComplaint(null);
    setActionSuccess(null);

    try {
      const res = await api.trackComplaint(complaintId.trim());
      setComplaint(res.data);
    } catch (err: any) {
      setError(err.message || 'शिकायत नहीं मिली।');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async () => {
    if (!complaint || !feedbackText.trim()) return;
    setSubmittingAction(true);
    try {
      await api.submitCitizenFeedback(complaint.complaint_id, {
        feedback: feedbackText.trim()
      });
      setActionSuccess('आपकी प्रतिक्रिया सफलतापूर्वक दर्ज कर ली गई है।');
      setFeedbackText('');
      // Refresh complaint data
      const res = await api.trackComplaint(complaint.complaint_id);
      setComplaint(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!complaint || !reopenReason.trim()) return;
    setSubmittingAction(true);
    try {
      await api.submitCitizenFeedback(complaint.complaint_id, {
        request_reopen: true,
        reopen_reason: reopenReason.trim()
      });
      setActionSuccess('शिकायत पुनः खोल दी गई है एवं नोडल अधिकारी को सूचित कर दिया गया है।');
      setReopenReason('');
      setShowReopenBox(false);
      // Refresh complaint data
      const res = await api.trackComplaint(complaint.complaint_id);
      setComplaint(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Status badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'निराकरण दर्ज':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'कार्रवाई प्रगति पर':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'संबंधित अधिकारी को भेजी गई':
      case 'प्रारंभिक जाँच':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'पुनः खोली गई':
        return 'bg-orange-50 text-orange-800 border-orange-300';
      case 'बंद':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">शिकायत की स्थिति ट्रैक करें</h3>
              <p className="text-[11px] text-blue-200">पारदर्शी जन-शिकायत निवारण प्रणाली</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="शिकायत क्रमांक दर्ज करें (उदा. SDGP-2026-000101)"
                className="w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              {complaintId && (
                <button
                  type="button"
                  onClick={() => setComplaintId('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>खोजें</span>
            </button>
          </form>

          {/* Quick Examples */}
          {!complaint && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800">त्वरित परीक्षण हेतु उदाहरण क्रमांक:</span>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                {['SDGP-2026-000101', 'SDGP-2026-000102', 'SDGP-2026-000103'].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setComplaintId(ex);
                      api.trackComplaint(ex).then((r) => setComplaint(r.data)).catch((e) => setError(e.message));
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded hover:border-blue-900 hover:text-blue-900 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Complaint Result */}
          {complaint && (
            <div className="space-y-6 pt-2">
              {/* Top Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base sm:text-lg text-blue-950">
                        {complaint.complaint_id}
                      </span>
                      <button
                        onClick={() => handleCopy(complaint.complaint_id)}
                        className="text-slate-400 hover:text-slate-700"
                        title="क्रमांक कॉपी करें"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      दिनांक: {new Date(complaint.created_at).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <button
                      onClick={() =>
                        onViewReceipt({
                          complaint_id: complaint.complaint_id,
                          created_at: complaint.created_at,
                          citizen_name: complaint.citizen_name,
                          mobile_masked: complaint.mobile_masked,
                          village: complaint.village,
                          ward_or_mohalla: complaint.ward_or_mohalla,
                          category: complaint.category,
                          subject: complaint.subject,
                          description: complaint.description,
                          assigned_department: complaint.assigned_department,
                          status: complaint.status
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>रसीद</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">शिकायतकर्ता: </span>
                    <span className="font-medium text-slate-900">{complaint.citizen_name} ({complaint.mobile_masked})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">श्रेणी: </span>
                    <span className="font-medium text-slate-900">{complaint.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">स्थान: </span>
                    <span className="font-medium text-slate-900">{complaint.ward_or_mohalla}, {complaint.village}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">संबंधित विभाग: </span>
                    <span className="font-medium text-slate-900">{complaint.assigned_department}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">विषय: {complaint.subject}</span>
                  <p className="text-slate-600 bg-white p-2 rounded border border-slate-100">
                    {complaint.description}
                  </p>
                </div>

                {complaint.public_remark && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-blue-900">सार्वजनिक आधिकारिक टिप्पणी / निराकरण विवरण:</span>
                    <p className="text-blue-950 font-medium">{complaint.public_remark}</p>
                  </div>
                )}
              </div>

              {/* Chronological Action History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  कार्रवाई का पूरा इतिहास (Timeline History)
                </h4>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {complaint.history?.map((h: any, idx: number) => (
                    <div key={h.history_id || idx} className="relative pl-8 text-xs">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900">{h.action_by}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(h.timestamp).toLocaleString('hi-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="text-slate-700">
                          स्थिति: <span className="font-semibold">{h.new_status}</span>
                        </div>
                        <p className="text-slate-600 italic bg-white p-1.5 rounded border border-slate-100">
                          "{h.public_comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Feedback or Reopen Action */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    शिकायतकर्ता की प्रतिक्रिया / संतुष्टि स्तर
                  </h4>
                  {complaint.status === 'निराकरण दर्ज' && !showReopenBox && (
                    <button
                      onClick={() => setShowReopenBox(true)}
                      className="text-xs text-amber-800 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>निराकरण से असंतुष्ट? शिकायत पुनः खोलें</span>
                    </button>
                  )}
                </div>

                {complaint.citizen_feedback && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <span className="font-semibold text-slate-700">पूर्व में दी गई प्रतिक्रिया:</span>
                    <p className="text-slate-800 mt-0.5">{complaint.citizen_feedback}</p>
                  </div>
                )}

                {/* Feedback Input if citizen logged in */}
                {user && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="अपनी टिप्पणी या समाधान पर संतुष्टि लिखें..."
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-800"
                      />
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={submittingAction || !feedbackText.trim()}
                        className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-50"
                      >
                        दर्ज करें
                      </button>
                    </div>

                    {showReopenBox && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs">
                        <span className="font-bold text-amber-900">
                          पुनः खोलने का कारण दर्ज करें:
                        </span>
                        <textarea
                          rows={2}
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="कारण स्पष्ट करें कि आप समाधान से संतुष्ट क्यों नहीं हैं..."
                          className="w-full p-2 border border-amber-300 rounded bg-white text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowReopenBox(false)}
                            className="px-2 py-1 text-slate-600 hover:bg-amber-100 rounded text-xs"
                          >
                            रद्द करें
                          </button>
                          <button
                            onClick={handleReopenSubmit}
                            disabled={submittingAction || !reopenReason.trim()}
                            className="px-3 py-1 bg-amber-800 text-white rounded text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                          >
                            शिकायत पुनः खोलें
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
