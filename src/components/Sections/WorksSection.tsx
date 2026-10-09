import React, { useState } from 'react';
import { PortalContent, DevelopmentWork } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Hammer, CheckCircle2, Clock, MapPin, IndianRupee, Layers, Calendar, Image as ImageIcon } from 'lucide-react';

interface WorksSectionProps {
  content?: PortalContent[];
  works?: DevelopmentWork[];
}

export const WorksSection: React.FC<WorksSectionProps> = ({ content = [], works = [] }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  // If dedicated DevelopmentWorks are provided, use them; otherwise fallback to content items
  const useDedicatedWorks = works && works.length > 0;

  // Filter dedicated works
  const ongoingDedicated = works.filter((w) => w.current_status === 'प्रगतिरत' || w.current_status === 'स्वीकृत' || w.current_status === 'प्रस्तावित');
  const completedDedicated = works.filter((w) => w.current_status === 'पूर्ण');
  const filteredDedicated = filter === 'ongoing'
    ? ongoingDedicated
    : filter === 'completed'
    ? completedDedicated
    : works;

  // Fallback content items
  const ongoingContent = content.filter((c) => c.content_type === 'विकास कार्य');
  const completedContent = content.filter((c) => c.content_type === 'पूर्ण हुआ कार्य');
  const filteredContent = filter === 'ongoing'
    ? ongoingContent
    : filter === 'completed'
    ? completedContent
    : [...ongoingContent, ...completedContent];

  const totalCount = useDedicatedWorks ? works.length : ongoingContent.length + completedContent.length;
  const ongoingCount = useDedicatedWorks ? ongoingDedicated.length : ongoingContent.length;
  const completedCount = useDedicatedWorks ? completedDedicated.length : completedContent.length;

  return (
    <section id="works-section" className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('works_kicker')} (Google Sheets Tab 2)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('works_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('works_desc')}
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('works_filter_all')} ({totalCount})
            </button>
            <button
              onClick={() => setFilter('ongoing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'ongoing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('works_filter_ongoing')} ({ongoingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('works_filter_completed')} ({completedCount})
            </button>
          </div>
        </div>

        {useDedicatedWorks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDedicated.map((work) => {
              const isCompleted = work.current_status === 'पूर्ण';
              return (
                <div
                  key={work.work_id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  {work.image_after ? (
                    <div className="aspect-16/9 bg-slate-100 overflow-hidden relative">
                      <img
                        src={work.image_after}
                        alt={work.work_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-xs">
                        कार्य फ़ोटो
                      </span>
                    </div>
                  ) : null}

                  <div className="p-6 space-y-4">
                    {/* Status & Source */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">{work.scheme_source}</span>
                      <span
                        className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{work.current_status}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {work.work_name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {work.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      {work.location && (
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>स्थान: <strong>{work.location}</strong></span>
                        </div>
                      )}
                      {work.budget_allocated && (
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            स्वीकृत राशि: <strong className="font-mono text-emerald-700">{work.budget_allocated}</strong>
                            {work.budget_spent && work.budget_spent !== 'सत्यापन लंबित' && (
                              <span className="text-slate-500 font-normal ml-1">
                                (व्यय: {work.budget_spent})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {work.target_end_date && (
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>लक्षित पूर्णता: {work.target_end_date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>स्रोत: {work.source_of_data}</span>
                    <span>अपडेट: {work.last_updated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((work) => {
              const isCompleted = work.content_type === 'पूर्ण हुआ कार्य' || work.status === 'पूर्ण';
              return (
                <div
                  key={work.content_id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">{work.category}</span>
                      <span
                        className={`font-bold inline-flex items-center gap-1 ${
                          isCompleted ? 'text-emerald-700' : 'text-blue-800'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{work.status}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {work.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {work.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      {work.location && (
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>स्थान: {work.location}</span>
                        </div>
                      )}
                      {work.source && (
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>मद: {work.source}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>अपडेट: {work.last_updated}</span>
                    <span className="italic">{work.updated_by}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
