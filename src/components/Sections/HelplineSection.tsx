import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PhoneCall, Shield, AlertTriangle, HeartPulse, Building2, HelpCircle } from 'lucide-react';

export const HelplineSection: React.FC = () => {
  const { t } = useLanguage();
  const helplines = [
    {
      number: '181',
      title: 'सीएम हेल्पलाइन (CM Helpline म.प्र.)',
      subtitle: 'मध्य प्रदेश शासन की राज्य-स्तरीय समाधान प्रणाली',
      desc: 'किसी भी शासकीय योजना, समस्या अथवा अधिकारी स्तर पर अनिस्तारित प्रकरणों हेतु 24x7 कॉल करें।'
    },
    {
      number: '112',
      title: 'आपातकालीन सेवा (Emergency)',
      subtitle: 'पुलिस, अग्निशमन एवं आपातकालीन प्रतिक्रिया',
      desc: 'गाँव में किसी भी त्वरित सुरक्षा, विवाद अथवा आपात स्थिति में संपर्क करें।'
    },
    {
      number: '108',
      title: 'संजीवनी एम्बुलेंस सेवा',
      subtitle: 'त्वरित चिकित्सीय आपात सेवा (दतिया)',
      desc: 'गंभीर बीमारी, प्रसूति अथवा दुर्घटना के समय तत्काल शासकीय एम्बुलेंस हेतु।'
    },
    {
      number: '1800-233-1266',
      title: 'विद्युत वितरण कंपनी (मध्य क्षेत्र)',
      subtitle: 'बिजली फॉल्ट व ट्रांसफार्मर शिकायत',
      desc: 'गाँव में बिजली गुल होने, तार टूटने अथवा ट्रांसफार्मर जलने पर शिकायत दर्ज कराएँ।'
    }
  ];

  return (
    <section id="helpline-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="text-xs font-bold text-red-700 tracking-wider uppercase mb-1">
              {t('helpline_kicker')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('helpline_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            दतिया जिला एवं मध्य प्रदेश शासन आपातकालीन सेवाएं
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {helplines.map((item) => (
            <div
              key={item.number}
              className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100/70 text-red-900 rounded-lg font-mono font-bold text-lg">
                  <PhoneCall className="w-4 h-4 text-red-700" />
                  <span>{item.number}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-500">
                टोल-फ्री / निःशुल्क सेवा
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
