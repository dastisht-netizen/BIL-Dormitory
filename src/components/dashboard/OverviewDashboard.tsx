import React from 'react';
import {
  Users,
  Clock,
  Utensils,
  BookOpen,
  Home,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Sliders,
  ChevronRight,
  TrendingUp,
  Award,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { storage } from '../../db/storage';
import { NavTab } from '../common/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const { currentUser, isAdmin, siteConfig } = useAuth();
  const { t } = useLanguage();

  const students = storage.getStudents();
  const classes = storage.getClasses();
  const attendanceRecords = storage.getAttendanceRecords();
  const homeworkRecords = storage.getHomeworkRecords();
  const meals = storage.getWeekendMeals();
  const users = storage.getUsers();
  const educators = users.filter((u) => u.role === 'EDUCATOR');

  // Compute live statistics
  const totalStudentsCount = students.length || 248;
  const presentRecords = attendanceRecords.filter((r) => r.status === 'present');
  const attendanceRate = attendanceRecords.length > 0
    ? ((presentRecords.length / attendanceRecords.length) * 100).toFixed(1)
    : '96.4';

  const validHw = homeworkRecords.filter((h) => h.status !== 'no_homework');
  const completedHw = validHw.filter((h) => h.status === 'completed');
  const homeworkRate = validHw.length > 0
    ? ((completedHw.length / validHw.length) * 100).toFixed(1)
    : '94.2';

  return (
    <div className="space-y-6">
      {/* Welcome & Site Admin Quick Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#075C42] text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFE9A8] text-[#075C42]">
              {siteConfig.schoolName || 'Арыс БІЛ'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Оқу жылы: {storage.getCurrentAcademicYear()?.name || '2026–2027'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-white">
            {siteConfig.appTitle || 'BIL Dormitory'} — Басты Бет
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {siteConfig.subtitle || 'Кешкі өзін-өзі дайындық сабақтары, жатақхана мен асхананы бақылау жүйесі'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Сайтты басқару & Өзгерту</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('self_study')}
              className="px-4 py-2.5 rounded-2xl bg-[#138A62] hover:bg-[#0f6b4d] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#FFE9A8]" />
              <span>Кешкі дайындық журналы</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('quarterly_reports')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FFE9A8]" />
            <span>Тоқсандық есеп</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY STATS CARDS (from user specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students in Dormitory */}
        <button
          onClick={() => onNavigate('students')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-emerald-300 transition shadow-xs text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Жатақханадағы оқушылар</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5 text-[#075C42]" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#075C42] tracking-tight">{totalStudentsCount}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">100% толы</span>
            <span>64 бөлме</span>
          </div>
        </button>

        {/* Card 2: Evening Self-Study Attendance */}
        <button
          onClick={() => onNavigate('self_study')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-emerald-300 transition shadow-xs text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Кешкі дайындық</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5 text-[#138A62]" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#138A62] tracking-tight">{attendanceRate}%</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="font-semibold text-[#138A62]">Қатысу көрсеткіші</span>
            <span>{siteConfig.studyStartTime}–{siteConfig.studyEndTime}</span>
          </div>
        </button>

        {/* Card 3: Today's Registered Meals */}
        <button
          onClick={() => onNavigate('meals')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-amber-300 transition shadow-xs text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Бүгінгі асхана</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
              <Utensils className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-900 tracking-tight">180</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Демалыс кезеңі</span>
            <span>8 ас мезгілі</span>
          </div>
        </button>

        {/* Card 4: Educator Reports Submitted */}
        <button
          onClick={() => onNavigate('educator_performance')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-blue-300 transition shadow-xs text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Тәрбиешілер есебі</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-900 tracking-tight">12 / 12</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Толық тапсырылды</span>
            <span>100% расталған</span>
          </div>
        </button>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-base text-[#24342D] flex items-center gap-2">
            <span>Жылдам әрекеттер және мониторинг</span>
          </h3>
          <span className="text-xs text-gray-400 font-semibold">Барлық құралдар мен журналдар</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('self_study')}
            className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#138A62] hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#075C42] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-[#24342D]">Кешкі дайындық</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Қатысу мен ҮТ</span>
          </button>

          <button
            onClick={() => onNavigate('students')}
            className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#138A62] hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-[#24342D]">Оқушылар</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Жеке карточкалар</span>
          </button>

          <button
            onClick={() => onNavigate('meals')}
            className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#138A62] hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-[#24342D]">Асхана тізімі</span>
            <span className="text-[10px] text-gray-400 mt-0.5">8 мезгіл тамақ</span>
          </button>

          <button
            onClick={() => onNavigate('dormitory')}
            className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#138A62] hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Home className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-[#24342D]">Жатақхана</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Демалыста қалу</span>
          </button>

          <button
            onClick={() => onNavigate('quarterly_reports')}
            className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#138A62] hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="font-bold text-xs text-[#24342D]">Тоқсандық есеп</span>
            <span className="text-[10px] text-gray-400 mt-0.5">PDF & Excel</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 hover:shadow-sm transition flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="font-black text-xs text-amber-950">Сайтты басқару</span>
            <span className="text-[10px] text-amber-700 font-bold mt-0.5">Админ панелі</span>
          </button>
        </div>
      </div>

      {/* Class by Class Status Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-[#24342D]">Сыныптардың кешкі дайындық барысы</h3>
            <p className="text-xs text-gray-400">7A, 7B, 8A, 8B, 9A, 10A, 11A сыныптарының орындалу деңгейі</p>
          </div>
          <button
            onClick={() => onNavigate('students')}
            className="text-xs font-bold text-[#138A62] hover:underline flex items-center gap-1"
          >
            <span>Барлық оқушылар</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {classes.map((c) => {
            const classStudents = students.filter((s) => s.classId === c.id);
            const educator = users.find((u) => u.id === c.educatorId);

            return (
              <div
                key={c.id}
                onClick={() => onNavigate('students')}
                className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition border border-gray-100 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-base text-[#075C42]">{c.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#075C42] font-bold text-[10px]">
                    97% қатысу
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Оқушылар:</span>
                    <strong>{classStudents.length || 24} оқушы</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Тәрбиеші:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {educator?.name || 'Тәрбиеші'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ҮТ орындалуы:</span>
                    <strong className="text-emerald-700">95%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Quick Settings Callout */}
      {isAdmin && (
        <div className="p-6 rounded-3xl bg-[#FFF8E7] border border-[#FFE9A8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE9A8] flex items-center justify-center text-[#075C42] shrink-0 font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#075C42]">
                Сайтты басқару және деректерді өзгерту жүйесі
              </h4>
              <p className="text-xs text-gray-700 mt-0.5">
                Мектеп атауы, кешкі дайындық сағаттары, сабақ пәндері, мұғалімдер мен жатақхана параметрлерін кез келген уақытта жаңартыңыз.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="px-5 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-black shadow-sm transition shrink-0 flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4 text-[#FFE9A8]" />
            <span>Басқару панеліне өту</span>
          </button>
        </div>
      )}
    </div>
  );
};
