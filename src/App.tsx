/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { EducatorDashboard } from './components/educator/EducatorDashboard';
import { WeekendMealGrid } from './components/meals/WeekendMealGrid';
import { DormitoryGrid } from './components/dormitory/DormitoryGrid';
import { ClassTeacherDashboard } from './components/teacher/ClassTeacherDashboard';
import { CafeteriaDashboard } from './components/cafeteria/CafeteriaDashboard';
import { TimetableManager } from './components/timetable/TimetableManager';
import { EducatorPerformanceView } from './components/admin/EducatorPerformanceView';
import { AnalyticsView } from './components/statistics/AnalyticsView';
import { QuarterlyReportView } from './components/reports/QuarterlyReportView';
import { AcademicYearManager } from './components/admin/AcademicYearManager';
import { StudentManager } from './components/students/StudentManager';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginScreen } from './components/auth/LoginScreen';
import { Role } from './types';

function AppContent() {
  const { currentUser, isAuthenticated, isAdmin, isEducator, isClassTeacher, isCafeteria, canAccessTab } = useAuth();
  const { t } = useLanguage();

  const getDefaultTabForRole = (role: Role): NavTab => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'settings';
      case 'EDUCATOR':
        return 'self_study';
      case 'CLASS_TEACHER':
        return 'dashboard';
      case 'CAFETERIA_STAFF':
        return 'meals';
      default:
        return 'dashboard';
    }
  };

  // Initial tab depending on role
  const [activeTab, setActiveTab] = useState<NavTab>(() => getDefaultTabForRole(currentUser.role));

  // Sync tab if user role changes or if current activeTab is not permitted
  useEffect(() => {
    if (!canAccessTab(activeTab)) {
      setActiveTab(getDefaultTabForRole(currentUser.role));
    }
  }, [currentUser.role, canAccessTab, activeTab]);

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(targetTab) => {
          setActiveTab(targetTab);
        }}
      />
    );
  }

  const renderContent = () => {
    // Security Route Guard: Prevent access to unauthorized tabs
    if (!canAccessTab(activeTab)) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">Қолжетімділік шектелген</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Сіздің «{currentUser.name}» аккаунтыңызға бұл бөлімді көруге рұқсат берілмеген. Жүйеге тек өзіңізге бекітілген рөл мен сынып бойынша қол жеткізе аласыз.
          </p>
          <button
            onClick={() => setActiveTab(getDefaultTabForRole(currentUser.role))}
            className="px-5 py-2.5 rounded-xl bg-[#4338CA] text-white text-xs font-bold hover:bg-[#3730A3] transition shadow-md cursor-pointer"
          >
            Рұқсат етілген басты бетке оралу
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        if (isClassTeacher) return <ClassTeacherDashboard />;
        if (isCafeteria) return <CafeteriaDashboard />;
        return <OverviewDashboard onNavigate={setActiveTab} />;

      case 'self_study':
        return <EducatorDashboard />;

      case 'attendance':
      case 'homework':
        if (isClassTeacher) return <ClassTeacherDashboard />;
        return <EducatorDashboard />;

      case 'meals':
        if (isCafeteria) return <CafeteriaDashboard />;
        return <WeekendMealGrid />;

      case 'dormitory':
        return <DormitoryGrid />;

      case 'students':
        return <StudentManager />;

      case 'classes':
        return <AdminDashboard onNavigate={setActiveTab} />;

      case 'timetables':
        if (isClassTeacher) return <ClassTeacherDashboard />;
        return <TimetableManager />;

      case 'educator_performance':
        return <EducatorPerformanceView />;

      case 'analytics':
        return <AnalyticsView />;

      case 'quarterly_reports':
        return <QuarterlyReportView />;

      case 'academic_years':
        return <AcademicYearManager />;

      case 'audit_logs':
        return <EducatorPerformanceView />;

      case 'settings':
        return <AdminDashboard onNavigate={setActiveTab} />;

      default:
        return <OverviewDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col text-[#24342D]">
      {/* Top Header with BilLogo & Sub Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdmin={() => setActiveTab('settings')}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content View */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
