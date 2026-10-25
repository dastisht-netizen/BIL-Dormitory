import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Shield,
  Layers
} from 'lucide-react';
import { AuditLogEntry, SchoolClass, SelfStudySession, User } from '../../types';
import { storage } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const EducatorPerformanceView: React.FC = () => {
  const { t } = useLanguage();

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<SelfStudySession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchAudit, setSearchAudit] = useState('');

  useEffect(() => {
    setUsers(storage.getUsers());
    setClasses(storage.getClasses());
    setSessions(storage.getSessions());
    setAuditLogs(storage.getAuditLogs());
  }, [date]);

  const educators = users.filter((u) => u.role === 'EDUCATOR');

  // Compute educator performance for selected date
  const performanceRows = educators.map((edu) => {
    const assigned = classes.filter((c) => edu.assignedClassIds?.includes(c.id));
    const eduSessions = sessions.filter(
      (s) => s.educatorId === edu.id && s.date === date
    );

    const hasAnySession = eduSessions.length > 0;
    const isCompleted = eduSessions.some((s) => s.isSubmitted);
    const firstStarted = eduSessions.find((s) => s.startedAt)?.startedAt || '—';
    const firstCompleted = eduSessions.find((s) => s.completedAt)?.completedAt || '—';

    let status: 'completed' | 'in_progress' | 'late' | 'missing' = 'missing';
    if (isCompleted) {
      status = 'completed';
    } else if (hasAnySession) {
      status = 'in_progress';
    }

    // Homework & attendance records for these classes
    const classIds = assigned.map((c) => c.id);
    const attendanceRecords = storage
      .getAttendanceRecords()
      .filter((r) => classIds.includes(r.classId) && r.date === date);
    const homeworkRecords = storage
      .getHomeworkRecords()
      .filter((r) => classIds.includes(r.classId) && r.date === date);

    return {
      educator: edu,
      classes: assigned.map((c) => c.name).join(', '),
      startedAt: firstStarted,
      completedAt: firstCompleted,
      status,
      attendanceCount: attendanceRecords.length,
      homeworkCount: homeworkRecords.length,
    };
  });

  const handleExportExcel = () => {
    const data = performanceRows.map((row) => ({
      'Тәрбиеші': row.educator.name,
      'Бекітілген сыныптар': row.classes,
      'Басталған уақыты': row.startedAt,
      'Аяқталған уақыты': row.completedAt,
      'Мәртебесі': row.status === 'completed' ? 'Аяқталды' : row.status === 'in_progress' ? 'Орындалуда' : 'Тапсырылмады',
      'Қатысу жазбалары': row.attendanceCount,
      'Үй тапсырмасы жазбалары': row.homeworkCount,
    }));

    exportToExcel(
      [{ sheetName: `Performance_${date}`, data }],
      `Arys_BIL_Educator_Performance_${date}`
    );
  };

  const handleExportPdf = () => {
    const headers = ['Тәрбиеші', 'Сыныптар', 'Басталды', 'Аяқталды', 'Мәртебесі'];
    const rows = performanceRows.map((r) => [
      r.educator.name,
      r.classes,
      r.startedAt,
      r.completedAt,
      r.status === 'completed' ? 'Аяқталды' : r.status === 'in_progress' ? 'Жүруде' : 'Тапсырылмады',
    ]);

    exportToPdfReport({
      title: 'Тәрбиешілердің кешкі өзіндік дайындықты өткізу есебі',
      subtitle: `Күні: ${date} | Тәрбиешілер саны: ${educators.length}`,
      headers,
      rows,
      fileName: `Educator_Performance_${date}`,
    });
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchAudit.toLowerCase()) ||
      l.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchAudit.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Activity className="w-4 h-4" />
            <span>Тәрбиешілер мониторингі</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Тәрбиешілердің кешкі дайындықты өткізу жұмысы
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Кешкі дайындықтың басталу, аяқталу уақыты мен тексеру толықтығының есебі
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterDate}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
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

      {/* Performance Matrix Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
        <h3 className="text-sm font-extrabold text-[#24342D] mb-4">
          Тәрбиешілердің күнделікті мониторинг нәтижесі
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8FAF9]">
              <th className="py-3 px-3 font-extrabold text-[#24342D]">Тәрбиеші</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D]">Сыныптар</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D]">{t.educatorStartedAt}</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D]">{t.educatorCompletedAt}</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Қатысу есебі</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Үй тапсырмасы</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D] text-right">Күйі</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceRows.map((row) => (
              <tr key={row.educator.id} className="hover:bg-[#F8FAF9]/80 transition">
                <td className="py-3 px-3 font-bold text-[#24342D]">
                  {row.educator.name}
                  <span className="block text-[10px] text-gray-400 font-normal">{row.educator.email}</span>
                </td>
                <td className="py-3 px-3 font-semibold text-gray-700">{row.classes || '—'}</td>
                <td className="py-3 px-3 font-mono text-gray-600">{row.startedAt}</td>
                <td className="py-3 px-3 font-mono text-gray-600">{row.completedAt}</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                    {row.attendanceCount} жазба
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px]">
                    {row.homeworkCount} жазба
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      row.status === 'completed'
                        ? 'bg-[#E6F4EA] text-[#075C42]'
                        : row.status === 'in_progress'
                        ? 'bg-[#FFF8E7] text-amber-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {row.status === 'completed'
                      ? t.statusCompleted
                      : row.status === 'in_progress'
                      ? t.statusInProgress
                      : t.statusMissing}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#24342D]">
              Толық аудит журналы (Audit Log)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Әрбір өзгерту, оқушы жазбасы және уақыт таңбасы қатаң тіркеледі
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Аудит журналынан іздеу..."
              value={searchAudit}
              onChange={(e) => setSearchAudit(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] w-56 sm:w-64"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {filteredLogs.slice(0, 30).map((log) => (
            <div key={log.id} className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8FAF9] rounded-xl transition text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#24342D]">{log.userName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                    {log.action}
                  </span>
                  {log.studentName && (
                    <span className="text-xs font-semibold text-[#075C42]">
                      ({log.studentName})
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-gray-500 text-[11px] mt-0.5">{log.details}</p>
                )}
                {log.newValue && (
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Мән: {log.previousValue ? `${log.previousValue} → ` : ''}{log.newValue}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-gray-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
