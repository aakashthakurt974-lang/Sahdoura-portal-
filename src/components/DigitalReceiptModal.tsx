import React, { useState } from 'react';
import { X, Printer, Copy, Check, ShieldCheck, Calendar, MapPin, Tag } from 'lucide-react';

interface DigitalReceiptProps {
  receiptData: {
    complaint_id: string;
    created_at: string;
    citizen_name: string;
    mobile_masked: string;
    village: string;
    ward_or_mohalla: string;
    category: string;
    subject: string;
    description: string;
    assigned_department?: string;
    status: string;
  } | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptProps> = ({ receiptData, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!receiptData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptData.complaint_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receiptData.created_at).toLocaleString('hi-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">शिकायत डिजिटल अभिस्वीकृति (Receipt)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt Card */}
        <div className="p-6 sm:p-8 bg-white print-area space-y-6 text-slate-800">
          {/* Header of Receipt */}
          <div className="text-center border-b-2 border-slate-900/80 pb-4">
            <div className="inline-block px-3 py-0.5 bg-blue-900 text-white text-[11px] font-bold rounded mb-1">
              ग्राम पंचायत सैदौरा · जन-सेवा पोर्टल
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              जन-शिकायत पावती / डिजिटल रसीद
            </h2>
            <div className="text-xs text-slate-600 mt-0.5">
              जनपद पंचायत दतिया · जिला दतिया · मध्य प्रदेश
            </div>
          </div>

          {/* Key Reference Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                शिकायत क्रमांक (Complaint ID)
              </span>
              <span className="text-xl font-bold font-mono text-blue-950 tracking-wider">
                {receiptData.complaint_id}
              </span>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हो गया' : 'क्रमांक कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
            <div>
              <span className="text-slate-500 block">पंजीयन दिनांक व समय:</span>
              <span className="font-semibold text-slate-900 font-mono">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">वर्तमान स्थिति:</span>
              <span className="font-bold text-blue-900">{receiptData.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block">शिकायतकर्ता का नाम:</span>
              <span className="font-semibold text-slate-900">{receiptData.citizen_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">पंजीकृत मोबाइल:</span>
              <span className="font-semibold text-slate-900 font-mono">{receiptData.mobile_masked}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ग्राम / मोहल्ला / वार्ड:</span>
              <span className="font-semibold text-slate-900">{receiptData.ward_or_mohalla}, {receiptData.village}</span>
            </div>
            <div>
              <span className="text-slate-500 block">संबंधित श्रेणी:</span>
              <span className="font-semibold text-slate-900">{receiptData.category}</span>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">विषय:</span>
              <p className="font-medium text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-100">
                {receiptData.subject}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-0.5">शिकायत का संक्षिप्त विवरण:</span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-line">
                {receiptData.description}
              </p>
            </div>

            {receiptData.assigned_department && (
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">अग्रेषित विभाग / निकाय:</span>
                <span className="text-slate-800 font-medium">{receiptData.assigned_department}</span>
              </div>
            )}
          </div>

          {/* Official Verification Notice / Barcode Simulation */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="text-[11px] text-slate-500 leading-tight space-y-1">
              <p>✔ यह डिजिटल रसीद कंप्यूटर जनरेटेड है तथा भौतिक हस्ताक्षर की आवश्यकता नहीं है।</p>
              <p>✔ स्थिति जानने हेतु पोर्टल पर यह क्रमांक दर्ज करें अथवा पंचायत कार्यालय संपर्क करें।</p>
              <p className="text-[10px] text-amber-700 font-medium">
                * यह एक स्वतंत्र स्थानीय जन-सेवा पावती है। राज्य स्तरीय CM Helpline पंजीयन हेतु 181 पर कॉल करें।
              </p>
            </div>
            <div className="border border-slate-300 p-2 rounded text-center shrink-0 bg-slate-50">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-600 mb-0.5">
                SDGP VERIFIED
              </div>
              <div className="h-6 w-24 bg-slate-800 mx-auto rounded-xs opacity-75" />
              <div className="font-mono text-[9px] text-slate-500 mt-0.5">{receiptData.complaint_id}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            बंद करें
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            रसीद प्रिंट / डाउनलोड करें
          </button>
        </div>
      </div>
    </div>
  );
};
