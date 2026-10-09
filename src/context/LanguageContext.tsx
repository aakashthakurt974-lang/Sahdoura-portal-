import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hi: {
    // Header
    portal_name: 'सैदौरा जन-सेवा पोर्टल',
    panchayat_subtitle: 'ग्राम पंचायत सैदौरा · दतिया (म.प्र.)',
    nav_home: 'मुख्य पृष्ठ',
    nav_works: 'विकास कार्य',
    nav_schemes: 'सरकारी योजनाएँ',
    nav_gram_sabha: 'ग्राम सभा',
    nav_news: 'गाँव की खबरें',
    nav_representatives: 'पंचायत प्रतिनिधि',
    nav_helpline: 'हेल्पलाइन',
    track_complaint: 'शिकायत ट्रैक करें',
    new_complaint: 'नई शिकायत दर्ज करें',
    btn_new_complaint_short: '+ नई शिकायत',
    citizen_login: 'नागरिक लॉगिन (OTP)',
    my_complaints: 'मेरी शिकायतें',
    admin_panel: 'एडमिन पैनल',
    logout: 'लॉगआउट',
    admin_login_tooltip: 'प्रशासक लॉगिन',

    // Offline & Sheets Status
    net_browser_online: 'ऑनलाइन',
    net_browser_offline: 'ऑफ़लाइन (इंटरनेट नहीं)',
    net_sheets_connected: 'Google शीट्स कनेक्टेड',
    net_sheets_live: 'शीट्स लाइव',
    net_sheets_disconnected: 'Google शीट्स डिस्कनेक्टेड',
    net_sheets_offline: 'शीट्स ऑफ़लाइन',
    net_checking: 'जाँच रहे हैं...',
    net_sync_now: 'ताज़ा करें (Sync)',
    net_retry: 'पुनः प्रयास करें',
    net_status_title: 'सिस्टम व नेटवर्क स्थिति',
    net_browser_label: 'ब्राउज़र इंटरनेट कनेक्शन',
    net_sheets_label: 'Google Sheets 9-Tab CMS बैकएंड',
    net_last_synced: 'अंतिम सफल सिंक',
    net_never_synced: 'अभी तक नहीं',
    net_alert_browser_offline: '⚠️ आपका ब्राउज़र ऑफ़लाइन है। इंटरनेट न होने से नई शिकायत दर्ज करने या ताज़ा डेटा प्राप्त करने में समस्या हो सकती है।',
    net_alert_sheets_offline: '⚠️ Google Sheets बैकएंड से संपर्क नहीं हो पा रहा है। प्रदर्शित जानकारी कैश्ड हो सकती है।',
    net_cached_notice: 'पोर्टल सुरक्षित ऑफ़लाइन कैश से डेटा दिखा रहा है।',

    // Hero
    admin_region_badge: 'जनपद पंचायत दतिया · जिला दतिया · मध्य प्रदेश',
    hero_title: 'ग्राम पंचायत सैदौरा जन-सेवा पोर्टल',
    hero_tagline: '"हमारा गाँव, हमारी भागीदारी, हमारा विकास।"',
    hero_desc: 'ग्राम पंचायत सैदौरा के नागरिक अब पेयजल, सड़क, नाली, स्ट्रीट लाइट, आवास और योजनाओं से जुड़ी अपनी समस्याएँ बिना किसी परेशानी के ऑनलाइन दर्ज कर सकते हैं एवं अपनी शिकायत की वास्तविक प्रगति ट्रैक कर सकते हैं।',
    hero_disclaimer_title: 'स्वतंत्र सामुदायिक पोर्टल:',
    hero_disclaimer_desc: 'यह ग्राम पंचायत सैदौरा के नागरिकों की सुविधा हेतु बनाया गया स्वतंत्र मंच है। आधिकारिक CM Helpline के लिए 181 डायल करें।',
    hero_stats_title: 'ग्राम पंचायत जन-सेवा सांख्यिकी',
    stat_total_complaints: 'कुल दर्ज शिकायतें',
    stat_resolved: 'सफलतापूर्वक निराकृत',
    stat_ongoing_works: 'चल रहे विकास कार्य',
    stat_upcoming_sabha: 'आगामी ग्राम सभा',
    sabha_date: '20 अक्टूबर 2026',
    sabha_venue: 'स्थान: पंचायत भवन, सैदौरा',
    view_agenda: 'एजेंडा देखें',
    badge_transparent: 'पारदर्शी कार्रवाई व रसीद',
    badge_otp: 'मोबाइल OTP सत्यापन',
    badge_sheets: 'Google Sheets सिंक्रोनाइज़्ड',

    // Search
    search_placeholder: 'पोर्टल पर खोजें: योजनाएँ, कार्य, या समाचार... (उदा. लाड़ली बहना, सोलर लाइट, नल-जल)',
    clear: 'साफ़ करें',

    // Sections
    news_kicker: 'गाँव की हलचल एवं सूचनाएँ',
    news_title: 'गाँव की ताजा खबरें एवं घोषणाएँ',
    news_source: 'स्रोत: पंचायत सूचना पट्ट एवं सार्वजनिक सूचनाएँ',
    
    works_kicker: 'गाँव की अधोसंरचना एवं प्रगति',
    works_title: 'पंचायत के विकास कार्य',
    works_desc: 'चल रहे एवं पूर्ण हो चुके विकास कार्यों का पारदर्शी ब्यौरा।',
    works_filter_all: 'सभी कार्य',
    works_filter_ongoing: 'प्रगतिरत',
    works_filter_completed: 'पूर्ण कार्य',

    schemes_kicker: 'जनकल्याण एवं शासकीय लाभ',
    schemes_title: 'प्रमुख सरकारी योजनाएँ',
    schemes_desc: 'ग्रामवासियों के लिए पात्रता, आवश्यक दस्तावेज एवं आधिकारिक आवेदन प्रक्रिया।',

    sabha_kicker: 'लोकतांत्रिक भागीदारी एवं निर्णय',
    sabha_title: 'ग्राम सभा एवं पंचायत की सार्वजनिक कार्यवाही',
    sabha_upcoming_tag: 'महत्वपूर्ण सूचना · आगामी बैठक',
    sabha_decisions_title: 'विगत ग्राम सभा के निर्णय एवं सार्वजनिक प्रस्ताव',

    gallery_kicker: 'गाँव की झांकी एवं विकास',
    gallery_title: 'फोटो एवं दृश्य गैलरी',

    rep_kicker: 'प्रशासनिक एवं जन-प्रतिनिधित्व',
    rep_title: 'पंचायत प्रतिनिधि एवं प्रशासनिक अधिकारी',

    helpline_kicker: 'आपातकालीन एवं शासकीय सहायता',
    helpline_title: 'महत्वपूर्ण हेल्पलाइन एवं संपर्क नंबर',
    toll_free: 'टोल-फ्री / निःशुल्क सेवा'
  },
  en: {
    // Header
    portal_name: 'Saidoura Jan-Seva Portal',
    panchayat_subtitle: 'Gram Panchayat Saidoura · Datia (M.P.)',
    nav_home: 'Home',
    nav_works: 'Development Works',
    nav_schemes: 'Govt Schemes',
    nav_gram_sabha: 'Gram Sabha',
    nav_news: 'Village News',
    nav_representatives: 'Representatives',
    nav_helpline: 'Helplines',
    track_complaint: 'Track Complaint',
    new_complaint: 'File New Complaint',
    btn_new_complaint_short: '+ New Complaint',
    citizen_login: 'Citizen Login (OTP)',
    my_complaints: 'My Complaints',
    admin_panel: 'Admin Panel',
    logout: 'Logout',
    admin_login_tooltip: 'Admin Login',

    // Offline & Sheets Status
    net_browser_online: 'Online',
    net_browser_offline: 'Offline (No Internet)',
    net_sheets_connected: 'Google Sheets Connected',
    net_sheets_live: 'Sheets Live',
    net_sheets_disconnected: 'Google Sheets Disconnected',
    net_sheets_offline: 'Sheets Offline',
    net_checking: 'Checking...',
    net_sync_now: 'Sync Now',
    net_retry: 'Retry Connection',
    net_status_title: 'System & Network Status',
    net_browser_label: 'Browser Internet Connection',
    net_sheets_label: 'Google Sheets 9-Tab CMS Backend',
    net_last_synced: 'Last Successful Sync',
    net_never_synced: 'Never',
    net_alert_browser_offline: '⚠️ You are currently offline. New complaints or live updates will require an active internet connection.',
    net_alert_sheets_offline: '⚠️ Disconnected from Google Sheets backend. The portal is displaying cached offline data.',
    net_cached_notice: 'The portal is serving data from the local cache.',

    // Hero
    admin_region_badge: 'Janpad Panchayat Datia · District Datia · Madhya Pradesh',
    hero_title: 'Gram Panchayat Saidoura Citizen Portal',
    hero_tagline: '"Our Village, Our Participation, Our Development."',
    hero_desc: 'Citizens of Gram Panchayat Saidoura can now lodge their grievances regarding water supply, roads, drainage, streetlights, housing and government schemes online and track transparent resolution progress in real time.',
    hero_disclaimer_title: 'Independent Community Portal:',
    hero_disclaimer_desc: 'This is an independent community facilitation portal for residents of Saidoura. For official MP state grievance escalation, call CM Helpline 181.',
    hero_stats_title: 'Gram Panchayat Public Service Metrics',
    stat_total_complaints: 'Total Complaints',
    stat_resolved: 'Successfully Resolved',
    stat_ongoing_works: 'Ongoing Works',
    stat_upcoming_sabha: 'Next Gram Sabha',
    sabha_date: 'October 20, 2026',
    sabha_venue: 'Venue: Panchayat Bhawan, Saidoura',
    view_agenda: 'View Agenda',
    badge_transparent: 'Transparent Resolution & Receipt',
    badge_otp: 'Mobile OTP Verification',
    badge_sheets: 'Google Sheets Synchronized',

    // Search
    search_placeholder: 'Search portal: Schemes, works, or announcements... (e.g. Ladli Behna, solar, water)',
    clear: 'Clear',

    // Sections
    news_kicker: 'Village Announcements & Bulletins',
    news_title: 'Latest Village News & Notices',
    news_source: 'Source: Panchayat Notice Board & Public Records',

    works_kicker: 'Village Infrastructure & Progress',
    works_title: 'Panchayat Development Works',
    works_desc: 'Transparent record of ongoing and completed rural infrastructure projects.',
    works_filter_all: 'All Works',
    works_filter_ongoing: 'Ongoing',
    works_filter_completed: 'Completed',

    schemes_kicker: 'Public Welfare & Welfare Benefits',
    schemes_title: 'Government Welfare Schemes',
    schemes_desc: 'Eligibility criteria, mandatory documentation and official application channels for residents.',

    sabha_kicker: 'Democratic Participation & Governance',
    sabha_title: 'Gram Sabha Meetings & Public Resolutions',
    sabha_upcoming_tag: 'Official Notice · Upcoming Assembly',
    sabha_decisions_title: 'Past Gram Sabha Resolutions & Decisions',

    gallery_kicker: 'Village Life & Infrastructure',
    gallery_title: 'Photo & Media Gallery',

    rep_kicker: 'Administration & Representatives',
    rep_title: 'Panchayat Representatives & Officials',

    helpline_kicker: 'Emergency & Citizen Assistance',
    helpline_title: 'Important Helplines & Contacts',
    toll_free: 'Toll-Free / 24x7 Assistance'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('saidoura_portal_lang');
    return saved === 'en' ? 'en' : 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('saidoura_portal_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['hi']?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
