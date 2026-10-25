import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t } = useLanguage();

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#E6F4EA] text-[#075C42]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t.installed}
      </span>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#138A62] text-white hover:bg-[#075C42] shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.installApp}</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E6F4EA] text-[#075C42] hover:bg-[#cdecd8] transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS PWA</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] flex items-center justify-center text-[#075C42]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#24342D]">
                  iPhone / iPad орнату
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#24342D]/90">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#138A62] text-white text-xs font-bold shrink-0">
                  1
                </span>
                <p>Safari браузеріндегі төмендегі <strong>Бөлісу (Share)</strong> белгішесін басыңыз.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#138A62] text-white text-xs font-bold shrink-0">
                  2
                </span>
                <p>Тізімнен <strong>«Басты экранға қосу» (Add to Home Screen)</strong> таңдаңыз.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#138A62] text-white text-xs font-bold shrink-0">
                  3
                </span>
                <p>Оң жақ жоғарыдағы <strong>Қосу (Add)</strong> батырмасын басып, толық экранды қосымша ретінде пайдаланыңыз.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-[#075C42] py-2.5 text-sm font-semibold text-white hover:bg-[#054531] transition shadow-sm"
            >
              Түсінікті / Жабу
            </button>
          </div>
        </div>
      )}
    </>
  );
};
