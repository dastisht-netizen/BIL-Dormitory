import React, { useState, useEffect } from 'react';
import {
  Globe,
  UserCheck,
  Clock,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  BookOpen,
  Utensils,
  GraduationCap,
  Key,
  Megaphone,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Sliders,
  Home,
  CalendarDays,
  BarChart2,
  FileSpreadsheet,
  Building2,
  Users,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { storage } from '../../db/storage';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationManager } from './NotificationManager';
import { BilLogo } from './BilLogo';
import { Language, Role, User } from '../../types';
import { NavTab } from './Sidebar';
import { PasswordChangeModal } from '../profile/PasswordChangeModal';

interface HeaderProps {
  onOpenAdmin?: () => void;
  activeTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, activeTab = 'dashboard', onSelectTab }) => {
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const roleLabels: Record<Role, { title: string; icon: any; color: string; bg: string }> = {
    ADMINISTRATOR: { title: 'Жатақхана меңгерушісі', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
    EDUCATOR: { title: 'Тәрбиеші', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
    CLASS_TEACHER: { title: 'Сынып жетекшісі', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
    CAFETERIA_STAFF: { title: 'Асхана қызметкері', icon: Utensils, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
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
    login('900101300000', 'BIL#1234');
    setShowLoginModal(false);
    setShowRoleModal(false);
    if (onOpenAdmin) onOpenAdmin();
  };

  const handleQuickRoleSwitch = (roleKey: 'manager' | 'educator' | 'teacher' | 'cafeteria') => {
    if (roleKey === 'manager') {
      if (!isAdmin) {
        handleQuickAdminLogin();
      } else if (onOpenAdmin) {
        onOpenAdmin();
      }
    } else if (roleKey === 'educator') {
      switchRole('EDUCATOR', 'cls-7a');
      if (onSelectTab) onSelectTab('self_study');
    } else if (roleKey === 'teacher') {
      switchRole('CLASS_TEACHER', 'cls-7a');
      if (onSelectTab) onSelectTab('students');
    } else if (roleKey === 'cafeteria') {
      switchRole('CAFETERIA_STAFF');
      if (onSelectTab) onSelectTab('meals');
    }
  };

  // Nav buttons for horizontal navigation sub-bar
  const subNavItems = [
    { id: 'dashboard' as NavTab, label: 'Басты бет', icon: Home },
    { id: 'students' as NavTab, label: 'Оқушылар', icon: Users },
    { id: 'self_study' as NavTab, label: 'Кешкі қатысу', icon: Clock },
    { id: 'homework' as NavTab, label: 'Үй тапсырмасы', icon: BookOpen },
    { id: 'dormitory' as NavTab, label: 'Жатақхана', icon: Building2 },
    { id: 'meals' as NavTab, label: 'Асхана тізімі', icon: Utensils },
    { id: 'timetables' as NavTab, label: 'Кесте', icon: CalendarDays },
    { id: 'analytics' as NavTab, label: 'Аналитика', icon: BarChart2 },
    { id: 'quarterly_reports' as NavTab, label: 'Тоқсандық есеп', icon: FileSpreadsheet },
    { id: 'settings' as NavTab, label: 'Сайтты басқару', icon: Sliders, highlight: true },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {siteConfig.announcementActive && siteConfig.announcement && (
        <div className="bg-[#FFE9A8] text-[#075C42] px-4 py-1 text-xs font-bold border-b border-[#F5B838]/40 flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <Megaphone className="w-4 h-4 shrink-0 text-[#075C42] animate-bounce" />
            <span className="truncate">{siteConfig.announcement}</span>
          </div>
        </div>
      )}

      {/* Main Top Header: Deep Slate Navy (#0F172A) */}
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-[#1E293B] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: BilLogo & School Brand */}
            <div className="flex items-center gap-3">
              <BilLogo className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                    {siteConfig.appTitle || 'BIL Dormitory'}
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#4338CA] text-white shadow-2xs">
                    {siteConfig.schoolName || 'Арыс БІЛ'}
                  </span>
                </div>
                <p className="hidden md:block text-[11px] font-medium text-slate-400 leading-tight">
                  {siteConfig.subtitle || 'Өзін-өзі дайындық және жатақхана мониторингі'}
                </p>
              </div>
            </div>

            {/* Center: Live Self-Study Clock badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-[#1E293B] border border-slate-700 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-200">
                {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-slate-500">•</span>
              <span className={isSelfStudyTime ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-400'}>
                {isSelfStudyTime && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                Дайындық: {siteConfig.studyStartTime}–{siteConfig.studyEndTime}
              </span>
            </div>

            {/* Right: Quick Role Switcher + Language + Admin button */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Desktop Direct Role Switcher Pills */}
              <div className="hidden xl:flex items-center bg-[#1E293B] p-1 rounded-xl border border-slate-800 text-[11px] font-semibold gap-1">
                <button
                  onClick={() => handleQuickRoleSwitch('manager')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    isAdmin ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Жатақхана меңгерушісі (Әкімші)"
                >
                  <Shield className="w-3 h-3" />
                  <span>Меңгеруші (Админ)</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('educator')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    isEducator ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Тәрбиеші"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Тәрбиеші</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('teacher')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    isClassTeacher ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Сынып жетекшісі"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Жетекші</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('cafeteria')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    isCafeteria ? 'bg-purple-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Асхана қызметкері"
                >
                  <Utensils className="w-3 h-3" />
                  <span>Асхана</span>
                </button>
              </div>

              {/* Direct Site Settings (Admin) Button */}
              {isAdmin ? (
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    if (onSelectTab) onSelectTab('settings');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-md hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                  title="Сайтты басқару және параметрлерді өзгерту"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-950" />
                  <span>Сайтты басқару</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/10 transition shadow-2xs"
                  title="Админ ретінде кіру"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Админ кіру</span>
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
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                  title="Тілді таңдау"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="uppercase">{language}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#1E293B] shadow-xl border border-slate-700 py-1 z-50 animate-in fade-in">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left font-medium transition ${
                          language === l.code ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User profile & Role Modal Trigger */}
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#1E293B] border border-slate-700 hover:border-slate-500 transition text-left"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                    isAdmin ? 'bg-amber-500 text-slate-950 font-black' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-100 max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <span>{currentRoleInfo.title}</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Password Change Button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500 hover:text-white transition text-xs font-bold shadow-xs cursor-pointer"
                title="Жеке құпиясөзді өзгерту"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Пароль өзгерту</span>
              </button>

              {/* Clear Logout Button */}
              <button
                onClick={() => {
                  logout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition text-xs font-bold shadow-xs cursor-pointer"
                title="Жүйеден шығу (Авторизация терезесіне оралу)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Шығу</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar: Quick Horizontally Scrollable Tabs */}
          {onSelectTab && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-[#1E293B] no-scrollbar text-xs">
              {subNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 font-bold shrink-0 ${
                      isActive
                        ? item.highlight
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-[#4338CA] text-white shadow-sm'
                        : item.highlight
                        ? 'text-amber-400 hover:bg-amber-400/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-left text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#075C42] text-[#FFE9A8] flex items-center justify-center font-black">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#24342D]">Администратор ретінде кіру</h3>
                    <p className="text-[11px] text-gray-400">Сайтты және барлық деректерді өзгерту құқығы</p>
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

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900">
                  <span className="font-bold text-[#075C42] block mb-0.5">Бастапқы әкімші логині:</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-slate-900">
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
                Жүйедегі рөлді таңдаңыз немесе жеке құпиясөзіңізді жаңартыңыз:
              </p>

              <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {/* Master Admin */}
                <button
                  onClick={() => {
                    handleQuickAdminLogin();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                    isAdmin
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#24342D]">Достонбек Тажиханов</div>
                      <div className="text-xs text-amber-800 font-semibold">Жатақхана меңгерушісі (Сайт әкімшісі)</div>
                    </div>
                  </div>
                  {isAdmin && <span className="text-xs font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">Белсенді</span>}
                </button>

                {/* Dynamically Registered Staff */}
                {storage.getUsers().filter((u) => u.id !== 'user-admin').map((u) => {
                  const isCurrent = currentUser.id === u.id;
                  const roleTitle = u.role === 'EDUCATOR' ? 'Тәрбиеші' : u.role === 'CLASS_TEACHER' ? 'Сынып жетекшісі' : u.role;
                  const assigned = u.assignedClassIds && u.assignedClassIds.length > 0 ? u.assignedClassIds.join(', ') : 'Сынып тағайындалмаған';
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        const res = login(u.iin || u.id, u.password);
                        setShowRoleModal(false);
                        if (res.success && onSelectTab) {
                          if (u.role === 'EDUCATOR') onSelectTab('self_study');
                          else if (u.role === 'CLASS_TEACHER') onSelectTab('dashboard');
                          else onSelectTab('meals');
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                        isCurrent
                          ? 'border-[#4338CA] bg-indigo-50 text-[#4338CA] font-bold'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#24342D]">{u.name}</div>
                          <div className="text-xs text-gray-500">
                            {roleTitle} • {assigned}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <span className="text-xs font-bold text-indigo-700 bg-indigo-200/60 px-2 py-0.5 rounded-md">Белсенді</span>}
                    </button>
                  );
                })}

                {storage.getUsers().filter((u) => u.id !== 'user-admin').length === 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Әзірге басқа қызметкерлер тіркелмеген. Меңгеруші (Достонбек Тажиханов) қызметкерлерді тіркеген соң осында көрінеді.
                  </div>
                )}
              </div>

              {/* Action: Change Password */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4338CA] text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Құпиясөзді өзгерту</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      logout();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Шығу</span>
                  </button>

                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                  >
                    Жабу
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Self-service Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </header>
    </>
  );
};
