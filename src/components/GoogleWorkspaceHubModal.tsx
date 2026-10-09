import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DevelopmentWork } from '../types/index.ts';
import { GoogleSignInButton } from './GoogleSignInButton.tsx';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FolderOpen,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  User,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';

interface GoogleWorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  works?: DevelopmentWork[];
}

export const GoogleWorkspaceHubModal: React.FC<GoogleWorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  works = []
}) => {
  const { t, language } = useLanguage();
  const {
    user,
    isSignedIn,
    isSigningIn,
    signInWithGoogle,
    signOutFromGoogle,
    files,
    isLoadingFiles,
    refreshFiles,
    createDoc,
    createSheet,
    createPresentation,
    error,
    clearError
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'docs' | 'sheets' | 'slides' | 'files'>('docs');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<{ msg: string; link: string } | null>(null);

  // Custom Doc Form State
  const [docTitle, setDocTitle] = useState('ग्राम सभा सदौरा - कार्यवाही विवरण एवं प्रस्ताव (बैठक 2026)');
  const [docContent, setDocContent] = useState(
    `ग्राम पंचायत सदौरा (विकास खंड सढ़ौरा, जिला यमुनानगर)
ग्राम सभा बैठक कार्यवाही विवरण एवं नागरिक प्रस्ताव

दिनांक: ${new Date().toLocaleDateString('hi-IN')}
स्थान: ग्राम पंचायत सचिवालय भवन, सदौरा
अध्यक्षता: ग्राम प्रधान / सरपंच

एजेंडा एवं पारित प्रस्ताव:
1. ग्राम पंचायत में स्वच्छ पेयजल एवं बोरवेल पाइपलाइन का विस्तार।
2. मुख्य संपर्क मार्गों एवं गलियों में सोलर स्ट्रीट लाइटों की स्थापना।
3. वर्षा जल निकासी हेतु पक्की नाली एवं स्वच्छता अभियान।
4. नागरिक शिकायत निवारण पोर्टल के माध्यम से प्राप्त शिकायतों की समीक्षा।

उपस्थित सदस्य एवं पंचगण:
- सरपंच / ग्राम प्रधान
- पंचायत सचिव (VDO)
- समस्त वार्ड पंच एवं प्रबुद्ध नागरिक

यह विवरण Google Docs के माध्यम से सुरक्षित एवं डिजिटल रूप से संधारित किया गया है।`
  );

  // Custom Sheet Form State
  const [sheetTitle, setSheetTitle] = useState('ग्राम पंचायत सदौरा - विकास कार्य एवं शिकायत रजिस्टर 2026');

  // Custom Slides Form State
  const [slidesTitle, setSlidesTitle] = useState('ग्राम पंचायत सदौरा - विकास प्रगति प्रस्तुति 2026');

  if (!isOpen) return null;

  const handleCreateDocSubmit = async () => {
    if (!docTitle.trim()) return;
    setIsProcessing(true);
    clearError();
    try {
      const result = await createDoc(docTitle, docContent);
      setSuccessNotice({
        msg: `Google Doc '${result.name}' सफलतापूर्वक बन गया!`,
        link: result.webViewLink
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportSheetSubmit = async () => {
    setIsProcessing(true);
    clearError();
    try {
      const headers = [
        'क्रमांक',
        'कार्य का नाम (Work Name)',
        'स्थान / वार्ड (Location)',
        'स्वीकृत लागत (₹ Lakhs)',
        'कार्यकारी एजेंसी (Agency)',
        'वर्तमान स्थिति (Status)',
        'अंतिम अद्यतन (Updated)'
      ];

      const rows =
        works.length > 0
          ? works.map((w, idx) => [
              idx + 1,
              w.work_name || 'विकास कार्य',
              w.location || 'ग्राम सदौरा',
              w.estimated_cost || '3.50',
              w.executing_agency || 'ग्राम पंचायत',
              w.current_status || 'प्रगतिरत',
              w.updated_at || new Date().toISOString().split('T')[0]
            ])
          : [
              [1, 'मुख्य मार्ग पर इंटरलॉकिंग टाइल्स व नाली निर्माण', 'वार्ड 3 व 4', '5.20', 'ग्राम पंचायत', 'प्रगतिरत', '2026-04-10'],
              [2, 'प्राथमिक विद्यालय प्रांगण में सोलर स्ट्रीट लाइट स्थापना', 'वार्ड 2', '2.80', 'ऊर्जा विकास निगम', 'स्वीकृत', '2026-04-12'],
              [3, 'पेयजल बोरवेल सबमर्सिबल पंप व पाइपलाइन मरम्मत', 'वार्ड 5', '3.40', 'जनस्वास्थ्य विभाग', 'पूर्ण', '2026-04-05']
            ];

      const result = await createSheet(sheetTitle, headers, rows);
      setSuccessNotice({
        msg: `Google Sheet '${result.name}' सफलतापूर्वक बन गई!`,
        link: result.webViewLink
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSlidesSubmit = async () => {
    setIsProcessing(true);
    clearError();
    try {
      const slidesData = [
        {
          title: 'ग्राम पंचायत सदौरा - विकास व कल्याण प्रगति 2026',
          subtitle: 'डिजिटल नागरिक सेवा एवं पारदर्शी शासन प्रस्तुति',
          bulletPoints: [
            'जिला: यमुनानगर, हरियाणा | विकास खंड: सढ़ौरा',
            'नागरिक संतुष्टि एवं शिकायत निवारण पोर्टल संचालित',
            'सतत ग्राम विकास एवं आत्मनिर्भर पंचायत संकल्प'
          ]
        },
        {
          title: 'प्रमुख स्वीकृत एवं प्रगतिरत विकास कार्य',
          subtitle: 'बुनियादी ढांचा एवं जन-सुविधाएं',
          bulletPoints: [
            'वार्ड 3 व 4 में सीसी सड़क एवं पक्की भूमिगत नाली निर्माण',
            'समस्त प्रमुख चौराहों पर 24 हाई-मास्ट सोलर लाइटों की स्थापना',
            'पेयजल शुद्धिकरण प्लांट एवं अमृत सरोवर जीर्णोद्धार कार्य',
            'सामुदायिक बारात घर एवं डिजिटल पुस्तकालय का निर्माण'
          ]
        },
        {
          title: 'नागरिक शिकायत निवारण पोर्टल प्रदर्शन',
          subtitle: 'समयबद्ध समाधान एवं पारदर्शी ट्रैकिंग',
          bulletPoints: [
            'पोर्टल पर प्राप्त कुल नागरिक शिकायतें: 48+',
            'सफलतापूर्वक निस्तारित शिकायतें: 42 (88% निवारण दर)',
            'औसत निवारण समय: 48 घंटे के भीतर त्वरित संज्ञान',
            'डिजिटल रसीद एवं एसएमएस ट्रैकिंग सुविधा उपलब्ध'
          ]
        },
        {
          title: 'ग्राम सभा भागीदारी एवं आगामी लक्ष्य',
          subtitle: 'सबकी योजना सबका विकास',
          bulletPoints: [
            'मासिक ग्राम सभा बैठकों में शत-प्रतिशत नागरिक सहभागिता',
            'महिला स्वयं सहायता समूहों को आजीविका सहयोग',
            'स्वच्छ भारत मिशन अंतर्गत डोर-टू-डोर कचरा प्रबंधन'
          ]
        }
      ];

      const result = await createPresentation(slidesTitle, slidesData);
      setSuccessNotice({
        msg: `Google Slides '${result.name}' सफलतापूर्वक बन गई!`,
        link: result.webViewLink
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Google Workspace डिजिटल कार्यालय
              </h3>
              <p className="text-xs text-blue-200">
                Google Docs, Sheets, Slides और Google Drive से सीधा समन्वय
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Auth Ribbon / Sign-in Status */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {isSignedIn && user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  {user.displayName || user.email}
                </span>
                <span className="text-slate-500 text-[11px]">Google Workspace खाता कनेक्टेड</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              दस्तावेज़, स्प्रेडशीट या स्लाइड बनाने के लिए अपने Google खाते से कनेक्ट करें।
            </div>
          )}

          <div>
            {isSignedIn ? (
              <button
                type="button"
                onClick={signOutFromGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            ) : (
              <GoogleSignInButton
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                label={isSigningIn ? 'कनेक्ट हो रहा है...' : 'Google से साइन-इन करें'}
              />
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('docs');
              setSuccessNotice(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Google Docs (दस्तावेज़)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sheets');
              setSuccessNotice(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets (स्प्रेडशीट)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('slides');
              setSuccessNotice(null);
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'slides'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-600" />
            <span>Google Slides (प्रस्तुति)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('files');
              setSuccessNotice(null);
              refreshFiles();
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span>Drive फ़ाइलें</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={clearError} className="cursor-pointer text-rose-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-sm">{successNotice.msg}</span>
              </div>
              <a
                href={successNotice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
              >
                <span>Google में खोलें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* TAB 1: GOOGLE DOCS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>ग्राम सभा कार्यवाही विवरण व आदेश पत्र (Google Doc) तैयार करें</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  यह सीधे आपके Google Drive में एक आधिकारिक Google Doc फ़ाइल निर्मित करेगा जिसे आप बाद में कभी भी एडिट या प्रिंट कर सकते हैं।
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      दस्तावेज़ का शीर्षक (Doc Title)
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      दस्तावेज़ सामग्री (Document Text)
                    </label>
                    <textarea
                      rows={6}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={handleCreateDocSubmit}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessing ? 'Google Doc बन रहा है...' : 'Google Doc बनाएं एवं सेव करें'}</span>
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>दस्तावेज़ बनाने हेतु ऊपर 'Sign in with Google' करें</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>पोर्टल डेटा को Google Sheet में एक्सपोर्ट करें</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  ग्राम सदौरा के सभी विकास कार्य, बजट एवं स्थिति का डेटा Google Sheets स्प्रेडशीट में व्यवस्थित रूप से दर्ज किया जाएगा।
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      स्प्रेडशीट का शीर्षक (Sheet Name)
                    </label>
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">
                      शामिल किए जाने वाले कॉलम (Columns Included):
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      क्रमांक, कार्य का नाम, वार्ड/स्थान, स्वीकृत बजट (लाख रु.), कार्य एजेंसी, वर्तमान स्थिति (प्रगतिरत/पूर्ण), अद्यतन दिनांक।
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={handleExportSheetSubmit}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessing ? 'Google Sheet तैयार हो रही है...' : 'Google Sheet में एक्सपोर्ट करें'}</span>
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500">
                        स्प्रेडशीट बनाने हेतु ऊपर 'Sign in with Google' करें
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <span>ग्राम पंचायत विकास प्रगति Google Slides प्रस्तुति (PPT) बनाएं</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  ग्राम सभा की बैठक, जिला प्रशासन समीक्षा एवं नागरिकों के समक्ष प्रस्तुत करने हेतु 4-स्लाइड का पूर्ण डेक तैयार करें।
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      प्रस्तुति शीर्षक (Presentation Title)
                    </label>
                    <input
                      type="text"
                      value={slidesTitle}
                      onChange={(e) => setSlidesTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg text-xs space-y-1.5">
                    <span className="font-semibold text-amber-900 block">
                      निर्मित की जाने वाली स्लाइड संरचना (Auto-Generated Slides):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-800">
                      <div className="p-2 bg-white rounded border border-amber-100">
                        <span className="font-bold">स्लाइड 1:</span> ग्राम पंचायत सदौरा परिचय व विजन
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-100">
                        <span className="font-bold">स्लाइड 2:</span> स्वीकृत एवं प्रगतिरत बुनियादी विकास कार्य
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-100">
                        <span className="font-bold">स्लाइड 3:</span> नागरिक शिकायत निवारण दर (88%+)
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-100">
                        <span className="font-bold">स्लाइड 4:</span> ग्राम सभा सहभागिता एवं आगामी योजनाएं
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={handleCreateSlidesSubmit}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessing ? 'Google Slides बन रही है...' : 'Google Slides तैयार करें'}</span>
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500">
                        प्रस्तुति तैयार करने हेतु ऊपर 'Sign in with Google' करें
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE DRIVE FILES BROWSER */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-indigo-600" />
                    <span>आपके हालिया Google Workspace दस्तावेज़ व फ़ाइलें</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => refreshFiles()}
                    disabled={isLoadingFiles}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>रिफ्रेश</span>
                  </button>
                </div>

                {!isSignedIn ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500 mb-3">
                      Google Drive में सहेजी गई फ़ाइलें देखने के लिए साइन-इन करें।
                    </p>
                    <GoogleSignInButton onClick={signInWithGoogle} disabled={isSigningIn} />
                  </div>
                ) : isLoadingFiles ? (
                  <div className="text-center py-8 text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Drive फ़ाइलें लोड हो रही हैं...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    अभी कोई फ़ाइल उपलब्ध नहीं है। ऊपर दिए गए टैब से नया Google Doc, Sheet या Slides बनाएं!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {files.map((file) => {
                      const isDoc = file.mimeType.includes('document');
                      const isSheet = file.mimeType.includes('spreadsheet');
                      const isSlide = file.mimeType.includes('presentation');

                      return (
                        <div
                          key={file.id}
                          className="py-2.5 px-2 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isDoc && <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            {isSheet && <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                            {isSlide && <Presentation className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                            {!isDoc && !isSheet && !isSlide && (
                              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-medium text-xs text-slate-800 truncate block">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Drive File'}
                              </span>
                            </div>
                          </div>

                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors flex-shrink-0"
                          >
                            <span>खोलें</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Google Docs, Google Sheets, Google Slides एवं Google Maps अधिकृत एकीकरण
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
