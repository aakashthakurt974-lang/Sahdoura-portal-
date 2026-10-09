import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Category, Officer } from '../types/index.ts';
import { X, Send, AlertCircle, CheckCircle2, Upload, Paperclip, ShieldCheck, RefreshCw } from 'lucide-react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receiptData: any) => void;
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, isAuthenticated, openOtpModal } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [citizenName, setCitizenName] = useState(user?.displayName || '');
  const [ward, setWard] = useState('वार्ड क्र. 01');
  const [address, setAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [schemeOrWork, setSchemeOrWork] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentData, setAttachmentData] = useState<string | null>(null);
  const [declaration, setDeclaration] = useState(false);

  // Suggested department
  const [assignedDept, setAssignedDept] = useState('');
  const [assignedOfficerId, setAssignedOfficerId] = useState('');

  useEffect(() => {
    if (user?.displayName && !citizenName) {
      setCitizenName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadInitialMetadata();
    }
  }, [isOpen]);

  const loadInitialMetadata = async () => {
    try {
      const [catRes, offRes] = await Promise.all([api.getCategories(), api.getOfficers()]);
      if (catRes.success && catRes.data.length > 0) {
        setCategories(catRes.data);
        setSelectedCategory(catRes.data[0].category_name);
        setAssignedDept(catRes.data[0].default_department);
        setAssignedOfficerId(catRes.data[0].default_officer_id);
      }
      if (offRes.success) {
        setOfficers(offRes.data);
      }
    } catch (err) {
      console.error('Failed to load categories/officers:', err);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    const cat = categories.find((c) => c.category_name === val);
    if (cat) {
      setAssignedDept(cat.default_department);
      setAssignedOfficerId(cat.default_officer_id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('फ़ाइल का आकार 5MB से कम होना चाहिए।');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      openOtpModal();
      return;
    }

    if (!declaration) {
      setError('कृपया घोषणा पत्र चेकबॉक्स पर टिक करके सहमति दें।');
      return;
    }

    if (!citizenName.trim() || !ward.trim() || !subject.trim() || !description.trim()) {
      setError('कृपया सभी अनिवार्य (*) फ़ील्ड भरें।');
      return;
    }

    setLoading(true);

    try {
      const idempotencyKey = `SUBMIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = {
        citizen_name: citizenName.trim(),
        village: 'सैदौरा',
        ward_or_mohalla: ward,
        address: address.trim(),
        category: selectedCategory,
        subject: subject.trim(),
        description: description.trim(),
        location: incidentLocation.trim() || ward,
        assigned_department: assignedDept,
        assigned_officer_id: assignedOfficerId,
        scheme_or_work: schemeOrWork.trim(),
        attachment_reference: attachmentData ? attachmentName : undefined,
        declaration_agreed: true,
        idempotency_key: idempotencyKey
      };

      const res = await api.submitComplaint(payload);

      // Prepare receipt data
      const receipt = {
        complaint_id: res.complaint_id,
        created_at: res.created_at,
        citizen_name: payload.citizen_name,
        mobile_masked: user?.mobileMasked || '******',
        village: 'सैदौरा',
        ward_or_mohalla: payload.ward_or_mohalla,
        category: payload.category,
        subject: payload.subject,
        description: payload.description,
        assigned_department: payload.assigned_department,
        status: res.status
      };

      onClose();
      onSuccess(receipt);
    } catch (err: any) {
      setError(err.message || 'शिकायत दर्ज करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg">नई जन-शिकायत दर्ज करें</h3>
            <p className="text-xs text-blue-200">ग्राम पंचायत सैदौरा · जन-सेवा पोर्टल</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              शिकायत दर्ज करने हेतु मोबाइल सत्यापन आवश्यक है
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              पारदर्शिता और सही निगरानी के लिए, शिकायत दर्ज करने से पहले कृपया अपने 10 अंकों के मोबाइल नंबर पर त्वरित OTP प्राप्त करें।
            </p>
            <button
              onClick={() => {
                onClose();
                openOtpModal();
              }}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <span>मोबाइल OTP से लॉगिन करें</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-600">सत्यापित नागरिक खाता:</span>
              <span className="font-mono font-semibold text-blue-900">
                {user?.mobileMasked} ({user?.displayName || 'नागरिक'})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  शिकायतकर्ता का नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="अपना पूरा नाम लिखें"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  गाँव / पंचायत
                </label>
                <input
                  type="text"
                  readOnly
                  value="सैदौरा (जनपद दतिया)"
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  वार्ड / मोहल्ला <span className="text-red-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                >
                  <option value="वार्ड क्र. 01">वार्ड क्र. 01</option>
                  <option value="वार्ड क्र. 02">वार्ड क्र. 02</option>
                  <option value="वार्ड क्र. 03 (कुशवाहा मोहल्ला)">वार्ड क्र. 03 (कुशवाहा मोहल्ला)</option>
                  <option value="वार्ड क्र. 04">वार्ड क्र. 04</option>
                  <option value="वार्ड क्र. 05 (माता मंदिर मार्ग)">वार्ड क्र. 05 (माता मंदिर मार्ग)</option>
                  <option value="वार्ड क्र. 06">वार्ड क्र. 06</option>
                  <option value="अन्य / मुख्य बस्ती">अन्य / मुख्य बस्ती</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  स्थान / निकटतम पहचान (Landmark)
                </label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="उदा. प्राथमिक शाला के पास / पंचायत भवन के सामने"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                शिकायत की श्रेणी <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                संबंधित नोडल विभाग: <span className="font-medium text-slate-700">{assignedDept}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                शिकायत का विषय <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="उदा. हैंडपंप से गंदा पानी आना अथवा बंद स्ट्रीट लाइट की मरम्मत"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                शिकायत का पूरा विवरण <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="समस्या का पूरा विवरण लिखें - कब से समस्या है, क्या परेशानी हो रही है..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Optional Scheme or Work */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संबंधित योजना / विकास कार्य (यदि लागू हो)
              </label>
              <input
                type="text"
                value={schemeOrWork}
                onChange={(e) => setSchemeOrWork(e.target.value)}
                placeholder="उदा. स्वच्छ भारत मिशन / 15वाँ वित्त आयोग / लाड़ली बहना"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Document/Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संबंधित फोटो या दस्तावेज संलग्न करें (वैकल्पिक, अधिकतम 5MB)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>फ़ाइल चुनें</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {attachmentName && (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-blue-900" />
                    <span className="truncate max-w-[200px]">{attachmentName}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  मैं घोषणा करता/करती हूँ कि मेरे द्वारा दी गई जानकारी मेरे संज्ञान में पूर्णतः सत्य है। किसी असत्य अथवा भ्रामक तथ्य के लिए मैं स्वयं उत्तरदायी रहूँगा/रहूँगी।
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>शिकायत दर्ज करें (Submit)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
