import React from 'react';
import { Officer } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { UserCheck, ShieldAlert, Phone, Building, AlertCircle } from 'lucide-react';

interface RepresentativesSectionProps {
  officers: Officer[];
}

export const RepresentativesSection: React.FC<RepresentativesSectionProps> = ({ officers }) => {
  const { t } = useLanguage();

  return (
    <section id="representatives-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-900 tracking-wider uppercase mb-1">
              {t('rep_kicker')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('rep_title')}
            </h2>
          </div>
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded border border-amber-200 inline-flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>जनप्रतिनिधि एवं कार्मिक विवरण (सत्यापन अधीन)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {officers.map((off) => (
            <div
              key={off.officer_id}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {off.officer_name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {off.officer_name}
                  </h3>
                  <div className="text-xs font-semibold text-blue-900 mt-0.5">
                    {off.designation}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div className="flex items-start gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{off.department}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{off.public_contact}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/70">
                <span
                  className={`text-[11px] font-medium block leading-tight ${
                    off.verification_status.includes('सत्यापित')
                      ? 'text-emerald-700'
                      : 'text-amber-800'
                  }`}
                >
                  स्थिति: {off.verification_status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  सत्यापन तिथि: {off.last_verified}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong>महत्वपूर्ण स्पष्टीकरण:</strong> सरपंच 'मिराज परिहार' एवं सचिव 'अखिलेश रावत' का नाम पोर्टल उपयोगकर्ता इनपुट के आधार पर दर्ज है। किसी भी आधिकारिक निर्णय अथवा प्रमाणिक दस्तावेज हेतु जनपद पंचायत दतिया अथवा जिला पंचायत दतिया से सत्यापन आवश्यक है।
        </div>
      </div>
    </section>
  );
};
