import React, { useState, useEffect } from 'react';
import {
  Globe,
  Clock,
  LogOut,
  ChevronDown,
  Shield,
  BookOpen,
  Utensils,
  GraduationCap,
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
  KeyRound,
  Layers,
  Activity,
  UserCheck,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { storage } from '../../db/storage';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationManager } from './NotificationManager';
import { BilLogo } from './BilLogo';
import { Language, Role } from '../../types';
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
    logout,
    switchRole,
    siteConfig,
    isEducator,
    isClassTeacher,
    isAdmin,
    isCafeteria,
    canAccessTab,
    userAllowedRoles,
  } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const assignedClassLabel = React.useMemo(() => {
    if (currentUser.role === 'ADMINISTRATOR') return 'Барлық сыныптар';
    const classes = storage.getClasses();
    const matched = classes.find(
      (c) =>
        currentUser.assignedClassIds?.includes(c.id) ||
        c.educatorId === currentUser.id ||
        c.classTeacherId === currentUser.id
    );
    return matched?.name ? `${matched.name} сыныбы` : '';
  }, [currentUser]);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  // Dynamic Sub-Navigation Items strictly tailored to each role
  const subNavItems = React.useMemo(() => {
    if (currentUser.role === 'EDUCATOR') {
      return [
        { id: 'self_study' as NavTab, label: 'Кешкі дайындық (19:00 - 21:00)', icon: Moon },
        { id: 'attendance' as NavTab, label: 'Кешкі қатысу', icon: Clock },
        { id: 'homework' as NavTab, label: 'Үй тапсырмасы', icon: BookOpen },
        { id: 'meals' as NavTab, label: 'Асхана тізімі', icon: Utensils },
        { id: 'dormitory' as NavTab, label: 'Жатақхана', icon: Building2 },
      ];
    }

    if (currentUser.role === 'CLASS_TEACHER') {
      return [
        { id: 'dashboard' as NavTab, label: 'Басты бет', icon: Home },
        { id: 'students' as NavTab, label: 'Сынып оқушылары', icon: Users },
        { id: 'timetables' as NavTab, label: 'Сабақ кестесі', icon: CalendarDays },
        { id: 'attendance' as NavTab, label: 'Сабақ қатысуы', icon: UserCheck },
        { id: 'homework' as NavTab, label: 'Үй тапсырмалары', icon: BookOpen },
        { id: 'analytics' as NavTab, label: 'Сынып аналитикасы', icon: BarChart2 },
        { id: 'quarterly_reports' as NavTab, label: 'Тоқсандық есеп', icon: FileSpreadsheet },
      ];
    }

    if (currentUser.role === 'CAFETERIA_STAFF') {
      return [
        { id: 'dashboard' as NavTab, label: 'Басты бет', icon: Home },
        { id: 'meals' as NavTab, label: 'Асхана мәзірі және ас белгілеу', icon: Utensils },
        { id: 'dormitory' as NavTab, label: 'Жатақхана', icon: Building2 },
      ];
    }

    // ADMINISTRATOR: Full administration suite
    return [
      { id: 'dashboard' as NavTab, label: 'Басты бет', icon: Home },
      { id: 'students' as NavTab, label: 'Оқушылар контингенті', icon: Users },
      { id: 'classes' as NavTab, label: 'Сыныптарды басқару', icon: Layers },
      { id: 'self_study' as NavTab, label: 'Кешкі дайындық', icon: Moon },
      { id: 'meals' as NavTab, label: 'Асхана', icon: Utensils },
      { id: 'dormitory' as NavTab, label: 'Жатақхана', icon: Building2 },
      { id: 'timetables' as NavTab, label: 'Сабақ кестесі', icon: CalendarDays },
      { id: 'educator_performance' as NavTab, label: 'Тәрбиешілер рейтингі', icon: Activity },
      { id: 'analytics' as NavTab, label: 'Аналитика', icon: BarChart2 },
      { id: 'quarterly_reports' as NavTab, label: 'Тоқсандық есеп', icon: FileSpreadsheet },
      { id: 'settings' as NavTab, label: 'Сайтты басқару', icon: Sliders, highlight: true },
    ];
  }, [currentUser.role]);

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

            {/* Right: Role indicator, Admin Settings, Language, Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* If user is granted multiple official roles by Admin, allow toggling between ONLY their allowed roles */}
              {userAllowedRoles.length > 1 && !isAdmin && (
                <div className="hidden sm:flex items-center bg-[#1E293B] p-1 rounded-xl border border-slate-700 text-[11px] font-semibold gap-1">
                  {userAllowedRoles.map((role) => {
                    const info = roleLabels[role];
                    const Icon = info.icon;
                    const isActive = currentUser.role === role;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          switchRole(role);
                          if (onSelectTab) {
                            if (role === 'EDUCATOR') onSelectTab('self_study');
                            else if (role === 'CLASS_TEACHER') onSelectTab('dashboard');
                            else if (role === 'CAFETERIA_STAFF') onSelectTab('meals');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#4338CA] text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title={info.title}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{info.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Direct Site Settings (Admin Only) Button */}
              {isAdmin && (
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
              )}

              {/* PWA Install */}
              <PWAInstallButton />

              {/* Notifications */}
              <NotificationManager />

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-800 transition cursor-pointer"
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
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left font-medium transition cursor-pointer ${
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

              {/* User Profile Badge (Click opens Personal Profile Modal) */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 hover:border-slate-500 transition text-left cursor-pointer"
                title={`${currentUser.name} (${assignedClassLabel ? `${assignedClassLabel} • ` : ''}${currentRoleInfo.title})`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                    isAdmin
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isEducator
                      ? 'bg-emerald-600 text-white'
                      : isClassTeacher
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-100 max-w-[140px] sm:max-w-[190px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 leading-tight mt-0.5">
                    {assignedClassLabel && (
                      <span className="text-emerald-400 font-extrabold">{assignedClassLabel}</span>
                    )}
                    {assignedClassLabel && <span>•</span>}
                    <span>{currentRoleInfo.title}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* Password Change Button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500 hover:text-white transition text-xs font-bold shadow-xs cursor-pointer"
                title="Жеке құпиясөзді өзгерту"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Пароль</span>
              </button>

              {/* Clear Logout Button */}
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition text-xs font-bold shadow-xs cursor-pointer"
                title="Жүйеден шығу"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Шығу</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar: Strictly Tailored To The Logged-In User's Role */}
          {onSelectTab && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-[#1E293B] no-scrollbar text-xs">
              {subNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 font-bold shrink-0 cursor-pointer ${
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

        {/* Secure Personal Profile Modal (No unauthorized accounts listed) */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-slate-900 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                      isAdmin
                        ? 'bg-amber-500 text-slate-950'
                        : isEducator
                        ? 'bg-emerald-600 text-white'
                        : isClassTeacher
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#24342D]">{currentUser.name}</h3>
                    <p className="text-xs text-gray-500">{currentRoleInfo.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {/* Profile Details */}
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">12 таңбалы ЖСН:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.iin || 'Тіркелмеген'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Бекітілген сынып:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {assignedClassLabel || 'Бекітілмеген'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Лауазымы / Рөлі:</span>
                    <span className="font-bold text-indigo-700">{currentRoleInfo.title}</span>
                  </div>
                  {currentUser.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Электронды пошта:</span>
                      <span className="font-mono text-slate-700">{currentUser.email}</span>
                    </div>
                  )}
                  {currentUser.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Телефон нөмірі:</span>
                      <span className="font-bold text-slate-800">{currentUser.phone}</span>
                    </div>
                  )}
                </div>

                {/* If multiple roles granted officially to this specific employee */}
                {userAllowedRoles.length > 1 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                    <span className="text-[11px] font-bold text-indigo-900 block mb-2">
                      Сізге бекітілген рөлдер (Ауыстыру):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {userAllowedRoles.map((role) => {
                        const info = roleLabels[role];
                        const Icon = info.icon;
                        const isCurrent = currentUser.role === role;
                        return (
                          <button
                            key={role}
                            onClick={() => {
                              switchRole(role);
                              setShowProfileModal(false);
                              if (onSelectTab) {
                                if (role === 'EDUCATOR') onSelectTab('self_study');
                                else if (role === 'CLASS_TEACHER') onSelectTab('dashboard');
                                else if (role === 'CAFETERIA_STAFF') onSelectTab('meals');
                              }
                            }}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                              isCurrent
                                ? 'bg-[#4338CA] text-white border-[#4338CA] shadow-xs'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{info.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Деректер қауіпсіз жеке сессия арқылы қорғалған.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
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
                      setShowProfileModal(false);
                      logout();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Шығу</span>
                  </button>

                  <button
                    onClick={() => setShowProfileModal(false)}
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
