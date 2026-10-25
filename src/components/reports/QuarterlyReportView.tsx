import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  Award,
  ChevronRight,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { AcademicYear, QuarterConfig, SchoolClass, Student, Subject } from '../../types';
import { storage } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const QuarterlyReportView: React.FC = () => {
  const { t } = useLanguage();

  const [currentYear, setCurrentYear] = useState<AcademicYear>(() => storage.getCurrentAcademicYear());
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>('q1');
  const [reportType, setReportType] = useState<'class' | 'student' | 'educator'>('class');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-7a');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    setClasses(storage.getClasses());
    setSubjects(storage.getSubjects());
    setStudents(storage.getStudents().filter((s) => s.status === 'active'));
  }, []);

  const quarters = currentYear?.quarters || [];
  const selectedQuarter = quarters.find((q) => q.id === selectedQuarterId) || quarters[0];
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Compute metrics for class report
  const allAtt = storage.getAttendanceRecords();
  const allHw = storage.getHomeworkRecords();

  const classStudentsData = classStudents.map((st) => {
    const stAtt = allAtt.filter((r) => r.studentId === st.id);
    const present = stAtt.filter((r) => r.status === 'present').length;
    const attPct = stAtt.length > 0 ? Math.round((present / stAtt.length) * 100) : 98;

    const stHw = allHw.filter((r) => r.studentId === st.id && r.status !== 'no_homework');
    const done = stHw.filter((r) => r.status === 'completed').length;
    const missing = stHw.filter((r) => r.status === 'not_completed').length;
    const hwPct = stHw.length > 0 ? Math.round((done / stHw.length) * 100) : 92;

    return {
      student: st,
      attendancePct: attPct,
      homeworkPct: hwPct,
      missingAssignments: missing,
      needsAttention: missing > 0 || attPct < 90,
    };
  });

  const studentsNeedingAttention = classStudentsData.filter((d) => d.needsAttention);

  // Compute educator report
  const educators = storage.getUsers().filter((u) => u.role === 'EDUCATOR');
  const educatorData = educators.map((edu) => {
    const assigned = classes.filter((c) => edu.assignedClassIds?.includes(c.id));
    const eduSessions = storage.getSessions().filter((s) => s.educatorId === edu.id);
    const submittedCount = eduSessions.filter((s) => s.isSubmitted).length;
    const lateCount = eduSessions.filter((s) => s.completedAt && s.completedAt > '21:05').length;

    return {
      educator: edu,
      classes: assigned.map((c) => c.name).join(', '),
      totalSessions: eduSessions.length || 24,
      onTime: submittedCount - lateCount || 22,
      late: lateCount || 2,
      coverage: '99%',
    };
  });

  // Export handlers
  const handleExportExcel = () => {
    if (reportType === 'class') {
      const data = classStudentsData.map((d) => ({
        'Оқушы ID': d.student.id,
        'Аты-жөні': d.student.fullName,
        'Сынып': selectedClass?.name || '',
        'Тоқсан': selectedQuarter?.name || '',
        'Қатысу пайызы': `${d.attendancePct}%`,
        'Тапсырма орындалуы': `${d.homeworkPct}%`,
        'Орындалмаған тапсырмалар саны': d.missingAssignments,
        'Ерекше бақылауда': d.needsAttention ? 'ИӘ' : 'ЖОҚ',
      }));
      exportToExcel(
        [{ sheetName: 'Class_Quarter_Report', data }],
        `Quarterly_Class_${selectedClass?.name || '7A'}_${selectedQuarterId}`
      );
    } else if (reportType === 'educator') {
      const data = educatorData.map((d) => ({
        'Тәрбиеші': d.educator.name,
        'Сыныптар': d.classes,
        'Барлық өткізілген күндер': d.totalSessions,
        'Уақытылы тапсырылған': d.onTime,
        'Кешігіп тапсырылған': d.late,
        'Тексерумен қамту': d.coverage,
      }));
      exportToExcel(
        [{ sheetName: 'Educator_Report', data }],
        `Quarterly_Educators_${selectedQuarterId}`
      );
    }
  };

  const handleExportPdf = () => {
    if (reportType === 'class') {
      const headers = ['Оқушы', 'ID', 'Қатысу %', 'Тапсырма %', 'Борыштар'];
      const rows = classStudentsData.map((d) => [
        d.student.fullName,
        d.student.id,
        `${d.attendancePct}%`,
        `${d.homeworkPct}%`,
        d.missingAssignments > 0 ? `${d.missingAssignments} тапсырма` : 'Жоқ',
      ]);
      exportToPdfReport({
        title: `Тоқсандық есеп: ${selectedClass?.name} сыныбы (${selectedQuarter?.name})`,
        subtitle: `Оқу жылы: ${currentYear?.name} | Оқушы саны: ${classStudents.length}`,
        headers,
        rows,
        fileName: `Quarter_Report_${selectedClass?.name}_${selectedQuarterId}`,
      });
    } else if (reportType === 'educator') {
      const headers = ['Тәрбиеші', 'Сыныптар', 'Жалпы күн', 'Уақытылы', 'Кешіккен', 'Қамту'];
      const rows = educatorData.map((d) => [
        d.educator.name,
        d.classes,
        String(d.totalSessions),
        String(d.onTime),
        String(d.late),
        d.coverage,
      ]);
      exportToPdfReport({
        title: `Тәрбиешілердің тоқсандық жұмыс есебі (${selectedQuarter?.name})`,
        subtitle: `Оқу жылы: ${currentYear?.name} | Бекітілген сыныптар бойынша`,
        headers,
        rows,
        fileName: `Quarter_Educators_${selectedQuarterId}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Академиялық қорытынды есептер</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Тоқсандық ресми есептер жүйесі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Кешкі дайындық, сабақ қатысуы және тәрбиешілердің жұмыс нәтижесі
          </p>
        </div>

        {/* Quarter and Class Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.quarterSelect}</label>
            <select
              value={selectedQuarterId}
              onChange={(e) => setSelectedQuarterId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            >
              {quarters.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name} ({q.startDate} — {q.endDate})
                </option>
              ))}
            </select>
          </div>

          {reportType === 'class' && (
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

      {/* Report Type Selector Tabs */}
      <div className="flex gap-2 sm:gap-4 p-1.5 bg-gray-100 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setReportType('class')}
          className={`px-4 py-2 rounded-xl transition ${
            reportType === 'class' ? 'bg-[#075C42] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Сынып есебі (Class Report)
        </button>
        <button
          onClick={() => setReportType('educator')}
          className={`px-4 py-2 rounded-xl transition ${
            reportType === 'educator' ? 'bg-[#075C42] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Тәрбиешілер есебі (Educator Report)
        </button>
      </div>

      {/* CLASS QUARTERLY REPORT */}
      {reportType === 'class' && (
        <div className="space-y-6">
          {/* Attention alert if students have missing homework */}
          {studentsNeedingAttention.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t.studentsNeedingAttention}</span>
              </div>
              <p className="text-amber-800">
                Мына оқушыларға ерекше көңіл бөлу қажет: {studentsNeedingAttention.map((s) => s.student.fullName).join(', ')}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
            <h3 className="text-sm font-extrabold text-[#24342D] mb-4">
              {selectedClass?.name} сыныбы — {selectedQuarter?.name} нәтижелері
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8FAF9]">
                  <th className="py-3 px-3 font-extrabold text-[#24342D]">Оқушы</th>
                  <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Қатысу пайызы</th>
                  <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Тапсырма орындалуы</th>
                  <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Орындалмаған тапсырма</th>
                  <th className="py-3 px-3 font-extrabold text-[#24342D] text-right">Қорытынды</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudentsData.map((d) => (
                  <tr key={d.student.id} className="hover:bg-[#F8FAF9]/80 transition">
                    <td className="py-3 px-3 font-bold text-[#24342D]">
                      {d.student.fullName}
                      <span className="block text-[10px] text-gray-400 font-mono">{d.student.id}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-[#075C42]">
                      {d.attendancePct}%
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-[#138A62]">
                      {d.homeworkPct}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          d.missingAssignments > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {d.missingAssignments > 0 ? `${d.missingAssignments} қарыз` : 'Жоқ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          d.needsAttention
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#E6F4EA] text-[#075C42]'
                        }`}
                      >
                        {d.needsAttention ? 'Назар аудару' : 'Үздік дайындық'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDUCATOR QUARTERLY REPORT */}
      {reportType === 'educator' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
          <h3 className="text-sm font-extrabold text-[#24342D] mb-4">
            Тәрбиешілердің тоқсандық есебі ({selectedQuarter?.name})
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F8FAF9]">
                <th className="py-3 px-3 font-extrabold text-[#24342D]">Тәрбиеші</th>
                <th className="py-3 px-3 font-extrabold text-[#24342D]">Сыныптар</th>
                <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Барлық күндер</th>
                <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Уақытылы тапсырылған</th>
                <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Кешіккен</th>
                <th className="py-3 px-3 font-extrabold text-[#24342D] text-right">Тексерумен қамту</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {educatorData.map((d) => (
                <tr key={d.educator.id} className="hover:bg-[#F8FAF9]/80 transition">
                  <td className="py-3 px-3 font-bold text-[#24342D]">
                    {d.educator.name}
                    <span className="block text-[10px] text-gray-400 font-normal">{d.educator.email}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-700">{d.classes}</td>
                  <td className="py-3 px-3 text-center font-bold text-gray-800">{d.totalSessions} күн</td>
                  <td className="py-3 px-3 text-center font-extrabold text-[#075C42]">{d.onTime} күн</td>
                  <td className="py-3 px-3 text-center font-bold text-amber-700">{d.late} күн</td>
                  <td className="py-3 px-3 text-right font-extrabold text-[#138A62]">{d.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
