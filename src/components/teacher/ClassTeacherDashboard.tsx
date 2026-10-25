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
  AlertCircle
} from 'lucide-react';
import { SchoolClass, Student, Subject } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StudentModal } from '../students/StudentModal';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const ClassTeacherDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-7a');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allClasses = storage.getClasses();
    setClasses(allClasses);
    setSubjects(storage.getSubjects());

    // If current user is class teacher, select their class
    if (currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0) {
      setSelectedClassId(currentUser.assignedClassIds[0]);
    }
  }, [currentUser]);

  useEffect(() => {
    const allStudents = storage.getStudents().filter((s) => s.classId === selectedClassId && s.status === 'active');
    setStudents(allStudents);
  }, [selectedClassId]);

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
            {currentClass?.name} сыныбының оқу-тәрбие бақылауы
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Оқушылардың кешкі дайындығы, сабақ қатысуы және академиялық динамикасы
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>{t.totalStudents}</span>
            <Users className="w-4 h-4 text-[#075C42]" />
          </div>
          <div className="text-3xl font-extrabold text-[#075C42] mt-2">{students.length}</div>
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
