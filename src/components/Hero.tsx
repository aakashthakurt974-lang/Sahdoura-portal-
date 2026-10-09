import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { PortalSettings } from '../types/index.ts';
import { PlusCircle, Search, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, Radio } from 'lucide-react';

interface HeroProps {
  onOpenComplaintForm: () => void;
  onOpenTrackModal: () => void;
  stats: {
    totalComplaints: number;
    resolvedComplaints: number;
    ongoingWorks: number;
  };
  settings?: PortalSettings | null;
  onRefreshData?: () => void;
  isSyncing?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenComplaintForm,
  onOpenTrackModal,
  stats,
  settings,
  onRefreshData,
  isSyncing = false
}) => {
  const { t, language } = useLanguage();

  const heroTitle = language === 'hi'
    ? (settings?.portal_title_hi || t('hero_title'))
    : (settings?.portal_title_en || t('hero_title'));

  const heroTagline = language === 'hi'
    ? (settings?.tagline_hi || t('hero_tagline'))
    : (settings?.tagline_en || t('hero_tagline'));

  const regionBadge = settings
    ? `${settings.block_janpad ? `जनपद पंचायत ${settings.block_janpad} · ` : ''}जिला ${settings.district} · ${settings.state}`
    : t('admin_region_badge');

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background Photography with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/saidoura_panchayat_hero_1791525758362.jpg"
          alt="ग्राम पंचायत सैदौरा गाँव परिदृश्य"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/85 to-slate-900/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Notice from Settings if available */}
        {settings?.marquee_notice && (
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-900/80 border border-blue-400/40 text-blue-100 text-xs shadow-sm max-w-3xl">
            <Radio className="w-3.5 h-3.5 text-blue-300 animate-pulse shrink-0" />
            <span className="font-semibold text-amber-300 shrink-0">घोषणा / सूचना:</span>
            <span className="truncate">{settings.marquee_notice}</span>
          </div>
        )}

        {/* Independent Portal Disclaimer Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs mb-6 max-w-3xl">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>{t('hero_disclaimer_title')}</strong> {t('hero_disclaimer_desc')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider">
                <span>{regionBadge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {heroTitle}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-emerald-300">
                {heroTagline}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {t('hero_desc')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenComplaintForm}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                {t('new_complaint')}
              </button>

              <button
                onClick={onOpenTrackModal}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-bold text-slate-100 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap cursor-pointer"
              >
                <Search className="w-5 h-5 text-emerald-300" />
                {t('track_complaint')}
              </button>

              {onRefreshData && (
                <button
                  onClick={onRefreshData}
                  disabled={isSyncing}
                  title="Google Sheets से डेटा ताज़ा करें"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'सिंक हो रहा है...' : 'डेटा ताज़ा करें'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('badge_transparent')}</span>
              </div>
              <span aria-hidden="true">·</span>
              <span>{t('badge_otp')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{t('badge_sheets')}</span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-5 sm:p-6 text-white space-y-4">
            <h3 className="text-sm font-bold text-emerald-300 tracking-wide">
              {t('hero_stats_title')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-3.5 rounded-lg border border-white/5">
                <div className="text-2xl font-bold font-mono tabular-nums text-white">
                  {stats.totalComplaints}
                </div>
                <div className="text-xs text-slate-300 mt-1">{t('stat_total_complaints')}</div>
              </div>

              <div className="bg-black/20 p-3.5 rounded-lg border border-white/5">
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {stats.resolvedComplaints}
                </div>
                <div className="text-xs text-slate-300 mt-1">{t('stat_resolved')}</div>
              </div>

              <div className="bg-black/20 p-3.5 rounded-lg border border-white/5">
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
                  {stats.ongoingWorks}
                </div>
                <div className="text-xs text-slate-300 mt-1">{t('stat_ongoing_works')}</div>
              </div>

              <div className="bg-black/20 p-3.5 rounded-lg border border-white/5">
                <div className="text-sm font-bold text-blue-200 mt-1">
                  {t('sabha_date')}
                </div>
                <div className="text-xs text-slate-300 mt-1">{t('stat_upcoming_sabha')}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>{t('sabha_venue')}</span>
              <button
                onClick={() => {
                  document.getElementById('gram-sabha-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-emerald-300 hover:text-white inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                {t('view_agenda')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
