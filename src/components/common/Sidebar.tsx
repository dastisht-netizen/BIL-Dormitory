import React, { useState } from 'react';
import {
  LayoutDashboard,
  Moon,
  UserCheck,
  BookOpen,
  UtensilsCrossed,
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  Activity,
  BarChart3,
  FileSpreadsheet,
  Archive,
  History,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export type NavTab =
  | 'dashboard'
  | 'self_study'
  | 'attendance'
  | 'homework'
  | 'meals'
  | 'dormitory'
  | 'students'
  | 'classes'
  | 'timetables'
  | 'educator_performance'
  | 'analytics'
  | 'quarterly_reports'
  | 'academic_years'
  | 'audit_logs'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { currentUser, isAdmin, isEducator, isClassTeacher, isCafeteria, siteConfig } = useAuth();
  const { t } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Define tabs based on role
  interface NavItem {
    id: NavTab;
    label: string;
    icon: any;
    badge?: string;
    roles: string[];
  }

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard, roles: ['ADMINISTRATOR', 'CLASS_TEACHER', 'CAFETERIA_STAFF'] },
    { id: 'self_study', label: t.nav.selfStudy, icon: Moon, badge: '19:00', roles: ['ADMINISTRATOR', 'EDUCATOR'] },
    { id: 'attendance', label: t.nav.attendance, icon: UserCheck, roles: ['ADMINISTRATOR', 'EDUCATOR', 'CLASS_TEACHER'] },
    { id: 'homework', label: t.nav.homework, icon: BookOpen, roles: ['ADMINISTRATOR', 'EDUCATOR', 'CLASS_TEACHER'] },
    { id: 'meals', label: t.nav.meals, icon: UtensilsCrossed, badge: '8 Ас', roles: ['ADMINISTRATOR', 'EDUCATOR', 'CAFETERIA_STAFF'] },
    { id: 'dormitory', label: t.nav.dormitory, icon: Building2, roles: ['ADMINISTRATOR', 'EDUCATOR', 'CAFETERIA_STAFF'] },
    { id: 'students', label: t.nav.students, icon: Users, roles: ['ADMINISTRATOR', 'CLASS_TEACHER'] },
    { id: 'classes', label: t.nav.classes, icon: Layers, roles: ['ADMINISTRATOR'] },
    { id: 'timetables', label: t.nav.timetables, icon: CalendarDays, roles: ['ADMINISTRATOR'] },
    { id: 'educator_performance', label: t.nav.performance, icon: Activity, roles: ['ADMINISTRATOR'] },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3, roles: ['ADMINISTRATOR', 'CLASS_TEACHER'] },
    { id: 'quarterly_reports', label: t.nav.quarterlyReports, icon: FileSpreadsheet, roles: ['ADMINISTRATOR', 'CLASS_TEACHER'] },
    { id: 'academic_years', label: t.nav.academicYears, icon: Archive, roles: ['ADMINISTRATOR'] },
    { id: 'audit_logs', label: t.nav.auditLogs, icon: History, roles: ['ADMINISTRATOR'] },
    { id: 'settings', label: t.nav.settings, icon: Settings, roles: ['ADMINISTRATOR'] },
  ];

  const allowedItems = allNavItems.filter((item) => item.roles.includes(currentUser.role));

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileDrawerOpen(false);
  };

  // Bottom navigation primary items for mobile
  const mobileBottomItems: { id: NavTab; label: string; icon: any }[] = isEducator
    ? [
        { id: 'self_study', label: 'Дайындық', icon: Moon },
        { id: 'attendance', label: 'Қатысу', icon: UserCheck },
        { id: 'homework', label: 'Үй тапсырмасы', icon: BookOpen },
        { id: 'meals', label: 'Асхана', icon: UtensilsCrossed },
        { id: 'dormitory', label: 'Жатақхана', icon: Building2 },
      ]
    : isClassTeacher
    ? [
        { id: 'dashboard', label: 'Басты бет', icon: LayoutDashboard },
        { id: 'attendance', label: 'Қатысу', icon: UserCheck },
        { id: 'homework', label: 'Үй тапсырмасы', icon: BookOpen },
        { id: 'students', label: 'Оқушылар', icon: Users },
        { id: 'quarterly_reports', label: 'Есептер', icon: FileSpreadsheet },
      ]
    : isCafeteria
    ? [
        { id: 'dashboard', label: 'Басты бет', icon: LayoutDashboard },
        { id: 'meals', label: 'Тамақтану', icon: UtensilsCrossed },
        { id: 'dormitory', label: 'Жатақхана', icon: Building2 },
      ]
    : [
        { id: 'dashboard', label: 'Басты бет', icon: LayoutDashboard },
        { id: 'self_study', label: 'Дайындық', icon: Moon },
        { id: 'meals', label: 'Асхана', icon: UtensilsCrossed },
        { id: 'educator_performance', label: 'Тәрбиешілер', icon: Activity },
      ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-gray-100 p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
          {currentUser.role === 'ADMINISTRATOR' ? 'Басқару панелі' : 'Жұмыс модулі'}
        </div>

        <nav className="space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#075C42] text-white shadow-sm'
                    : 'text-[#24342D]/80 hover:bg-[#E6F4EA]/60 hover:text-[#075C42]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#FFE9A8]' : 'text-gray-400 group-hover:text-[#138A62]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#FFE9A8] text-[#075C42]'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* School Info Box in footer */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="p-3 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8]/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#075C42]" />
              <span className="text-xs font-bold text-[#075C42] truncate">{siteConfig.schoolName}</span>
            </div>
            <p className="text-[11px] text-[#24342D]/80 mt-1 leading-relaxed line-clamp-2">
              {siteConfig.subtitle}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-lg">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
                isActive ? 'text-[#075C42]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Menu Trigger for Mobile */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-gray-400 hover:text-gray-600"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Мәзір</span>
        </button>
      </div>

      {/* Mobile Full Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-4/5 max-w-xs bg-white h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#075C42] text-white flex items-center justify-center font-bold text-xs">
                  BIL
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#075C42]">ARYS BIL</h3>
                  <p className="text-[10px] text-gray-400">{currentUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-[#075C42] text-white'
                        : 'text-[#24342D] hover:bg-[#E6F4EA]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFE9A8] text-[#075C42]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}
    </>
  );
};
