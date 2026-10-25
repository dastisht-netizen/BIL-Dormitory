/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

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

function AppContent() {
  const { currentUser, isAdmin, isEducator, isClassTeacher, isCafeteria } = useAuth();
  const { t } = useLanguage();

  // Initial tab depending on role
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (isEducator) return 'self_study';
    if (isCafeteria) return 'meals';
    return 'dashboard';
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (isAdmin) return <AdminDashboard onNavigate={setActiveTab} />;
        if (isClassTeacher) return <ClassTeacherDashboard />;
        if (isCafeteria) return <CafeteriaDashboard />;
        return <EducatorDashboard />;

      case 'self_study':
      case 'attendance':
      case 'homework':
        return <EducatorDashboard />;

      case 'meals':
        return <WeekendMealGrid />;

      case 'dormitory':
        return <DormitoryGrid />;

      case 'students':
        return <StudentManager />;

      case 'classes':
        return <AdminDashboard onNavigate={setActiveTab} />;

      case 'timetables':
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
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col text-[#24342D]">
      {/* Top Header */}
      <Header />

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
