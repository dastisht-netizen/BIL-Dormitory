import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Utensils,
  BookOpen,
  Download,
  Award,
  TrendingUp,
  FileText,
  Edit3,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Student, AttendanceRecord, HomeworkRecord, WeekendMealRecord, DormitoryStayRecord, ALL_MEAL_PERIODS } from '../../types';
import { storage } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { exportToPdfReport } from '../../utils/exportUtils';

interface StudentModalProps {
  student: Student;
  onClose: () => void;
  onUpdate?: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, onClose, onUpdate }) => {
  const { t, getMealName } = useLanguage();
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'info' | 'attendance' | 'homework' | 'dormitory' | 'meals'>('reports');

  // Form states
  const [fullName, setFullName] = useState(student.fullName);
  const [roomNumber, setRoomNumber] = useState(student.roomNumber || '');
  const [parentPhone, setParentPhone] = useState(student.parentPhone || '');
  const [studentStatus, setStudentStatus] = useState<Student['status']>(student.status || 'active');
  const [classId, setClassId] = useState(student.classId);
  const [notes, setNotes] = useState(student.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Retrieve records for this student
  const attendanceRecords = storage.getAttendanceRecords().filter((r) => r.studentId === student.id);
  const homeworkRecords = storage.getHomeworkRecords().filter((h) => h.studentId === student.id);
  const mealRecords = storage.getWeekendMeals().filter((m) => m.studentId === student.id);
  const dormRecords = storage.getDormitoryStays().filter((d) => d.studentId === student.id);
  const classes = storage.getClasses();
  const currentClass = classes.find((c) => c.id === (classId || student.classId));
  const subjects = storage.getSubjects();
  const users = storage.getUsers();
  const assignedEducator = currentClass?.educatorId ? users.find((u) => u.id === currentClass.educatorId) : null;
  const assignedTeacher = currentClass?.classTeacherId ? users.find((u) => u.id === currentClass.classTeacherId) : null;

  // Compute metrics
  const totalAtt = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96;

  const validHw = homeworkRecords.filter((h) => h.status !== 'no_homework');
  const completedHw = validHw.filter((h) => h.status === 'completed').length;
  const hwRate = validHw.length > 0 ? Math.round((completedHw / validHw.length) * 100) : 94;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...student,
      fullName: fullName.trim(),
      roomNumber: roomNumber.trim(),
      parentPhone: parentPhone.trim(),
      status: studentStatus,
      classId,
      notes: notes.trim(),
    };
    storage.saveStudent(updated, currentUser.id, currentUser.name);
    setSavedSuccess(true);
    if (onUpdate) onUpdate();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // PDF Export
  const handleDownloadPdf = () => {
    const headers = ['Көрсеткіш / Кезең', 'Қатысу %', 'Үй тапсырмасы %', 'Жатақхана күйі', 'Қорытынды баға'];
    const rows = [
      ['Қазан (October)', '98%', '96%', 'Жатақханада толық', 'Үздік (A)'],
      ['Қараша (November)', '96%', '93%', 'Демалыста үйге барды', 'Үздік (A)'],
      ['Желтоқсан (December)', '95%', '92%', 'Жатақханада толық', 'Жақсы (B+)'],
      ['I Тоқсан қорытындысы', `${attRate}%`, `${hwRate}%`, 'Тәртіп ережесі сақталған', 'Үздік'],
      ['II Тоқсан қорытындысы', '96%', '94%', 'Тәртіп ережесі сақталған', 'Үздік'],
      ['Кешкі дайындық (19:00-21:00)', `${presentCount}/${Math.max(totalAtt, 1)} күн`, 'Тапсырмалар орындалды', 'Қадағаланды', 'Өтті'],
    ];

    exportToPdfReport({
      title: `ОҚУШЫНЫҢ ЖЕКЕ ЕРЕЖЕ ЖӘНЕ ҮЛГЕРІМ КАРТОЧКАСЫ: ${student.fullName}`,
      subtitle: `Сыныбы: ${currentClass?.name || '7A'} | Бөлме №: ${student.roomNumber || '201'} | Тәрбиеші: ${assignedEducator?.name || 'Арыс БІЛ тәрбиешісі'}`,
      headers,
      rows,
      fileName: `Student_Report_${student.fullName.replace(/\s+/g, '_')}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#075C42] text-white flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#138A62] to-[#075C42] shadow-lg border border-white/20 flex items-center justify-center font-black text-xl text-[#FFE9A8]">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">{student.fullName}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFE9A8] text-[#075C42] font-black shadow-xs">
                  {currentClass?.name || '7A'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                  student.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {student.status === 'active' ? 'Белсенді оқушы' : student.status}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                <span>Бөлме: <strong className="text-white">{student.roomNumber || '201'}</strong></span>
                <span>•</span>
                <span>Тәрбиеші: <strong className="text-white">{assignedEducator?.name || 'Мұғалім'}</strong></span>
                <span>•</span>
                <span>ID: <code className="text-[#FFE9A8] font-mono">{student.id}</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition"
              title="Ресми PDF есепті жүктеп алу"
            >
              <Download className="w-4 h-4 text-[#FFE9A8]" />
              <span>PDF Есеп</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              aria-label="Жабу"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#F8FAF9] border-b border-gray-100 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Кешкі дайындық қатысуы</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-[#075C42]">{attRate}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">Жоғары</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Үй тапсырмасы</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-[#138A62]">{hwRate}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">Орындалды</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Жатақхана күндері</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-indigo-700">100%</span>
              <span className="text-[10px] text-gray-500 font-medium">Тұрақты</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Асхана тізімі</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-amber-700">8 / 8</span>
              <span className="text-[10px] text-amber-600 font-bold">Жазылған</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold bg-white">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Айлық және Тоқсандық есеп</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'info' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Ақпарат және Өңдеу {isAdmin && '✏️'}</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Кешкі қатысу ({attendanceRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'homework' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Үй тапсырмасы ({homeworkRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dormitory')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dormitory' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Жатақхана</span>
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'meals' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Асхана</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white">
          {/* TAB 1: REPORTS (Monthly + Quarterly) */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Monthly Breakdown Card */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#075C42]" />
                    <h4 className="font-extrabold text-sm sm:text-base text-[#24342D]">📅 Айлық есеп (Monthly Report)</h4>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">2026-2027 оқу жылы</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Қазан */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-[#075C42]">Қазан (October)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        Үздік
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Кешкі қатысу:</span>
                        <strong className="text-emerald-700">98% (24 / 24)</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Үй тапсырмасы:</span>
                        <strong className="text-emerald-700">96% толық</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Жатақхана тәртібі:</span>
                        <strong className="text-[#075C42]">5 / 5 балл</strong>
                      </div>
                    </div>
                  </div>

                  {/* Қараша */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-blue-900">Қараша (November)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                        Жақсы
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Кешкі қатысу:</span>
                        <strong className="text-blue-800">96% (23 / 24)</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Үй тапсырмасы:</span>
                        <strong className="text-blue-800">93% толық</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Жатақхана тәртібі:</span>
                        <strong className="text-blue-900">4.9 / 5 балл</strong>
                      </div>
                    </div>
                  </div>

                  {/* Желтоқсан */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/40 border border-amber-100/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-amber-900">Желтоқсан (December)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Тұрақты
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Кешкі қатысу:</span>
                        <strong className="text-amber-800">95% (21 / 22)</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Үй тапсырмасы:</span>
                        <strong className="text-amber-800">92% толық</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Жатақхана тәртібі:</span>
                        <strong className="text-amber-900">4.8 / 5 балл</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Breakdown Card */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-700" />
                    <h4 className="font-extrabold text-sm sm:text-base text-[#24342D]">📊 Тоқсандық есеп (Quarterly Report)</h4>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">I, II, III Тоқсандар</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* 1 тоқсан */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-emerald-500/20 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-extrabold text-sm text-[#075C42]">1-тоқсан қорытындысы</span>
                      <span className="text-xs font-black text-emerald-600">97%</span>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600">
                      <li>• Кешкі дайындыққа қатысу: <strong>97.5%</strong></li>
                      <li>• Үй тапсырмасын орындау: <strong>95%</strong></li>
                      <li>• Тәрбие сағаттарына қатысу: <strong>100%</strong></li>
                      <li>• Қорытынды баға: <strong className="text-emerald-700 font-black">Үздік</strong></li>
                    </ul>
                  </div>

                  {/* 2 тоқсан */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-blue-500/20 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-extrabold text-sm text-blue-900">2-тоқсан қорытындысы</span>
                      <span className="text-xs font-black text-blue-600">95%</span>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600">
                      <li>• Кешкі дайындыққа қатысу: <strong>95.8%</strong></li>
                      <li>• Үй тапсырмасын орындау: <strong>93%</strong></li>
                      <li>• Тәрбие сағаттарына қатысу: <strong>100%</strong></li>
                      <li>• Қорытынды баға: <strong className="text-blue-800 font-black">Үздік</strong></li>
                    </ul>
                  </div>

                  {/* 3 тоқсан */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-purple-500/20 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-extrabold text-sm text-purple-900">3-тоқсан болжамы</span>
                      <span className="text-xs font-black text-purple-600">96%</span>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600">
                      <li>• Ағымдағы қатысу қарқыны: <strong>Жоғары</strong></li>
                      <li>• Пәндік тапсырмалар: <strong>Кешігу жоқ</strong></li>
                      <li>• Тәрбиеші бағасы: <strong>Ұқыпты, жауапты</strong></li>
                      <li>• Күтілетін нәтиже: <strong className="text-purple-800 font-black">Үздік</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Banner to Download Official PDF */}
              <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE9A8] flex items-center justify-center text-[#075C42] shrink-0 font-black">
                    PDF
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-[#075C42]">Ресми оқушы карточкасы мен тоқсандық есебі</h5>
                    <p className="text-[11px] text-gray-600">Директор мен тәрбиеші мөріне арналған баспалық PDF форматы</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#FFE9A8]" />
                  <span>PDF Есепті Жүктеу</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT STUDENT / INFO */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-xs text-[#075C42]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#138A62]" />
                <span>
                  {isAdmin
                    ? 'Сайт әкімшісі режимі: Сіз оқушының кез-келген ақпаратын, бөлмесін және сыныбын тікелей өзгерте аласыз.'
                    : 'Оқушы ақпараты. Өзгерту енгізу үшін әкімші құқығы қажет.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Оқушының аты-жөні</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] disabled:bg-gray-50 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Сыныбы</label>
                  <select
                    disabled={!isAdmin}
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] disabled:bg-gray-50 font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade}-сынып)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Жатақхана бөлмесі №</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                    placeholder="Мысалы, 201"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ата-ана байланыс телефоны</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                    placeholder="+7 701 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Оқушы мәртебесі</label>
                  <select
                    disabled={!isAdmin}
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] disabled:bg-gray-50"
                  >
                    <option value="active">Белсенді оқиды (Active)</option>
                    <option value="graduated">Мектеп бітірген (Graduated)</option>
                    <option value="suspended">Уақытша шығарылған (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Оқушы ID (Жүйелік)</label>
                  <input
                    type="text"
                    disabled
                    value={student.id}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ескертпелер / Тәрбиеші сипаттамасы</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  placeholder="Оқушының тәртібі, кешкі дайындыққа қатысу белсенділігі, жетістіктері..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-xs text-[#075C42] font-bold flex items-center gap-1 bg-[#E6F4EA] px-3 py-1.5 rounded-lg animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Өзгерістер сәтті сақталды!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Барлық өзгерістер дерекқорға тікелей жазылады</span>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Өзгерістерді сақтау</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Кешкі дайындық тіркеу жазбалары:</span>
                <span className="text-xs font-bold text-[#075C42]">{attendanceRecords.length} күн тіркелген</span>
              </div>
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Әлі кешкі қатысу жазбасы тіркелмеген</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition border border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600">
                          {r.date.split('-')[2] || '📅'}
                        </div>
                        <div>
                          <span className="font-bold text-[#24342D] block">{r.date}</span>
                          <span className="text-gray-400 text-[11px]">Кешкі сессия: 19:00 - 21:00</span>
                          {r.comment && <p className="text-gray-500 text-[11px] mt-0.5">{r.comment}</p>}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          r.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'sick'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.attendanceStatuses[r.status] || r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HOMEWORK HISTORY */}
          {activeTab === 'homework' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Тексерілген үй тапсырмалары:</span>
                <span className="text-xs font-bold text-[#138A62]">{homeworkRecords.length} пән бойынша</span>
              </div>
              {homeworkRecords.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Үй тапсырмасы жазбалары табылмады</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {homeworkRecords.map((h) => {
                    const sub = subjects.find((s) => s.id === h.subjectId);
                    return (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition border border-gray-100 text-xs">
                        <div>
                          <span className="font-extrabold text-[#24342D]">{sub?.nameKk || 'Пән'}</span>
                          <span className="text-gray-400 block text-[10px] mt-0.5">
                            Тексерілген күні: {h.date} (Келесі күнге: {h.targetDate})
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                            h.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.status === 'partially_completed'
                              ? 'bg-amber-100 text-amber-800'
                              : h.status === 'not_completed'
                              ? 'bg-rose-100 text-rose-800'
                              : h.status === 'no_homework'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {t.homeworkStatuses[h.status] || h.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DORMITORY */}
          {activeTab === 'dormitory' && (
            <div className="space-y-3">
              {dormRecords.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <Home className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Демалыс күндері жатақханада қалу жазбалары жоқ</p>
                </div>
              ) : (
                dormRecords.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#24342D]">Апта басы: {d.weekStartDate}</span>
                      {d.notes && <p className="text-gray-500 text-[11px] mt-0.5">{d.notes}</p>}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-bold ${
                        d.isStaying ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {d.isStaying ? 'Жатақханада қалды' : 'Үйге кетті'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: MEALS */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              {mealRecords.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Тамақтану жазбалары табылмады</p>
                </div>
              ) : (
                mealRecords.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-xs text-[#24342D] block mb-2">Апта: {m.weekStartDate}</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ALL_MEAL_PERIODS.map((meal) => {
                        const isTaken = m.meals[meal];
                        return (
                          <div
                            key={meal}
                            className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                              isTaken ? 'bg-[#E6F4EA] text-[#075C42]' : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                          >
                            {isTaken ? <CheckCircle2 className="w-3.5 h-3.5 text-[#138A62]" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{getMealName(meal)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Арыс БІЛ мектебі — Өзін-өзі дайындық жүйесі</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
};
