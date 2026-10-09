import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ShieldAlert, User, LogOut, FileText, Languages, MapPin, Sparkles } from 'lucide-react';
import { NetworkSheetsStatus, OfflineAlertBanner } from './NetworkSheetsStatus.tsx';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenComplaintForm: () => void;
  onOpenTrackModal: () => void;
  onOpenWorkspaceModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenComplaintForm,
  onOpenTrackModal,
  onOpenWorkspaceModal
}) => {
  const { user, isAuthenticated, isAdmin, logout, openOtpModal, openAdminModal } = useAuth();
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Visual Offline / Sheets Disconnected Alert Banner */}
      <OfflineAlertBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-16">
          {/* Zone 1: Brand title & Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-blue-800 transition-colors shrink-0">
                {language === 'hi' ? 'सै' : 'S'}
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  {t('portal_name')}
                </span>
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap hidden sm:block leading-none">
                  {t('panchayat_subtitle')}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'home' ? 'text-blue-900 border-b-2 border-blue-900 font-semibold' : ''
              }`}
            >
              {t('nav_home')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('works-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1"
            >
              {t('nav_works')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('schemes-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1"
            >
              {t('nav_schemes')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('gram-sabha-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1"
            >
              {t('nav_gram_sabha')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('news-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1"
            >
              {t('nav_news')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('representatives-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1"
            >
              {t('nav_representatives')}
            </button>
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('panchayat-map');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1 text-blue-800 font-semibold"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मानचित्र' : 'Map'}</span>
            </button>
          </nav>

          {/* Zone 3: Offline/Sheets indicator, Language switcher & Primary actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Visual Offline & Google Sheets Connection Indicator */}
            <NetworkSheetsStatus />

            {/* Google Workspace Office Hub (Docs, Sheets, Slides) */}
            {onOpenWorkspaceModal && (
              <button
                type="button"
                onClick={onOpenWorkspaceModal}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                title="Google Docs, Sheets, Slides Hub"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Google Workspace</span>
                <span className="sm:hidden">Workspace</span>
              </button>
            )}

            {/* Language Switcher Segmented Control with Icon */}
            <div
              className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
              role="group"
              aria-label="Language Selector"
            >
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  language === 'hi'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी (Hindi)"
                aria-pressed={language === 'hi'}
              >
                <span>हिन्दी</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  language === 'en'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
                aria-pressed={language === 'en'}
              >
                <span>EN</span>
              </button>
            </div>

            {/* Quick Toggle Button for compact mobile/tablet viewports */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="sm:hidden p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-md transition-colors"
              title={language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4 text-blue-900" />
            </button>

            <button
              onClick={onOpenTrackModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-blue-800" />
              {t('track_complaint')}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'admin'
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {t('admin_panel')}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('citizen')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab === 'citizen'
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {t('my_complaints')}
                  </button>
                )}

                <button
                  onClick={logout}
                  title={t('logout')}
                  className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={openOtpModal}
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-md hover:bg-blue-800 shadow-sm transition-colors whitespace-nowrap"
                >
                  {t('citizen_login')}
                </button>
                <button
                  onClick={openAdminModal}
                  title={t('admin_login_tooltip')}
                  className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden items-center gap-2.5 overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium text-slate-600 no-scrollbar">
          {/* Quick Language Toggle chip for mobile */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-100 text-blue-900 font-semibold border border-slate-200 inline-flex items-center gap-1 shrink-0"
            title="Toggle Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'home' ? 'bg-blue-100 text-blue-900 font-semibold' : ''}`}
          >
            {t('nav_home')}
          </button>
          <button
            onClick={onOpenComplaintForm}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-green-50 text-green-800 font-semibold border border-green-200"
          >
            {t('btn_new_complaint_short')}
          </button>
          <button
            onClick={onOpenTrackModal}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-100 text-slate-800"
          >
            {t('track_complaint')}
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              document.getElementById('works-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap px-2 py-1"
          >
            {t('nav_works')}
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap px-2 py-1"
          >
            {t('nav_schemes')}
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              document.getElementById('gram-sabha-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap px-2 py-1"
          >
            {t('nav_gram_sabha')}
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              document.getElementById('helpline-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap px-2 py-1"
          >
            {t('nav_helpline')}
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              document.getElementById('panchayat-map')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="whitespace-nowrap px-2 py-1 text-blue-900 font-semibold inline-flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            <span>{language === 'hi' ? 'मानचित्र' : 'Map'}</span>
          </button>
          {onOpenWorkspaceModal && (
            <button
              onClick={onOpenWorkspaceModal}
              className="whitespace-nowrap px-2 py-1 text-indigo-900 font-semibold bg-indigo-50 border border-indigo-200 rounded inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Workspace</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
