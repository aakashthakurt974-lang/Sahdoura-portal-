import React from 'react';
import { PortalContent, GramSabhaEntry } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Users, Calendar, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface GramSabhaSectionProps {
  content?: PortalContent[];
  entries?: GramSabhaEntry[];
}

export const GramSabhaSection: React.FC<GramSabhaSectionProps> = ({ content = [], entries = [] }) => {
  const { t } = useLanguage();

  // If dedicated GramSabha entries are provided from Google Sheets Tab 3
  const hasDedicated = entries && entries.length > 0;
  const dedicatedUpcoming = hasDedicated
    ? entries.filter((e) => e.meeting_type === 'आगामी ग्राम सभा सूचना' || e.status === 'निर्धारित')
    : [];
  const dedicatedDecisions = hasDedicated
    ? entries.filter((e) => e.meeting_type === 'विगत बैठक कार्यवाही एवं निर्णय' || e.status === 'सम्पन्न')
    : [];

  // Fallback to content items
  const fallbackNotices = content.filter((c) => c.content_type === 'ग्राम सभा की सूचना');
  const fallbackDecisions = content.filter((c) => c.content_type === 'ग्राम सभा का निर्णय');

  const upcomingItem = hasDedicated && dedicatedUpcoming.length > 0 ? dedicatedUpcoming[0] : null;
  const fallbackNotice = fallbackNotices.length > 0 ? fallbackNotices[0] : null;

  const pastResolutions = hasDedicated && dedicatedDecisions.length > 0 ? dedicatedDecisions : null;

  return (
    <section id="gram-sabha-section" className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-900 tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-800" />
              <span>{t('sabha_kicker')} (Google Sheets Tab 3)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('sabha_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            पंचायत राज अधिनियम अंतर्गत सार्वजनिक बैठकें
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upcoming Gram Sabha Notice (Hero Card) */}
          <div className="lg:col-span-6 bg-white rounded-xl border-2 border-blue-900/20 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-950 font-bold text-xs uppercase tracking-wider">
                {t('sabha_upcoming_tag')}
              </span>
            </div>

            {upcomingItem ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {upcomingItem.agenda || 'ग्राम सभा सामान्य बैठक'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {upcomingItem.description}
                </p>

                <div className="space-y-2.5 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>
                      दिनांक व समय: <strong>{upcomingItem.meeting_date} {upcomingItem.meeting_time ? `(${upcomingItem.meeting_time})` : ''}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>स्थान: <strong>{upcomingItem.venue}</strong></span>
                  </div>

                  {upcomingItem.agenda && (
                    <div className="flex items-start gap-2 text-slate-800">
                      <FileText className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                      <span>एजेंडा: {upcomingItem.agenda}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>स्रोत: {upcomingItem.source}</span>
                  <span className="italic text-emerald-800 font-medium">स्थिति: {upcomingItem.status}</span>
                </div>
              </div>
            ) : fallbackNotice ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {fallbackNotice.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {fallbackNotice.description}
                </p>

                <div className="space-y-2.5 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>
                      दिनांक व समय: <strong>20 अक्टूबर 2026, सुबह 11:00 बजे</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>स्थान: {fallbackNotice.location || 'पंचायत भवन प्रांगण, सैदौरा'}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800">
                    <FileText className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                    <span>एजेंडा: वार्षिक कार्ययोजना GPDP, स्वच्छता सर्वेक्षण एवं पेयजल समीक्षा</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>स्रोत: {fallbackNotice.source}</span>
                  <span className="italic text-amber-800 font-medium">सत्यापन स्थिति: प्रकाशित सूचना</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                अगली बैठक की तारीख अभी प्रकाशित नहीं हुई है।
              </div>
            )}
          </div>

          {/* Past Decisions & Resolutions */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('sabha_decisions_title')}</span>
            </h3>

            {pastResolutions && pastResolutions.length > 0 ? (
              pastResolutions.map((entry) => (
                <div
                  key={entry.meeting_id}
                  className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">बैठक तिथि: {entry.meeting_date}</span>
                    <span className="text-emerald-700 font-medium">{entry.status}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {entry.agenda}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {entry.resolution_summary || entry.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>स्थान: {entry.venue}</span>
                    <span>अभिलेख: {entry.source}</span>
                  </div>
                </div>
              ))
            ) : fallbackDecisions.length > 0 ? (
              fallbackDecisions.map((dec) => (
                <div
                  key={dec.content_id}
                  className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{dec.category}</span>
                    <span>प्रस्ताव दिनांक: {dec.publish_date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {dec.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dec.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>अभिलेख: {dec.source}</span>
                    <span>स्थान: {dec.location || 'सैदौरा'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                पूर्व बैठकों के सार्वजनिक प्रस्ताव Google Sheets के 'GramSabha' टैब में जोड़े जा सकते हैं।
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
