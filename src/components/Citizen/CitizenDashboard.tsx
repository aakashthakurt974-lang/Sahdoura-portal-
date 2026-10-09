import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Complaint } from '../../types/index.ts';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';

interface CitizenDashboardProps {
  onOpenComplaintForm: () => void;
  onTrackComplaint: (id: string) => void;
  onViewReceipt: (receiptData: any) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenComplaintForm,
  onTrackComplaint,
  onViewReceipt
}) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyComplaints();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'शिकायतें लोड करने में समस्या हुई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-900 block mb-1">
            नागरिक स्व-सेवा डैशबोर्ड
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            नमस्ते, {user?.displayName || 'नागरिक'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            पंजीकृत मोबाइल: <strong className="font-mono text-slate-700">{user?.mobileMasked}</strong> · ग्राम पंचायत सैदौरा
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadComplaints}
            className="p-2.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenComplaintForm}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नई शिकायत दर्ज करें</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-base font-bold text-slate-900">
            मेरे द्वारा दर्ज की गई जन-शिकायतें ({complaints.length})
          </h2>
          <span className="text-xs text-slate-500">
            वास्तविक समय अद्यतन स्थिति
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-900" />
            <span>आपकी शिकायतें लोड हो रही हैं...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">
              आपने अभी तक कोई शिकायत दर्ज नहीं की है
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              यदि गाँव में पेयजल, सड़क, सफाई अथवा योजनाओं से संबंधित कोई समस्या है, तो आप निसंकोच शिकायत दर्ज कर सकते हैं।
            </p>
            <button
              onClick={onOpenComplaintForm}
              className="mt-2 px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
            >
              + पहली शिकायत दर्ज करें
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div
                key={c.complaint_id}
                className="py-4 hover:bg-slate-50/70 transition-colors rounded-lg px-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.complaint_id}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {c.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(c.created_at).toLocaleDateString('hi-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {c.subject}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
                    {c.description}
                  </p>

                  {c.public_remark && (
                    <div className="text-[11px] text-blue-900 bg-blue-50/60 p-2 rounded border border-blue-100/80">
                      <strong>अधिकारी टिप्पणी:</strong> {c.public_remark}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {c.status}
                  </span>

                  <button
                    onClick={() =>
                      onViewReceipt({
                        complaint_id: c.complaint_id,
                        created_at: c.created_at,
                        citizen_name: c.citizen_name,
                        mobile_masked: user?.mobileMasked || '******',
                        village: c.village,
                        ward_or_mohalla: c.ward_or_mohalla,
                        category: c.category,
                        subject: c.subject,
                        description: c.description,
                        assigned_department: c.assigned_department,
                        status: c.status
                      })
                    }
                    className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                    title="रसीद देखें व प्रिंट करें"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onTrackComplaint(c.complaint_id)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors inline-flex items-center gap-1"
                  >
                    <span>विस्तार से ट्रैक करें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
