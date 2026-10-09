import React, { useState } from 'react';
import { PortalContent } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookOpen, ExternalLink, FileCheck, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SchemesSectionProps {
  content: PortalContent[];
}

export const SchemesSection: React.FC<SchemesSectionProps> = ({ content }) => {
  const { t } = useLanguage();
  const schemes = content.filter((c) => c.content_type === 'सरकारी योजना');
  const [expandedId, setExpandedId] = useState<string | null>(schemes[0]?.content_id || null);

  if (schemes.length === 0) return null;

  return (
    <section id="schemes-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-900 tracking-wider uppercase mb-1">
              {t('schemes_kicker')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('schemes_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('schemes_desc')}
            </p>
          </div>
          <div className="text-xs text-slate-500">
            स्रोत: मध्य प्रदेश शासन एवं भारत सरकार पोर्टल
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((sch) => {
            const isExpanded = expandedId === sch.content_id;
            return (
              <div
                key={sch.content_id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-blue-900">
                    {sch.category}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {sch.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {sch.description}
                  </p>

                  {sch.eligibility && (
                    <div className="text-xs space-y-1 bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-slate-800 block">पात्रता:</span>
                      <p className="text-slate-600 leading-relaxed">{sch.eligibility}</p>
                    </div>
                  )}

                  {isExpanded && sch.required_documents && (
                    <div className="text-xs space-y-1 bg-white p-3 rounded-lg border border-slate-200/80 animate-fade-in">
                      <span className="font-bold text-slate-800 block">आवश्यक दस्तावेज:</span>
                      <p className="text-slate-600 leading-relaxed">{sch.required_documents}</p>
                    </div>
                  )}

                  {sch.required_documents && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : sch.content_id)}
                      className="text-xs font-semibold text-blue-900 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'कम विवरण देखें' : 'जरूरी दस्तावेज देखें'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">स्रोत: {sch.source}</span>
                  {sch.official_link && (
                    <a
                      href={sch.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>आधिकारिक पोर्टल</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
