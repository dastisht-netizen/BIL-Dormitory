import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, X, Volume2, ShieldAlert } from 'lucide-react';
import { SystemNotification } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const NotificationManager: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeToast, setActiveToast] = useState<SystemNotification | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load initial simulated notifications
    const initial: SystemNotification[] = [
      {
        id: 'notif-1',
        title: 'Кешкі өзіндік дайындық',
        message: 'Сағат 19:00 — Кешкі дайындық басталды. Оқушылардың қатысуын тексеріңіз.',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'info',
      },
      {
        id: 'notif-2',
        title: 'Бейсенбілік ескерту',
        message: 'Сенбі-жексенбі күнгі тамақтану және жатақхана тізімін бекіту қажет!',
        timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
        type: 'warning',
      },
    ];
    setNotifications(initial);

    // Interval checker for reminder times (19:00, 19:30, 21:00, etc.)
    const timer = setInterval(() => {
      checkScheduledReminders();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Браузер хабарламаларды қолдамайды');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        sendPush('ARYS BIL TRACKER', 'Хабарламалар сәтті қосылды! Жүйе кесте бойынша ескертіп отырады.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendPush = (title: string, body: string, type: SystemNotification['type'] = 'info') => {
    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      title,
      message: body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 6000);

    // Browser Web Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/pwa-192x192.png',
        });
      } catch (err) {
        console.warn('Native notification failed', err);
      }
    }
  };

  const checkScheduledReminders = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const settings = storage.getSettings();
    const day = now.getDay(); // 4 = Thursday

    // 19:00 Start Self-study
    if (settings.selfStudyStartReminder && timeStr === settings.selfStudyStartTime) {
      sendPush('Кешкі өзіндік дайындық басталды', '19:00 — Барлық тәрбиешілер оқушылардың қатысуын белгілеуі қажет.', 'info');
    }
    // 19:30 Mid reminder
    if (settings.selfStudyMidReminder && timeStr === settings.selfStudyMidTime) {
      sendPush('Ескерту: Дайындық тексерісі', '19:30 — Үй тапсырмасын тексеруді бастаңыз.', 'warning');
    }
    // 21:00 End reminder
    if (settings.selfStudyEndReminder && timeStr === settings.selfStudyEndTime) {
      sendPush('Дайындықты аяқтау', '21:00 — Күндізгі мониторингті аяқтап, жүйеге растаңыз!', 'alert');
    }
    // Thursday meal reminder
    if (day === 4 && settings.thursdayMealReminder && timeStr === settings.thursdayMealTime) {
      sendPush('Бейсенбілік растау', 'Демалыс күндеріне асхана және жатақхана тізімін бекіту мерзімі жақындады!', 'warning');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Toast Alert */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border-l-4 border-[#138A62] animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#E6F4EA] text-[#075C42]">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24342D]">{activeToast.title}</h4>
                <p className="text-xs text-[#24342D]/80 mt-1 leading-relaxed">{activeToast.message}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">{activeToast.timestamp}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bell Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl text-gray-600 hover:text-[#075C42] hover:bg-[#E6F4EA] transition"
          title="Хабарламалар"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 z-50">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#075C42]" />
                <h3 className="font-bold text-sm text-[#24342D]">Хабарламалар орталығы</h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#138A62] hover:underline font-medium"
                  >
                    Оқылды ету
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Browser Permission status */}
            {permission !== 'granted' && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#FFF8E7] border border-[#FFE9A8] flex items-center justify-between">
                <span className="text-xs text-[#24342D] font-medium">Браузер хабарламалары қосылмаған</span>
                <button
                  onClick={requestPermission}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#075C42] text-white hover:bg-[#054531]"
                >
                  Қосу
                </button>
              </div>
            )}

            {/* Quick Test Reminders */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Тестілік ескерту жіберу:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => sendPush('19:00 Дайындық басталды', 'Оқушылар аудиторияларға жиналды. Тізімді тексеріңіз!')}
                  className="px-2 py-0.5 text-[11px] rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  19:00
                </button>
                <button
                  onClick={() => sendPush('21:00 Мониторинг аяқтау', 'Күндізгі мониторингті растап, бақылауды тапсырыңыз!', 'alert')}
                  className="px-2 py-0.5 text-[11px] rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  21:00
                </button>
                <button
                  onClick={() => sendPush('Бейсенбі: Тамақтану', 'Демалыс күндеріне асхана тізімін бекітіңіз!', 'warning')}
                  className="px-2 py-0.5 text-[11px] rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Асхана
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400">Хабарламалар жоқ</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl transition ${
                      n.read ? 'bg-gray-50/70' : 'bg-[#E6F4EA]/60 border border-[#138A62]/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        {n.type === 'alert' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        ) : n.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#075C42]" />
                        )}
                        <h4 className="text-xs font-bold text-[#24342D]">{n.title}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#24342D]/85 mt-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
