import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Search,
  Check,
  ShieldCheck
} from 'lucide-react';
import { DormitoryStayRecord, SchoolClass, Student } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const DormitoryGrid: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -3 : 4);
    const thurs = new Date(d.setDate(diff));
    return thurs.toISOString().split('T')[0];
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [dormStays, setDormStays] = useState<Record<string, { isStaying: boolean; notes: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const allClasses = storage.getClasses();
    setClasses(allClasses);
  }, []);

  useEffect(() => {
    const allStudents = storage.getStudents().filter((s) => s.status === 'active');
    const filtered = selectedClassId === 'all'
      ? allStudents
      : allStudents.filter((s) => s.classId === selectedClassId);
    setStudents(filtered);

    // Load existing records
    const existing = storage.getDormitoryStays().filter((d) => d.weekStartDate === weekStartDate);
    const map: Record<string, { isStaying: boolean; notes: string }> = {};

    filtered.forEach((st) => {
      const found = existing.find((r) => r.studentId === st.id);
      map[st.id] = {
        isStaying: found ? found.isStaying : true, // default staying
        notes: found?.notes || '',
      };
    });
    setDormStays(map);
  }, [selectedClassId, weekStartDate]);

  const toggleStaying = (studentId: string, isStaying: boolean) => {
    setDormStays((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        isStaying,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setDormStays((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { isStaying: true }),
        notes,
      },
    }));
  };

  const handleMarkAllStaying = (value: boolean) => {
    const updated: Record<string, { isStaying: boolean; notes: string }> = {};
    students.forEach((st) => {
      updated[st.id] = {
        isStaying: value,
        notes: dormStays[st.id]?.notes || '',
      };
    });
    setDormStays(updated);
  };

  const handleSave = () => {
    const recordsToSave: DormitoryStayRecord[] = students.map((st) => ({
      id: `dorm-${st.id}-${weekStartDate}`,
      studentId: st.id,
      classId: st.classId,
      weekStartDate,
      isStaying: dormStays[st.id]?.isStaying ?? true,
      notes: dormStays[st.id]?.notes || '',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    }));

    storage.bulkSaveDormitoryStays(recordsToSave, currentUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const stayingCount = students.filter((st) => dormStays[st.id]?.isStaying).length;
  const leavingCount = students.length - stayingCount;

  // Filtered by search query
  const displayedStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = displayedStudents.map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      const stay = dormStays[st.id]?.isStaying;
      return {
        'Оқушы ID': st.id,
        'Аты-жөні': st.fullName,
        'Сынып': cls?.name || '',
        'Бөлме №': st.roomNumber || '',
        'Демалыста қалуы': stay ? 'Жатақханада қалады' : 'Үйге кетеді',
        'Ескертпе': dormStays[st.id]?.notes || '',
      };
    });

    exportToExcel(
      [{ sheetName: `Dormitory_${weekStartDate}`, data }],
      `Arys_BIL_Dormitory_${weekStartDate}`
    );
  };

  const handleExportPdf = () => {
    const headers = ['Оқушы', 'Сынып', 'Бөлме', 'Жатақханада қалуы', 'Ескертпе'];
    const rows = displayedStudents.map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      const stay = dormStays[st.id]?.isStaying;
      return [
        st.fullName,
        cls?.name || '',
        st.roomNumber || '—',
        stay ? 'ҚАЛАДЫ' : 'ҮЙГЕ КЕТТІ',
        dormStays[st.id]?.notes || '—',
      ];
    });

    exportToPdfReport({
      title: 'Демалыс күндері жатақханада қалатын оқушылар ведомосі',
      subtitle: `Апта: ${weekStartDate} | Жатақханада: ${stayingCount} | Үйге кеткен: ${leavingCount}`,
      headers,
      rows,
      fileName: `Arys_BIL_Dormitory_${weekStartDate}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Building2 className="w-4 h-4" />
            <span>Жатақхана мониторингі</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Сенбі-жексенбі жатақханада қалушылар тізімі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Оқушылардың интернатта қалу немесе үйге қайту мәртебесін қадағалау
          </p>
        </div>

        {/* Filter controls & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterClass}</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            >
              <option value="all">{t.filterAllClasses}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} сыныбы
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Апта күні</label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#075C42] shrink-0 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">{t.totalStudents}</span>
            <div className="text-2xl font-extrabold text-[#075C42]">{students.length} оқушы</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0 font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">{t.stayingInDorm}</span>
            <div className="text-2xl font-extrabold text-blue-700">{stayingCount} оқушы</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">{t.goingHome}</span>
            <div className="text-2xl font-extrabold text-amber-700">{leavingCount} оқушы</div>
          </div>
        </div>
      </div>

      {/* Quick Toolbar & Search */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAllStaying(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E6F4EA] text-[#075C42] hover:bg-[#cbe6d4] transition"
          >
            Барлығы қалады
          </button>
          <button
            onClick={() => handleMarkAllStaying(false)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 transition"
          >
            Барлығы үйге кетеді
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] w-52 sm:w-64"
            />
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-[#075C42] flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Жатақхана тізімі сақталды!
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-[#FFE9A8]" />
            <span>{t.saveChanges}</span>
          </button>
        </div>
      </div>

      {/* Student Dormitory List */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-100 divide-y divide-gray-100">
        {displayedStudents.map((st, idx) => {
          const cls = classes.find((c) => c.id === st.classId);
          const isStaying = dormStays[st.id]?.isStaying ?? true;
          const notes = dormStays[st.id]?.notes || '';

          return (
            <div
              key={st.id}
              className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F8FAF9] px-2 rounded-2xl transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-gray-400">{idx + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#24342D]">{st.fullName}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600">
                      {cls?.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    ID: {st.id} • Бөлме: {st.roomNumber || '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => toggleStaying(st.id, true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isStaying
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Жатақханада қалады
                  </button>
                  <button
                    onClick={() => toggleStaying(st.id, false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      !isStaying
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Үйге кетеді
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Себебі немесе ескертпе..."
                  value={notes}
                  onChange={(e) => handleNotesChange(st.id, e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#138A62] w-48 sm:w-60"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
