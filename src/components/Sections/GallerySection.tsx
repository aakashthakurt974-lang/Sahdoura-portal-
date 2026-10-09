import React from 'react';
import { PortalContent, GalleryItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  content?: PortalContent[];
  items?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ content = [], items = [] }) => {
  const { t } = useLanguage();

  const useDedicated = items && items.length > 0;
  const photosFromContent = content.filter((c) => c.content_type === 'फोटो गैलरी');

  if (!useDedicated && photosFromContent.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-900 tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-800" />
              <span>{t('gallery_kicker')} (Google Sheets Tab 4)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('gallery_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            सैदौरा जन-जीवन, चौपाल एवं विकास कार्य (Google Drive समर्थित)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useDedicated
            ? items.map((photo) => (
                <div
                  key={photo.image_id}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-900 block mb-1">
                        {photo.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{photo.source || 'ग्राम पंचायत सैदौरा'}</span>
                      <span>{photo.upload_date}</span>
                    </div>
                  </div>
                </div>
              ))
            : photosFromContent.map((photo) => (
                <div
                  key={photo.content_id}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-900 block mb-1">
                        {photo.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{photo.source}</span>
                      <span>{photo.publish_date}</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
