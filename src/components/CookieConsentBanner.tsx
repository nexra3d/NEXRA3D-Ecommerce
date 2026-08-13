import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Settings, Check, X, Lock } from 'lucide-react';

interface CookieConsentBannerProps {
  onNavigatePrivacyPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigatePrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Cookie Preference States
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    // Check if user has already saved consent preferences
    const storedConsent = localStorage.getItem('nexra3d_cookie_consent_v1');
    if (!storedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        setAnalyticsOptIn(Boolean(parsed.analytics));
        setMarketingOptIn(Boolean(parsed.marketing));
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  const saveConsent = async (analytics: boolean, marketing: boolean) => {
    const preferences = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
      noticeVersion: 'v1.0'
    };

    localStorage.setItem('nexra3d_cookie_consent_v1', JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);

    // Record consent with backend
    try {
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'NECESSARY',
          status: 'GRANTED',
          noticeVersion: 'v1.0',
          consentText: 'Essential session & security cookies accepted'
        })
      });

      if (analytics) {
        await fetch('/api/privacy/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purpose: 'ANALYTICS',
            status: 'GRANTED',
            noticeVersion: 'v1.0',
            consentText: 'Analytics performance cookies accepted'
          })
        });
      }

      if (marketing) {
        await fetch('/api/privacy/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purpose: 'MARKETING_EMAIL',
            status: 'GRANTED',
            noticeVersion: 'v1.0',
            consentText: 'Marketing & offers consent accepted'
          })
        });
      }
    } catch (err) {
      console.warn('Failed to record consent on server:', err);
    }
  };

  const handleAcceptAll = () => {
    setAnalyticsOptIn(true);
    setMarketingOptIn(true);
    saveConsent(true, true);
  };

  const handleRejectNonEssential = () => {
    setAnalyticsOptIn(false);
    setMarketingOptIn(false);
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsOptIn, marketingOptIn);
  };

  if (!isVisible && !showPreferences) {
    return (
      <button
        onClick={() => setShowPreferences(true)}
        className="fixed bottom-4 left-4 z-40 bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2 text-xs font-semibold px-3 border border-slate-700"
        title="Manage Cookie Preferences"
      >
        <Cookie className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Cookie Preferences</span>
      </button>
    );
  }

  return (
    <>
      {/* Floating Sticky Bottom Banner */}
      {isVisible && !showPreferences && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl transition-all animate-in slide-in-from-bottom-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-amber-400 shrink-0">
                <Cookie className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">Cookie & Privacy Choices</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Notice v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We use cookies to maintain your active cart, secure your session, and process orders. You can customize non-essential cookies or accept all. See our{' '}
                  <button
                    onClick={onNavigatePrivacyPolicy}
                    className="text-indigo-400 underline hover:text-indigo-300 font-medium"
                  >
                    Privacy Policy
                  </button>{' '}
                  for details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" /> Customize
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Reject Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> Accept All
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Privacy & Cookie Preferences</h3>
                  <p className="text-xs text-slate-500">Configure your consent settings (Notice v1.0)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Essential */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Essential / Security Cookies</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Required for basic site navigation, shopping cart persistence, payment processing via Razorpay, and user authentication. Cannot be disabled.
                  </p>
                </div>
                <div className="p-2 text-emerald-600">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-900">Performance & Analytics</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Allows us to analyze site traffic, page speed, and catalog usage to improve high-precision 3D printing services.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={analyticsOptIn}
                    onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-900">Marketing & Promotional Offers</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Allows NEXRA 3D to send discount coupons, new product arrivals, and specialized 3D printing offers via email.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                onClick={onNavigatePrivacyPolicy}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Read Privacy Policy
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Reject Optional
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
