import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, FileText, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                सै
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                सैदौरा जन-सेवा पोर्टल
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              ग्राम पंचायत सैदौरा, जनपद पंचायत दतिया, जिला दतिया (म.प्र.) का स्वतंत्र जन-शिकायत निवारण एवं सामुदायिक सूचना पोर्टल। हमारा लक्ष्य गाँव के प्रत्येक नागरिक को पारदर्शी समाधान उपलब्ध कराना है।
            </p>
            <div className="text-[11px] text-emerald-400 font-medium">
              टैगलाइन: "हमारा गाँव, हमारी भागीदारी, हमारा विकास।"
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              महत्वपूर्ण लिंक्स
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a
                  href="https://cmhelpline.mp.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>CM Helpline 181 (म.प्र.)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://datia.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>दतिया जिला आधिकारिक पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://prd.mp.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>पंचायत दर्पण (Panchayat Darpan MP)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://samagra.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>समग्र सामाजिक सुरक्षा पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies & Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              नीति एवं अस्वीकरण
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setModalType('disclaimer')}
                  className="hover:text-white transition-colors text-left"
                >
                  अस्वीकरण (Disclaimer)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalType('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  गोपनीयता नीति (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalType('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  नियम एवं शर्तें (Terms of Use)
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                अंतिम पोर्टल अद्यतन: 08 अक्टूबर 2026
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 सैदौरा जन-सेवा पोर्टल · स्वतंत्र सामुदायिक जनहित मंच
          </div>
          <div>
            ग्राम पंचायत सैदौरा, जनपद पंचायत दतिया (मध्य प्रदेश)
          </div>
        </div>
      </div>

      {/* Info Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {modalType === 'disclaimer' && 'सार्वजनिक अस्वीकरण (Disclaimer)'}
                {modalType === 'privacy' && 'गोपनीयता नीति (Privacy Policy)'}
                {modalType === 'terms' && 'उपयोग की शर्तें (Terms of Use)'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              {modalType === 'disclaimer' && (
                <>
                  <p>
                    <strong>1. स्वतंत्र सामुदायिक पहल:</strong> यह पोर्टल ग्राम पंचायत सैदौरा के नागरिकों की सुविधा हेतु बनाया गया एक स्वतंत्र स्थानीय जन-सेवा मंच है। इसे मध्य प्रदेश शासन, CM Helpline (181) या आधिकारिक ग्राम पंचायत का विधिवत सरकारी पोर्टल न माना जाए जब तक इसके लिए आवश्यक शासकीय अनुमति प्राप्त न हो।
                  </p>
                  <p>
                    <strong>2. डेटा सत्यापन:</strong> पोर्टल पर प्रदर्शित जनप्रतिनिधियों के नाम, बैठक की तारीखें, विकास कार्य और योजना विवरण स्थानीय इनपुट और सार्वजनिक स्रोतों पर आधारित हैं। आधिकारिक सत्यापन प्रक्रियाधीन है।
                  </p>
                  <p>
                    <strong>3. कानूनी वैधता:</strong> इस पोर्टल पर शिकायत दर्ज करना स्थानीय समन्वय हेतु है, यह किसी न्यायालय अथवा आधिकारिक शासकीय शिकायत पोर्टल (जैसे CM Helpline 181) में विहित कानूनी वाद दर्ज होने का विकल्प नहीं है।
                  </p>
                </>
              )}

              {modalType === 'privacy' && (
                <>
                  <p>
                    <strong>1. नागरिक डेटा सुरक्षा:</strong> पोर्टल पर दर्ज नागरिक के मोबाइल नंबर, पते एवं व्यक्तिगत पहचान को सार्वजनिक ट्रैकिंग पृष्ठ पर कभी भी पूरा नहीं दिखाया जाता है (उन्हें आंशिक रूप से मास्क किया जाता है)।
                  </p>
                  <p>
                    <strong>2. डेटा का उपयोग:</strong> नागरिक द्वारा दी गई जानकारी केवल संबंधित ग्राम पंचायत विभाग और नोडल अधिकारियों तक शिकायत निवारण हेतु प्रेषित की जाती है।
                  </p>
                  <p>
                    <strong>3. Google Sheets सुरक्षा:</strong> आंतरिक डेटा सुरक्षित सर्वर-साइड एकीकरण के माध्यम से सुरक्षित रखा जाता है और किसी तीसरे पक्ष के साथ व्यावसायिक रूप से साझा नहीं किया जाता।
                  </p>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p>
                    <strong>1. सत्यनिष्ठा:</strong> शिकायतकर्ता द्वारा दर्ज की गई जानकारी सत्य एवं प्रमाणिक होनी चाहिए। किसी भी दुर्भावनापूर्ण, झूठी अथवा मानहानिकारक शिकायत के लिए शिकायतकर्ता स्वयं उत्तरदायी होगा।
                  </p>
                  <p>
                    <strong>2. शिष्टाचार:</strong> शिकायत विवरण में किसी भी अभद्र अथवा असंसदीय भाषा का प्रयोग प्रतिबंधित है।
                  </p>
                  <p>
                    <strong>3. डिजिटल पावती:</strong> शिकायत दर्ज होने पर प्राप्त डिजिटल शिकायत क्रमांक को भविष्य के संदर्भ हेतु सुरक्षित रखें।
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800"
              >
                समझ गया / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
