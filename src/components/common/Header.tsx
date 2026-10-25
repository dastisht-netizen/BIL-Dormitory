import React, { useState, useEffect } from 'react';
import {
  Globe,
  UserCheck,
  Clock,
  LogOut,
  ChevronDown,
  Sparkles,
  School,
  Shield,
  BookOpen,
  Utensils,
  GraduationCap,
  Key,
  Megaphone,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { storage } from '../../db/storage';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationManager } from './NotificationManager';
import { Language, Role } from '../../types';

interface HeaderProps {
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin }) => {
  const {
    currentUser,
    switchRole,
    login,
    logout,
    siteConfig,
    isEducator,
    isClassTeacher,
    isAdmin,
    isCafeteria,
  } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [currentYear, setCurrentYear] = useState(() => storage.getCurrentAcademicYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin@bil-arys.edu.kz');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const isSelfStudyTime = hours >= 19 && hours < 21;

  const roleLabels: Record<Role, { title: string; icon: any; color: string }> = {
    ADMINISTRATOR: { title: t.roles.ADMINISTRATOR, icon: Shield, color: 'bg-emerald-100 text-[#075C42]' },
    EDUCATOR: { title: t.roles.EDUCATOR, icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    CLASS_TEACHER: { title: t.roles.CLASS_TEACHER, icon: GraduationCap, color: 'bg-amber-100 text-amber-800' },
    CAFETERIA_STAFF: { title: t.roles.CAFETERIA_STAFF, icon: Utensils, color: 'bg-purple-100 text-purple-800' },
  };

  const currentRoleInfo = roleLabels[currentUser.role] || roleLabels.ADMINISTRATOR;
  const RoleIcon = currentRoleInfo.icon;

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const result = login(loginIdentifier, loginPassword);
    if (result.success) {
      setShowLoginModal(false);
      if (onOpenAdmin) onOpenAdmin();
    } else {
      setLoginError(result.message || 'Қате орын алды');
    }
  };

  const handleQuickAdminLogin = () => {
    login('admin@bil-arys.edu.kz', 'admin123');
    setShowLoginModal(false);
    setShowRoleModal(false);
    if (onOpenAdmin) onOpenAdmin();
  };

  return (
    <>
      {/* Announcement Bar */}
      {siteConfig.announcementActive && siteConfig.announcement && (
        <div className="bg-[#FFE9A8] text-[#075C42] px-4 py-1.5 text-xs font-bold border-b border-[#F5B838]/40 flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <Megaphone className="w-4 h-4 shrink-0 text-[#075C42] animate-bounce" />
            <span className="truncate">{siteConfig.announcement}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#075C42] to-[#138A62] shadow-md shadow-[#075C42]/20 text-white shrink-0">
              <School className="w-6 h-6 text-[#FFE9A8]" />
              {isSelfStudyTime && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#075C42]">
                  {siteConfig.schoolName}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFE9A8] text-[#075C42]">
                  {currentYear?.name || '2026–2027'}
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-medium text-gray-500 leading-tight">
                {siteConfig.subtitle || t.subtitle}
              </p>
            </div>
          </div>

          {/* Live Study Status & Clock */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-gray-100 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#138A62]" />
              <span>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-1.5 font-semibold">
              {isSelfStudyTime ? (
                <span className="flex items-center gap-1 text-[#138A62]">
                  <span className="w-2 h-2 rounded-full bg-[#138A62] animate-pulse" />
                  Кешкі дайындық ({siteConfig.studyStartTime}–{siteConfig.studyEndTime})
                </span>
              ) : (
                <span className="text-gray-500">
                  Кешкі дайындық: {siteConfig.studyStartTime}–{siteConfig.studyEndTime}
                </span>
              )}
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge / Direct Admin Panel Trigger */}
            {isAdmin ? (
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#075C42] text-[#FFE9A8] text-xs font-extrabold hover:bg-[#054531] shadow-xs transition"
                title="Сайтты басқару панелін ашу"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Сайтты басқару</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
                title="Админ ретінде кіру"
              >
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Админ кіру</span>
              </button>
            )}

            {/* PWA Install */}
            <PWAInstallButton />

            {/* Notifications */}
            <NotificationManager />

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                title="Тілді таңдау"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left font-medium hover:bg-[#E6F4EA] transition ${
                        language === l.code ? 'text-[#075C42] font-bold bg-[#E6F4EA]/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User profile & Role Switcher */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#138A62] hover:bg-[#E6F4EA]/40 transition text-left"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                isAdmin ? 'bg-[#075C42] text-[#FFE9A8]' : 'bg-[#138A62] text-white'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#24342D] max-w-[120px] truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-[#138A62] flex items-center gap-1">
                  <span>{currentRoleInfo.title}</span>
                  {currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0 && (
                    <span className="text-gray-500">
                      ({currentUser.assignedClassIds.map(id => id.replace('cls-', '').toUpperCase()).join(', ')})
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Admin Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#075C42] text-[#FFE9A8] flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#24342D]">Администратор ретінде кіру</h3>
                    <p className="text-[11px] text-gray-400">Сайтты және деректерді толық басқару</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {loginError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginFormSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email немесе Логин</label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin@bil-arys.edu.kz немесе admin"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Құпиясөз (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
                  <span className="font-bold text-[#075C42] block mb-0.5">Бастапқы әкімші деректері:</span>
                  Логин: <code>admin@bil-arys.edu.kz</code> | Құпиясөз: <code>admin123</code>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleQuickAdminLogin}
                    className="text-xs font-bold text-[#138A62] hover:underline"
                  >
                    1-басумен Админге кіру
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Болдырмау
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
                    >
                      Кіру
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Selection Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#075C42]" />
                  <h3 className="font-bold text-base text-[#24342D]">{t.switchRole}</h3>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Тестілеу немесе жұмыс істеу үшін қажетті рөлді таңдаңыз:
              </p>

              <div className="mt-4 space-y-2.5">
                <button
                  onClick={() => {
                    handleQuickAdminLogin();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isAdmin
                      ? 'border-[#075C42] bg-[#E6F4EA] text-[#075C42] font-bold'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#24342D]">Нұрлан Сейітқалиұлы</div>
                      <div className="text-xs text-gray-500">Әкімші (Сайтты толық басқару және өзгерту)</div>
                    </div>
                  </div>
                  {isAdmin && <span className="text-xs font-bold text-[#075C42]">Ағымдағы</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('EDUCATOR', 'cls-7a');
                    setShowRoleModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isEducator && currentUser.assignedClassIds?.includes('cls-7a')
                      ? 'border-[#138A62] bg-[#E6F4EA] text-[#075C42] font-bold'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#24342D]">Ерлан Бақытұлы</div>
                      <div className="text-xs text-gray-500">Тәрбиеші (7A және 7B сыныптары)</div>
                    </div>
                  </div>
                  {isEducator && currentUser.assignedClassIds?.includes('cls-7a') && (
                    <span className="text-xs font-bold text-[#075C42]">Ағымдағы</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    switchRole('CLASS_TEACHER', 'cls-7a');
                    setShowRoleModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isClassTeacher
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#24342D]">Айнұр Серікқызы</div>
                      <div className="text-xs text-gray-500">Сынып жетекшісі (7А сыныбы)</div>
                    </div>
                  </div>
                  {isClassTeacher && <span className="text-xs font-bold text-amber-800">Ағымдағы</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('CAFETERIA_STAFF');
                    setShowRoleModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isCafeteria
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#24342D]">Баян Әбдікерімқызы</div>
                      <div className="text-xs text-gray-500">Асхана қызметкері (Тамақтану есебі)</div>
                    </div>
                  </div>
                  {isCafeteria && <span className="text-xs font-bold text-purple-800">Ағымдағы</span>}
                </button>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition"
                >
                  Жабу
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
