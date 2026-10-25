import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Save,
  Clock,
  Sparkles,
  Check,
  RefreshCw,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { SchoolClass, Student, Subject, TimetableEntry } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StudentModal } from '../students/StudentModal';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

const DAYS_OF_WEEK = [
  { day: 1, nameKk: 'Дүйсенбі', nameRu: 'Понедельник', nameEn: 'Monday' },
  { day: 2, nameKk: 'Сейсенбі', nameRu: 'Вторник', nameEn: 'Tuesday' },
  { day: 3, nameKk: 'Сәрсенбі', nameRu: 'Среда', nameEn: 'Wednesday' },
  { day: 4, nameKk: 'Бейсенбі', nameRu: 'Четверг', nameEn: 'Thursday' },
  { day: 5, nameKk: 'Жұма', nameRu: 'Пятница', nameEn: 'Friday' },
];

const PERIODS = [
  { num: 1, time: '08:30 - 09:15' },
  { num: 2, time: '09:25 - 10:10' },
  { num: 3, time: '10:20 - 11:05' },
  { num: 4, time: '11:25 - 12:10' },
  { num: 5, time: '12:20 - 13:05' },
  { num: 6, time: '14:00 - 14:45' },
  { num: 7, time: '14:55 - 15:40' },
];

export const ClassTeacherDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'students_overview' | 'class_timetable'>('students_overview');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-7a');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Timetable builder state: [dayOfWeek][periodNumber] -> subjectId
  const [timetableGrid, setTimetableGrid] = useState<Record<number, Record<number, string>>>({});
  const [isSavingTimetable, setIsSavingTimetable] = useState(false);
  const [timetableNotice, setTimetableNotice] = useState<string | null>(null);

  useEffect(() => {
    const allClasses = storage.getClasses();
    const available = isAdmin
      ? allClasses
      : allClasses.filter((c) => currentUser.assignedClassIds?.includes(c.id));
    setClasses(available);
    setSubjects(storage.getSubjects());

    // If current user is class teacher, select their class
    if (available.length > 0) {
      setSelectedClassId(available[0].id);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    const allStudents = storage.getStudents().filter((s) => s.classId === selectedClassId && s.status === 'active');
    setStudents(allStudents);
    loadClassTimetable(selectedClassId);
  }, [selectedClassId]);

  const loadClassTimetable = (classId: string) => {
    const allEntries = storage.getTimetables().filter((t) => t.classId === classId);
    const grid: Record<number, Record<number, string>> = {};
    for (let day = 1; day <= 5; day++) {
      grid[day] = {};
    }
    allEntries.forEach((entry) => {
      if (!grid[entry.dayOfWeek]) grid[entry.dayOfWeek] = {};
      grid[entry.dayOfWeek][entry.periodNumber] = entry.subjectId;
    });
    setTimetableGrid(grid);
  };

  const handleCellSubjectChange = (day: number, period: number, subjectId: string) => {
    setTimetableGrid((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [period]: subjectId,
      },
    }));
  };

  const handleSaveTimetable = () => {
    setIsSavingTimetable(true);
    const entries: TimetableEntry[] = [];

    Object.entries(timetableGrid).forEach(([dayStr, periods]) => {
      const day = parseInt(dayStr, 10);
      Object.entries(periods).forEach(([periodStr, subId]) => {
        const period = parseInt(periodStr, 10);
        if (subId && subId.trim() !== '') {
          entries.push({
            id: `tt-${selectedClassId}-${day}-${period}`,
            classId: selectedClassId,
            dayOfWeek: day,
            periodNumber: period,
            subjectId: subId,
          });
        }
      });
    });

    storage.saveTimetables(entries, selectedClassId, currentUser.id, currentUser.name);

    setTimeout(() => {
      setIsSavingTimetable(false);
      setTimetableNotice(`«${currentClass?.name || 'Сынып'}» сабақ кестесі сәтті бекітілді! (${entries.length} сабақ)`);
      setTimeout(() => setTimetableNotice(null), 4000);
    }, 400);
  };

  const handleLoadBilPreset = () => {
    if (confirm('БІЛ стандартты STEM сабақ кестесі шаблонын жүктеуді растайсыз ба? Қазіргі өзгерістер жаңартылады.')) {
      const preset: Record<number, Record<number, string>> = {
        1: { 1: 'sub-algebra', 2: 'sub-algebra', 3: 'sub-english', 4: 'sub-english', 5: 'sub-kazakh', 6: 'sub-physics', 7: 'sub-cs' },
        2: { 1: 'sub-geometry', 2: 'sub-geometry', 3: 'sub-chem', 4: 'sub-chem', 5: 'sub-bio', 6: 'sub-history', 7: 'sub-geo' },
        3: { 1: 'sub-algebra', 2: 'sub-physics', 3: 'sub-physics', 4: 'sub-english', 5: 'sub-kazakh', 6: 'sub-cs', 7: 'sub-russian' },
        4: { 1: 'sub-geometry', 2: 'sub-chem', 3: 'sub-bio', 4: 'sub-bio', 5: 'sub-english', 6: 'sub-history', 7: 'sub-kazakh' },
        5: { 1: 'sub-algebra', 2: 'sub-geometry', 3: 'sub-physics', 4: 'sub-chem', 5: 'sub-english', 6: 'sub-cs', 7: 'sub-history' },
      };
      setTimetableGrid(preset);
      setTimetableNotice('БІЛ үлгілік шаблоны толтырылды. «Кестені сақтау» түймесін басып бекітіңіз.');
      setTimeout(() => setTimetableNotice(null), 4000);
    }
  };

  const handleClearDay = (day: number) => {
    setTimetableGrid((prev) => ({
      ...prev,
      [day]: {},
    }));
  };

  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Compute metrics for this class
  const allAtt = storage.getAttendanceRecords().filter((r) => r.classId === selectedClassId);
  const presentCount = allAtt.filter((r) => r.status === 'present').length;
  const attendanceRate = allAtt.length > 0 ? Math.round((presentCount / allAtt.length) * 100) : 98;

  const allHw = storage.getHomeworkRecords().filter((r) => r.classId === selectedClassId && r.status !== 'no_homework');
  const doneHw = allHw.filter((r) => r.status === 'completed').length;
  const homeworkRate = allHw.length > 0 ? Math.round((doneHw / allHw.length) * 100) : 94;

  const checkingCoverage = allHw.length > 0
    ? Math.round((allHw.filter((h) => h.status !== 'not_checked').length / allHw.length) * 100)
    : 100;

  // Filtered students
  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = students.map((st) => {
      const stAtt = allAtt.filter((r) => r.studentId === st.id);
      const stHw = allHw.filter((r) => r.studentId === st.id);
      const stPresent = stAtt.filter((r) => r.status === 'present').length;
      const stDoneHw = stHw.filter((r) => r.status === 'completed').length;

      return {
        'Оқушы ID': st.id,
        'Аты-жөні': st.fullName,
        'Сынып': currentClass?.name || '',
        'Бөлме №': st.roomNumber || '',
        'Қатысу пайызы': stAtt.length > 0 ? `${Math.round((stPresent / stAtt.length) * 100)}%` : '100%',
        'Үй тапсырмасы орындалуы': stHw.length > 0 ? `${Math.round((stDoneHw / stHw.length) * 100)}%` : '100%',
        'Байланыс': st.parentPhone || '',
      };
    });

    exportToExcel(
      [{ sheetName: `${currentClass?.name || 'Class'}_Report`, data }],
      `Class_${currentClass?.name || '7A'}_Performance_Report`
    );
  };

  const handleExportPdf = () => {
    const headers = ['Оқушы', 'ID', 'Бөлме', 'Қатысу', 'Үй тапсырмасы'];
    const rows = students.map((st) => {
      const stAtt = allAtt.filter((r) => r.studentId === st.id);
      const stHw = allHw.filter((r) => r.studentId === st.id);
      const stPresent = stAtt.filter((r) => r.status === 'present').length;
      const stDoneHw = stHw.filter((r) => r.status === 'completed').length;
      const aPct = stAtt.length > 0 ? `${Math.round((stPresent / stAtt.length) * 100)}%` : '100%';
      const hPct = stHw.length > 0 ? `${Math.round((stDoneHw / stHw.length) * 100)}%` : '100%';

      return [st.fullName, st.id, st.roomNumber || '—', aPct, hPct];
    });

    exportToPdfReport({
      title: `${currentClass?.name || '7A'} сыныбының мониторинг есебі`,
      subtitle: `Сынып жетекшісі: ${currentUser.name} | Оқушы саны: ${students.length}`,
      headers,
      rows,
      fileName: `Class_${currentClass?.name || '7A'}_Report`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <GraduationCap className="w-4 h-4" />
            <span>Сынып жетекшісі кабинеті</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            {currentClass?.name} сыныбының оқу-тәрбие басқаруы
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Оқушылардың кешкі дайындығы, сабақ қатысуы және апталық сабақ кестесін реттеу
          </p>
        </div>

        {/* Filters & Export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterClass}</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} сыныбы
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 sm:pt-4">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Mode Switcher Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('students_overview')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'students_overview'
              ? 'border-[#075C42] text-[#075C42]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Оқушылар үлгерімі мен статистикасы</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#075C42] font-extrabold">
            {students.length} оқушы
          </span>
        </button>

        <button
          onClick={() => setActiveTab('class_timetable')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'class_timetable'
              ? 'border-[#075C42] text-[#075C42]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Сынып сабақ кестесі (Дүйсенбі–Жұма)</span>
        </button>
      </div>

      {timetableNotice && (
        <div className="p-3.5 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center justify-between text-xs font-bold text-[#075C42] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
            <span>{timetableNotice}</span>
          </div>
          <button onClick={() => setTimetableNotice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* TAB 1: STUDENTS OVERVIEW */}
      {activeTab === 'students_overview' && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>{t.totalStudents}</span>
                <Users className="w-4 h-4 text-[#075C42]" />
              </div>
              <div className="text-3xl font-extrabold text-[#075C42] mt-2">{students.length} / 26</div>
              <span className="text-[11px] text-gray-400 mt-1 block">Интернатта тұратындар</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>{t.attendanceRate}</span>
                <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
              </div>
              <div className="text-3xl font-extrabold text-[#138A62] mt-2">{attendanceRate}%</div>
              <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">Тұрақты жоғары деңгей</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>{t.homeworkRate}</span>
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-700 mt-2">{homeworkRate}%</div>
              <span className="text-[11px] text-gray-400 mt-1 block">Кешкі дайындық бақылауында</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>{t.checkingCoverage}</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-blue-700 mt-2">{checkingCoverage}%</div>
              <span className="text-[11px] text-blue-600 mt-1 block font-semibold">Тәрбиеші тексерісімен</span>
            </div>
          </div>

          {/* Student List with Drill-down */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#24342D]">
                  Сынып оқушыларының тізімі және жеке үлгерімі
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Оқушының үстінен басып, толық жеке профилі мен тарихын ашыңыз
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] w-56 sm:w-64"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.map((st, idx) => {
                const stAtt = allAtt.filter((r) => r.studentId === st.id);
                const stHw = allHw.filter((r) => r.studentId === st.id);
                const stPresent = stAtt.filter((r) => r.status === 'present').length;
                const aPct = stAtt.length > 0 ? Math.round((stPresent / stAtt.length) * 100) : 100;
                const stDoneHw = stHw.filter((r) => r.status === 'completed').length;
                const hPct = stHw.length > 0 ? Math.round((stDoneHw / stHw.length) * 100) : 100;

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="w-full py-3.5 px-3 flex items-center justify-between text-left hover:bg-[#F8FAF9] rounded-2xl transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-bold text-gray-400">{idx + 1}</span>
                      <div>
                        <h4 className="text-sm font-bold text-[#24342D] group-hover:text-[#075C42] transition">
                          {st.fullName}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-mono">
                          ID: {st.id} • Бөлме: {st.roomNumber || '—'} • Байланыс: {st.parentPhone || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-3 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                          Қатысу: {aPct}%
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold">
                          Тапсырма: {hPct}%
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#075C42] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS TIMETABLE BUILDER (MONDAY-FRIDAY) */}
      {activeTab === 'class_timetable' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#138A62]" />
                <h3 className="text-lg font-extrabold text-[#24342D]">
                  {currentClass?.name} сыныбының апталық сабақ кестесі
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Сынып жетекшісі ретінде күнделікті 7 сабаққа пәндерді бекітіңіз. Кешкі дайындықта тәрбиеші осы кестеге сүйеніп үй тапсырмасын тексереді.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoadBilPreset}
                className="px-3.5 py-2.5 rounded-xl border border-[#138A62]/30 bg-[#E6F4EA] text-[#075C42] text-xs font-bold hover:bg-[#d6ecdc] transition flex items-center gap-1.5"
                title="БІЛ стандартты үлгілік сабақ кестесін енгізу"
              >
                <Sparkles className="w-4 h-4 text-[#138A62]" />
                <span>БІЛ шаблонын жүктеу</span>
              </button>

              <button
                onClick={handleSaveTimetable}
                disabled={isSavingTimetable}
                className="px-5 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-extrabold hover:bg-[#054531] shadow-md shadow-[#075C42]/20 transition flex items-center gap-2"
              >
                {isSavingTimetable ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFE9A8]" />
                    <span>Сақталуда...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#FFE9A8]" />
                    <span>Кестені сақтау</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[760px] grid grid-cols-6 gap-3">
              {/* Left Column: Period headers */}
              <div className="space-y-3">
                <div className="h-11 flex items-center justify-center rounded-2xl bg-[#F8FAF9] text-xs font-extrabold text-gray-500 border border-gray-100">
                  Қоңырау / Уақыт
                </div>
                {PERIODS.map((period) => (
                  <div
                    key={period.num}
                    className="h-16 flex flex-col justify-center px-3 rounded-2xl bg-[#F8FAF9] border border-gray-100 text-left"
                  >
                    <span className="text-xs font-extrabold text-[#075C42]">
                      № {period.num} сабақ
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {period.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns (1 to 5) */}
              {DAYS_OF_WEEK.map((d) => (
                <div key={d.day} className="space-y-3">
                  {/* Day Header */}
                  <div className="h-11 px-2 flex items-center justify-between rounded-2xl bg-[#075C42] text-white border border-[#075C42]">
                    <span className="text-xs font-extrabold truncate">
                      {d.nameKk}
                    </span>
                    <button
                      onClick={() => handleClearDay(d.day)}
                      className="text-[10px] text-white/70 hover:text-white hover:underline"
                      title="Күнді тазарту"
                    >
                      Тазарту
                    </button>
                  </div>

                  {/* 7 Periods per Day */}
                  {PERIODS.map((period) => {
                    const currentSubId = timetableGrid[d.day]?.[period.num] || '';
                    const matchedSub = subjects.find((s) => s.id === currentSubId);

                    return (
                      <div
                        key={period.num}
                        className={`h-16 p-2 rounded-2xl border transition flex flex-col justify-between ${
                          currentSubId
                            ? 'bg-white border-[#138A62]/30 shadow-2xs ring-1 ring-[#138A62]/20'
                            : 'bg-gray-50/70 border-dashed border-gray-200'
                        }`}
                      >
                        <select
                          value={currentSubId}
                          onChange={(e) => handleCellSubjectChange(d.day, period.num, e.target.value)}
                          className={`w-full text-[11px] font-bold rounded-lg border-0 bg-transparent focus:ring-1 focus:ring-[#138A62] cursor-pointer truncate ${
                            currentSubId ? 'text-[#075C42]' : 'text-gray-400'
                          }`}
                        >
                          <option value="">— Сабақ жоқ —</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id} className="text-gray-900 font-medium">
                              {s.nameKk}
                            </option>
                          ))}
                        </select>

                        {matchedSub && (
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span className="font-mono">{matchedSub.code}</span>
                            <span className="w-2 h-2 rounded-full bg-[#138A62]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Footer */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8] text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold">Кешкі өзіндік дайындықпен автоматты байланыс:</h5>
              <p className="mt-0.5 text-amber-800 text-[11px]">
                Мысалы, дүйсенбі күні кешкі 19:00-де оқушылар сейсенбі күні болатын сабақтардың үй тапсырмасын орындайды. Тәрбиеші журналы келесі күннің пәндерін автоматты түрде осы сабақ кестесінен оқиды.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={() => {
            setStudents(storage.getStudents().filter((s) => s.classId === selectedClassId));
          }}
        />
      )}
    </div>
  );
};
