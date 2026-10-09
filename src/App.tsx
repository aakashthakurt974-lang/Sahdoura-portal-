import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { WorkspaceProvider } from './context/WorkspaceContext.tsx';
import { api } from './services/api.ts';
import {
  PortalContent,
  DevelopmentWork,
  GramSabhaEntry,
  GalleryItem,
  Officer,
  PortalSettings
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { NewsSection } from './components/Sections/NewsSection.tsx';
import { WorksSection } from './components/Sections/WorksSection.tsx';
import { PanchayatMapSection } from './components/PanchayatMapSection.tsx';
import { SchemesSection } from './components/Sections/SchemesSection.tsx';
import { GramSabhaSection } from './components/Sections/GramSabhaSection.tsx';
import { GallerySection } from './components/Sections/GallerySection.tsx';
import { RepresentativesSection } from './components/Sections/RepresentativesSection.tsx';
import { HelplineSection } from './components/Sections/HelplineSection.tsx';
import { Footer } from './components/Footer.tsx';
import { OtpModal } from './components/OtpModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { ComplaintFormModal } from './components/ComplaintFormModal.tsx';
import { ComplaintTrackingModal } from './components/ComplaintTrackingModal.tsx';
import { DigitalReceiptModal } from './components/DigitalReceiptModal.tsx';
import { GoogleWorkspaceHubModal } from './components/GoogleWorkspaceHubModal.tsx';
import { CitizenDashboard } from './components/Citizen/CitizenDashboard.tsx';
import { AdminDashboard } from './components/Admin/AdminDashboard.tsx';
import { Search, RefreshCw, AlertCircle, Radio } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'citizen' | 'admin'>('home');

  // Modals state
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState('');
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Google Maps Quota state
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Data state (Google Sheets 9 Tabs)
  const [portalContent, setPortalContent] = useState<PortalContent[]>([]);
  const [developmentWorks, setDevelopmentWorks] = useState<DevelopmentWork[]>([]);
  const [gramSabha, setGramSabha] = useState<GramSabhaEntry[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalComplaints: 3,
    resolvedComplaints: 1,
    ongoingWorks: 2
  });
  const [loading, setLoading] = useState(true);

  // Search filter for portal
  const [portalSearch, setPortalSearch] = useState('');

  const loadAllData = async (showFeedback = false) => {
    if (showFeedback) setIsSyncing(true);
    try {
      const [
        contentRes,
        worksRes,
        sabhaRes,
        galleryRes,
        officerRes,
        settingsRes,
        healthRes
      ] = await Promise.all([
        api.getPortalContent(),
        api.getDevelopmentWorks(),
        api.getGramSabha(),
        api.getGallery(),
        api.getOfficers(),
        api.getSettings(),
        api.getHealth()
      ]);

      if (contentRes.success) setPortalContent(contentRes.data);
      if (worksRes.success) setDevelopmentWorks(worksRes.data);
      if (sabhaRes.success) setGramSabha(sabhaRes.data);
      if (galleryRes.success) setGallery(galleryRes.data);
      if (officerRes.success) setOfficers(officerRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);

      const ongoing = worksRes?.data?.filter((w) => w.current_status === 'प्रगतिरत' || w.current_status === 'स्वीकृत')?.length || 2;
      setStats((prev) => ({
        ...prev,
        ongoingWorks: ongoing
      }));

      if (showFeedback) {
        setSyncFeedback('पोर्टल Google Sheets से सफलतापूर्वक अपडेट हो गया!');
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Failed to load portal content:', err);
      if (showFeedback) {
        setSyncFeedback('सिंक विफल हुआ, कृपया दोबारा प्रयास करें।');
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      await api.triggerSheetsSync();
    } catch (e) {
      console.warn('Trigger sync error:', e);
    }
    await loadAllData(true);
  };

  const handleOpenTrackingWithId = (id: string) => {
    setTrackInitialId(id);
    setIsTrackModalOpen(true);
  };

  // Filter content if search query is provided
  const filteredContent = portalSearch.trim()
    ? portalContent.filter(
        (c) =>
          c.title.toLowerCase().includes(portalSearch.toLowerCase()) ||
          c.description.toLowerCase().includes(portalSearch.toLowerCase()) ||
          c.category.toLowerCase().includes(portalSearch.toLowerCase())
      )
    : portalContent;

  const filteredWorks = portalSearch.trim()
    ? developmentWorks.filter(
        (w) =>
          w.work_name.toLowerCase().includes(portalSearch.toLowerCase()) ||
          w.description.toLowerCase().includes(portalSearch.toLowerCase()) ||
          w.location.toLowerCase().includes(portalSearch.toLowerCase())
      )
    : developmentWorks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onOpenComplaintForm={() => setIsComplaintFormOpen(true)}
        onOpenTrackModal={() => {
          setTrackInitialId('');
          setIsTrackModalOpen(true);
        }}
      />

      {syncFeedback && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center animate-fade-in shadow-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{syncFeedback}</span>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onOpenComplaintForm={() => setIsComplaintFormOpen(true)}
              onOpenTrackModal={() => {
                setTrackInitialId('');
                setIsTrackModalOpen(true);
              }}
              stats={stats}
              settings={settings}
              onRefreshData={handleManualRefresh}
              isSyncing={isSyncing}
            />

            {/* Quick Search Strip */}
            <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={portalSearch}
                    onChange={(e) => setPortalSearch(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  {portalSearch && (
                    <button
                      onClick={() => setPortalSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {t('clear')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <NewsSection content={filteredContent} />
            <WorksSection content={filteredContent} works={filteredWorks} />
            <SchemesSection content={filteredContent} />
            <GramSabhaSection content={filteredContent} entries={gramSabha} />
            <GallerySection content={filteredContent} items={gallery} />
            <RepresentativesSection officers={officers} />
            <HelplineSection />
          </>
        )}

        {activeTab === 'citizen' && (
          <CitizenDashboard
            onOpenComplaintForm={() => setIsComplaintFormOpen(true)}
            onTrackComplaint={handleOpenTrackingWithId}
            onViewReceipt={(data) => setReceiptData(data)}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Modals */}
      <OtpModal />
      <AdminLoginModal />

      <ComplaintFormModal
        isOpen={isComplaintFormOpen}
        onClose={() => setIsComplaintFormOpen(false)}
        onSuccess={(complaintData) => {
          setReceiptData({
            complaint_id: complaintData.complaint_id,
            created_at: complaintData.created_at,
            citizen_name: complaintData.citizen_name,
            citizen_mobile: user?.mobile || '98******10',
            village: complaintData.village,
            ward_or_mohalla: complaintData.ward_or_mohalla,
            category: complaintData.category,
            subject: complaintData.subject,
            description: complaintData.description,
            status: complaintData.status
          });
        }}
      />

      <ComplaintTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialComplaintId={trackInitialId}
        onViewReceipt={(data) => setReceiptData(data)}
      />

      {receiptData && (
        <DigitalReceiptModal
          receiptData={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
