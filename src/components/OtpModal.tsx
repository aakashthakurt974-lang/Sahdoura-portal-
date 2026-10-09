import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { X, Phone, KeyRound, CheckCircle, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

export const OtpModal: React.FC = () => {
  const { isOtpModalOpen, closeOtpModal, loginAsCitizen } = useAuth();
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOtpModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('कृपया वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (शुरुआत 6, 7, 8, या 9 से)।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(cleanMobile, name.trim());
      if (res.isDemoMode && res.demoOtp) {
        setDemoOtpNotice(res.demoOtp);
        // Pre-fill demo OTP for convenience while showing transparent warning
        setOtp(res.demoOtp);
      } else {
        setDemoOtpNotice(null);
      }
      setCooldown(60);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'OTP भेजने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length !== 6) {
      setError('कृपया 6 अंकों का सही OTP दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile.trim(), otp.trim());
      loginAsCitizen(res.token, res.user);
      // Reset state
      setStep('input');
      setMobile('');
      setOtp('');
      setName('');
      setDemoOtpNotice(null);
    } catch (err: any) {
      setError(err.message || 'OTP सत्यापन विफल रहा।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">नागरिक सुरक्षित लॉगिन</h3>
          </div>
          <button
            onClick={closeOtpModal}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                शिकायत दर्ज करने या अपनी शिकायतों की स्थिति देखने के लिए अपना नाम और 10 अंकों का मोबाइल नंबर दर्ज करें।
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  आपका पूरा नाम (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. रामप्रसाद कुशवाहा"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाइल नंबर <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-12 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  इस नंबर पर 6 अंकों का सत्यापन कोड (OTP) भेजा जाएगा।
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                <span>OTP प्राप्त करें</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {demoOtpNotice && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    DEMO — वास्तविक OTP प्रदाता अभी कॉन्फ़िगर नहीं है
                  </div>
                  <p className="text-[11px]">
                    परीक्षण सत्यापन कोड: <strong className="font-mono text-sm text-blue-900">{demoOtpNotice}</strong>
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    6 अंकों का OTP दर्ज करें
                  </label>
                  <span className="text-xs text-slate-500 font-mono">
                    +91 {mobile}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-widest text-xl font-bold font-mono py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setError(null);
                  }}
                  className="hover:text-blue-900 underline"
                >
                  मोबाइल नंबर बदलें
                </button>

                {cooldown > 0 ? (
                  <span>पुनः भेजें ({cooldown}s)</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-900 font-semibold hover:underline"
                  >
                    OTP पुनः भेजें
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>सत्यापित करें एवं लॉगिन करें</span>
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            सुरक्षित एवं गोपनीय · डेटा केवल शिकायत निवारण के लिए प्रयुक्त
          </div>
        </div>
      </div>
    </div>
  );
};
