import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import {
  Wifi,
  WifiOff,
  CloudOff,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  Info
} from 'lucide-react';

interface NetworkSheetsStatusProps {
  onStatusChange?: (status: { isOnline: boolean; isSheetsConnected: boolean }) => void;
  showBanner?: boolean;
}

export const NetworkSheetsStatus: React.FC<NetworkSheetsStatusProps> = ({
  onStatusChange,
  showBanner = true
}) => {
  const { language, t } = useLanguage();

  // Browser network status
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Google Sheets backend status
  const [sheetsStatus, setSheetsStatus] = useState<'connected' | 'disconnected' | 'error' | 'checking'>('checking');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  // Popover & banner UI state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Check connection against backend
  const checkBackendStatus = async (forceSync = false) => {
    // If browser is offline, don't bother fetching
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setSheetsStatus('disconnected');
      return;
    }

    try {
      if (forceSync) {
        setIsSyncingNow(true);
        try {
          await api.triggerSheetsSync();
        } catch {
          // Handled by subsequent status fetch
        }
      }

      const res = await api.getSheetsConnectionStatus();
      if (res && res.connected) {
        setSheetsStatus('connected');
        setLastSync(res.lastSync);
        setLastSyncError(null);
      } else {
        setSheetsStatus('disconnected');
        setLastSync(res.lastSync || null);
        setLastSyncError(res.lastSyncError || (language === 'hi' ? 'Google Sheets बैकएंड से संपर्क नहीं हो पाया' : 'Unable to connect to Google Sheets backend'));
      }
    } catch (err: any) {
      setSheetsStatus('disconnected');
      setLastSyncError(err?.message || (language === 'hi' ? 'सर्वर से संपर्क नहीं हो पा रहा है' : 'Failed to reach portal server'));
    } finally {
      setIsSyncingNow(false);
    }
  };

  // Monitor online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsBannerDismissed(false);
      checkBackendStatus(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsBannerDismissed(false);
      setSheetsStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkBackendStatus(false);

    // Periodic check every 30 seconds
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkBackendStatus(false);
      }
    }, 30000);

    // Check on window focus
    const handleFocus = () => {
      if (navigator.onLine) {
        checkBackendStatus(false);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [language]);

  // Notify parent of status change if prop provided
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isOnline,
        isSheetsConnected: sheetsStatus === 'connected'
      });
    }
  }, [isOnline, sheetsStatus, onStatusChange]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Formatter for timestamp
  const formatTime = (isoString: string | null) => {
    if (!isoString) return t('net_never_synced');
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const isDisconnected = !isOnline || sheetsStatus === 'disconnected';

  return (
    <div className="relative" ref={popoverRef}>
      {/* Visual Badge Button */}
      <button
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          !isOnline
            ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 focus:ring-rose-400 animate-pulse'
            : sheetsStatus === 'disconnected'
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 focus:ring-amber-400'
            : sheetsStatus === 'checking' || isSyncingNow
            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 focus:ring-slate-400'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-400'
        }`}
        title={
          !isOnline
            ? t('net_alert_browser_offline')
            : sheetsStatus === 'disconnected'
            ? t('net_alert_sheets_offline')
            : t('net_sheets_connected')
        }
        aria-expanded={isPopoverOpen}
        aria-label="Google Sheets and Network Status"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="hidden sm:inline">{t('net_browser_offline')}</span>
            <span className="sm:hidden">{language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}</span>
          </>
        ) : sheetsStatus === 'disconnected' ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="hidden md:inline">{t('net_sheets_disconnected')}</span>
            <span className="md:hidden">{t('net_sheets_offline')}</span>
          </>
        ) : sheetsStatus === 'checking' || isSyncingNow ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-slate-600 animate-spin shrink-0" />
            <span className="hidden sm:inline">{t('net_checking')}</span>
          </>
        ) : (
          <>
            {/* Live Green Pulsing Dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden lg:inline">{t('net_sheets_connected')}</span>
            <span className="lg:hidden">{t('net_sheets_live')}</span>
          </>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isPopoverOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Card */}
      {isPopoverOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in text-slate-800 text-xs">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  !isOnline
                    ? 'bg-rose-500'
                    : sheetsStatus === 'disconnected'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <h3 className="font-bold text-sm text-slate-900">{t('net_status_title')}</h3>
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
              aria-label="Close status popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Breakdown */}
          <div className="py-3 space-y-2.5">
            {/* Row 1: Browser Network Status */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">{t('net_browser_label')}</div>
                  <div className="text-[11px] text-slate-500">
                    {isOnline ? (language === 'hi' ? 'सक्रिय इंटरनेट उपलब्ध' : 'Active connection') : (language === 'hi' ? 'नेटवर्क उपलब्ध नहीं' : 'No connection')}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800 font-bold'
                }`}
              >
                {isOnline ? t('net_browser_online') : t('net_browser_offline')}
              </span>
            </div>

            {/* Row 2: Google Sheets 9-Tab CMS Backend */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <div className="flex items-center gap-2">
                {sheetsStatus === 'connected' ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <CloudOff className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">{t('net_sheets_label')}</div>
                  <div className="text-[11px] text-slate-500">
                    {sheetsStatus === 'connected'
                      ? (language === 'hi' ? '9-Tab CMS लाइव कनेक्टेड' : '9-Tab CMS live sync')
                      : (language === 'hi' ? 'बैकएंड से संपर्क विच्छेदित' : 'Backend disconnected')}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  sheetsStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {sheetsStatus === 'connected'
                  ? (language === 'hi' ? 'कनेक्टेड' : 'Connected')
                  : (language === 'hi' ? 'डिस्कनेक्टेड' : 'Disconnected')}
              </span>
            </div>

            {/* Last Synced Info */}
            <div className="flex items-center justify-between px-2 text-[11px] text-slate-600">
              <span className="font-medium text-slate-500">{t('net_last_synced')}:</span>
              <span className="font-semibold text-slate-800">{formatTime(lastSync)}</span>
            </div>

            {/* If error occurred */}
            {lastSyncError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">
                    {language === 'hi' ? 'बैकएंड त्रुटि विवरण:' : 'Backend issue:'}
                  </div>
                  <div className="mt-0.5 break-words">{lastSyncError}</div>
                </div>
              </div>
            )}

            {/* Offline cache reassurance */}
            {isDisconnected && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{t('net_cached_notice')}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {language === 'hi' ? 'स्वचालित जाँच: प्रति 30 से.' : 'Auto-check: every 30s'}
            </span>
            <button
              type="button"
              onClick={() => checkBackendStatus(true)}
              disabled={isSyncingNow || !isOnline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
              <span>{isSyncingNow ? t('net_checking') : t('net_sync_now')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Informative Top Strip Banner when disconnected
export const OfflineAlertBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [sheetsDisconnected, setSheetsDisconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const verifyStatus = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setSheetsDisconnected(true);
      return;
    }
    setIsOnline(true);
    try {
      setIsRetrying(true);
      const res = await api.getSheetsConnectionStatus();
      setSheetsDisconnected(!res.connected);
      if (res.connected) {
        setIsDismissed(false);
      }
    } catch {
      setSheetsDisconnected(true);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
      verifyStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false);
      setSheetsDisconnected(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    verifyStatus();

    const interval = setInterval(verifyStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isDismissed || (isOnline && !sheetsDisconnected)) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`px-4 py-2 text-xs font-medium border-b flex items-center justify-between gap-3 shadow-xs transition-colors ${
        !isOnline
          ? 'bg-rose-600 text-white border-rose-700'
          : 'bg-amber-600 text-white border-amber-700'
      }`}
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-rose-200" />
        ) : (
          <CloudOff className="w-4 h-4 shrink-0 text-amber-200" />
        )}
        <span className="leading-tight">
          {!isOnline ? t('net_alert_browser_offline') : t('net_alert_sheets_offline')}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={verifyStatus}
          disabled={isRetrying}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{t('net_retry')}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss offline banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
