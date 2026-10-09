import React from 'react';
import { PortalContent } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Newspaper, Calendar, Info, ExternalLink } from 'lucide-react';

interface NewsSectionProps {
  content: PortalContent[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ content }) => {
  const { t } = useLanguage();
  const newsItems = content.filter((c) => c.content_type === 'पंचायत की खबर');

  if (newsItems.length === 0) return null;

  return (
    <section id="news-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-900 tracking-wider uppercase mb-1">
              {t('news_kicker')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('news_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            {t('news_source')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsItems.map((news) => (
            <article
              key={news.content_id}
              className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-900">{news.category}</span>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{news.publish_date}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {news.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {news.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[240px]">स्रोत: {news.source}</span>
                <span className="text-[11px] font-mono text-slate-400">अंतिम अद्यतन: {news.last_updated}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
