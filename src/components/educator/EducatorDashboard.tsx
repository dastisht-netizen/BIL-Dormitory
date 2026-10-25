import React, { useState, useEffect } from 'react';
import {
  Moon,
  UserCheck,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  CheckCheck,
  Send,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Users,
  Plus,
  Trash2,
  Search,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  HomeworkRecord,
  HomeworkStatus,
  SchoolClass,
  SelfStudySession,
  Student,
  Subject
} from '../../types';
import { storage, MAX_STUDENTS_PER_CLASS } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StudentModal } from '../students/StudentModal';

export const EducatorDashboard: React.FC = () => {
  const { currentUser, isAdmin, canAccessClass } = useAuth();
  const { t } = useLanguage();

  const [activeEducatorTab, setActiveEducatorTab] = useState<'study_session' | 'my_students'>('study_session');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Student management state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoom, setNewStudentRoom] = useState('201');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [studentNotice, setStudentNotice] = useState<string | null>(null);

  const [session, setSession] = useState<SelfStudySession | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus; comment: string }>>({});
  const [targetSubjects, setTargetSubjects] = useState<Subject[]>([]);
  const [targetDayInfo, setTargetDayInfo] = useState<{ date: string; dayName: string; dayOfWeek: number }>({
    date: '',
    dayName: '',
    dayOfWeek: 1,
  });
  const [homework, setHomework] = useState<Record<string, Record<string, HomeworkStatus>>>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Load classes allowed for current user
  useEffect(() => {
    const allClasses = storage.getClasses();
    const available = isAdmin
      ? allClasses
      : allClasses.filter((c) => currentUser.assignedClassIds?.includes(c.id));
    setClasses(available);

    if (available.length > 0 && (!selectedClassId || !available.find((c) => c.id === selectedClassId))) {
      setSelectedClassId(available[0].id);
    }
  }, [currentUser, isAdmin]);

  // Load session, students, next day subjects, attendance & homework when class/date changes
  useEffect(() => {
    if (!selectedClassId) return;

    // Load active students of this class
    const classStudents = storage.getStudents().filter((s) => s.classId === selectedClassId && s.status === 'active');
    setStudents(classStudents);

    // Get or create session
    const sess = storage.getOrCreateSession(selectedClassId, selectedDate, currentUser.id);
    setSession(sess);

    // Compute next school day
    const nextDay = storage.getNextSchoolDay(selectedDate);
    setTargetDayInfo(nextDay);

    // Get subjects scheduled for that next day
    const subs = storage.getSubjectsForClassOnDay(selectedClassId, nextDay.dayOfWeek);
    setTargetSubjects(subs);

    // Load attendance records
    const allAtt = storage.getAttendanceRecords().filter((r) => r.classId === selectedClassId && r.date === selectedDate);
    const attMap: Record<string, { status: AttendanceStatus; comment: string }> = {};
    classStudents.forEach((st) => {
      const rec = allAtt.find((r) => r.studentId === st.id);
      attMap[st.id] = {
        status: rec?.status || 'present',
        comment: rec?.comment || '',
      };
    });
    setAttendance(attMap);

    // Load homework records
    const allHw = storage.getHomeworkRecords().filter((r) => r.classId === selectedClassId && r.date === selectedDate);
    const hwMap: Record<string, Record<string, HomeworkStatus>> = {};
    classStudents.forEach((st) => {
      hwMap[st.id] = {};
      subs.forEach((sub) => {
        const rec = allHw.find((r) => r.studentId === st.id && r.subjectId === sub.id);
        hwMap[st.id][sub.id] = rec?.status || 'not_checked';
      });
    });
    setHomework(hwMap);

    // Reset status flags
    setSubmissionSuccess(sess.isSubmitted);
  }, [selectedClassId, selectedDate]);

  // Attendance handlers
  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, comment?: string) => {
    const current = attendance[studentId] || { status: 'present', comment: '' };
    const updated = {
      ...attendance,
      [studentId]: {
        status,
        comment: comment !== undefined ? comment : current.comment,
      },
    };
    setAttendance(updated);

    // Immediate save & audit
    storage.saveAttendance(
      {
        id: `att-${studentId}-${selectedDate}`,
        sessionId: session?.id || `session-${selectedClassId}-${selectedDate}`,
        studentId,
        classId: selectedClassId,
        date: selectedDate,
        status,
        comment: comment !== undefined ? comment : current.comment,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      },
      currentUser
    );
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendance };
    const toSave: AttendanceRecord[] = [];
    students.forEach((st) => {
      updated[st.id] = { status: 'present', comment: '' };
      toSave.push({
        id: `att-${st.id}-${selectedDate}`,
        sessionId: session?.id || `session-${selectedClassId}-${selectedDate}`,
        studentId: st.id,
        classId: selectedClassId,
        date: selectedDate,
        status: 'present',
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      });
    });
    setAttendance(updated);
    storage.bulkSaveAttendance(toSave, currentUser);
  };

  // Homework handlers
  const handleHomeworkChange = (studentId: string, subjectId: string, status: HomeworkStatus) => {
    setHomework((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: status,
      },
    }));

    // Immediate save & audit
    storage.saveHomework(
      {
        id: `hw-${studentId}-${subjectId}-${selectedDate}`,
        sessionId: session?.id || `session-${selectedClassId}-${selectedDate}`,
        studentId,
        subjectId,
        classId: selectedClassId,
        date: selectedDate,
        targetDate: targetDayInfo.date,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      },
      currentUser
    );
  };

  const handleMarkAllCompleted = () => {
    const updated: Record<string, Record<string, HomeworkStatus>> = {};
    const toSave: HomeworkRecord[] = [];

    students.forEach((st) => {
      updated[st.id] = {};
      targetSubjects.forEach((sub) => {
        // If student is absent or sick, keep unverified
        const attStatus = attendance[st.id]?.status;
        const status: HomeworkStatus = attStatus === 'absent' || attStatus === 'sick' ? 'not_checked' : 'completed';
        updated[st.id][sub.id] = status;
        toSave.push({
          id: `hw-${st.id}-${sub.id}-${selectedDate}`,
          sessionId: session?.id || `session-${selectedClassId}-${selectedDate}`,
          studentId: st.id,
          subjectId: sub.id,
          classId: selectedClassId,
          date: selectedDate,
          targetDate: targetDayInfo.date,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
      });
    });
    setHomework(updated);
    storage.bulkSaveHomework(toSave, currentUser);
  };

  const handleMarkSubjectCompleted = (subjectId: string) => {
    const updated = { ...homework };
    const toSave: HomeworkRecord[] = [];
    students.forEach((st) => {
      const attStatus = attendance[st.id]?.status;
      const status: HomeworkStatus = attStatus === 'absent' || attStatus === 'sick' ? 'not_checked' : 'completed';
      if (!updated[st.id]) updated[st.id] = {};
      updated[st.id][subjectId] = status;
      toSave.push({
        id: `hw-${st.id}-${subjectId}-${selectedDate}`,
        sessionId: session?.id || `session-${selectedClassId}-${selectedDate}`,
        studentId: st.id,
        subjectId,
        classId: selectedClassId,
        date: selectedDate,
        targetDate: targetDayInfo.date,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      });
    });
    setHomework(updated);
    storage.bulkSaveHomework(toSave, currentUser);
  };

  // Step 3 Validation & Final Submission
  const validateSession = (): boolean => {
    const errors: string[] = [];

    // Check attendance completeness
    students.forEach((st) => {
      if (!attendance[st.id]) {
        errors.push(`${st.fullName}: Қатысуы белгіленбеген`);
      }
    });

    // Check unchecked homework for present students
    if (targetSubjects.length === 0) {
      errors.push('Бұл күнге сабақ кестесінде пәндер табылмады');
    } else {
      students.forEach((st) => {
        const attStatus = attendance[st.id]?.status;
        if (attStatus === 'present' || attStatus === 'late') {
          targetSubjects.forEach((sub) => {
            const hwStatus = homework[st.id]?.[sub.id];
            if (!hwStatus || hwStatus === 'not_checked') {
              errors.push(`${st.fullName} — ${sub.nameKk}: Тапсырма тексерілмеді`);
            }
          });
        }
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInitiateSubmission = () => {
    const isValid = validateSession();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    if (!session) return;
    const completedTime = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const updatedSession: SelfStudySession = {
      ...session,
      completedAt: completedTime,
      isSubmitted: true,
      targetDateForHomework: targetDayInfo.date,
    };

    storage.saveSession(updatedSession);
    setSession(updatedSession);

    storage.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'COMPLETE_DAILY_MONITORING',
      entityType: 'attendance',
      entityId: session.id,
      previousValue: 'in_progress',
      newValue: 'completed',
      timestamp: new Date().toISOString(),
      details: `${selectedDate} күнгі кешкі дайындық бақылауы толық аяқталды (${completedTime})`,
    });

    setShowConfirmModal(false);
    setSubmissionSuccess(true);
  };

  // Status color helpers
  const hwStatusConfig: Record<HomeworkStatus, { label: string; bg: string; text: string; border: string }> = {
    completed: { label: t.homeworkStatuses.completed, bg: 'bg-[#138A62]', text: 'text-white', border: 'border-[#075C42]' },
    partially_completed: { label: t.homeworkStatuses.partially_completed, bg: 'bg-[#FFE9A8]', text: 'text-amber-900', border: 'border-amber-400' },
    not_completed: { label: t.homeworkStatuses.not_completed, bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600' },
    no_homework: { label: t.homeworkStatuses.no_homework, bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-600' },
    not_checked: { label: t.homeworkStatuses.not_checked, bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-300' },
  };

  const reloadClassStudents = () => {
    if (!selectedClassId) return;
    const classStudents = storage.getStudents().filter((s) => s.classId === selectedClassId && s.status === 'active');
    setStudents(classStudents);
  };

  const handleOpenAddStudent = () => {
    setAddStudentError(null);
    if (students.length >= MAX_STUDENTS_PER_CLASS) {
      alert(`Сыныптағы максималды шек — ${MAX_STUDENTS_PER_CLASS} оқушы. Сынып 100% толы, жаңа оқушы қосу мүмкін емес!`);
      return;
    }
    const gradeNum = classes.find((c) => c.id === selectedClassId)?.grade || 7;
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentRoom('201');
    setNewStudentId(`BIL-2026-${gradeNum}0${students.length + 1}`);
    setShowAddStudentModal(true);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError(null);

    if (students.length >= MAX_STUDENTS_PER_CLASS) {
      setAddStudentError(`Сыныптағы максималды шек — ${MAX_STUDENTS_PER_CLASS} оқушы. Жаңа оқушы қосу мүмкін емес!`);
      return;
    }

    const currentYearId = storage.getCurrentAcademicYear().id;
    const studentIdToUse = newStudentId.trim() || `BIL-2026-${Date.now().toString().slice(-4)}`;

    const newStudent: Student = {
      id: studentIdToUse,
      fullName: newStudentName.trim(),
      classId: selectedClassId,
      academicYearId: currentYearId,
      status: 'active',
      roomNumber: newStudentRoom.trim() || undefined,
      parentPhone: newStudentPhone.trim() || undefined,
    };

    const res = storage.saveStudent(newStudent, currentUser.id, currentUser.name);
    if (!res.success) {
      setAddStudentError(res.message || 'Қате орын алды');
      return;
    }

    reloadClassStudents();
    setShowAddStudentModal(false);
    setStudentNotice(`Оқушы «${newStudent.fullName}» сәтті тіркелді!`);
    setTimeout(() => setStudentNotice(null), 3000);
  };

  const handleDeleteStudent = (studentId: string, name: string) => {
    if (confirm(`«${name}» оқушысын осы сыныптан өшіруді растайсыз ба?`)) {
      storage.deleteStudent(studentId, currentUser.id, currentUser.name);
      reloadClassStudents();
      setStudentNotice(`Оқушы «${name}» өшірілді.`);
      setTimeout(() => setStudentNotice(null), 3000);
    }
  };

  // Filter students for search in student tab
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.roomNumber && s.roomNumber.includes(studentSearch))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Class Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Moon className="w-4 h-4" />
            <span>{t.selfStudySchedule}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Кешкі өзіндік дайындық модулі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Тәрбиешінің күнделікті 3-қадамдық тексеру және бақылау жүйесі
          </p>
        </div>

        {/* Filters: Class and Date */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterClass}</label>
            {classes.length === 0 ? (
              <span className="text-xs text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 block">
                Сынып бекітілмеген
              </span>
            ) : !isAdmin && classes.length === 1 ? (
              <div className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-50 border border-indigo-200 text-[#4338CA] flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{classes[0].name} сыныбы (Бекітілген)</span>
              </div>
            ) : (
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
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterDate}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            />
          </div>
        </div>
      </div>

      {/* Module Mode Switcher Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveEducatorTab('study_session')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeEducatorTab === 'study_session'
              ? 'border-[#075C42] text-[#075C42]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Кешкі дайындық бақылауы (19:00 - 21:00)</span>
        </button>

        <button
          onClick={() => setActiveEducatorTab('my_students')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeEducatorTab === 'my_students'
              ? 'border-[#075C42] text-[#075C42]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Сынып оқушылары</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
            students.length >= MAX_STUDENTS_PER_CLASS
              ? 'bg-rose-100 text-rose-700'
              : 'bg-[#E6F4EA] text-[#075C42]'
          }`}>
            {students.length} / {MAX_STUDENTS_PER_CLASS}
          </span>
        </button>
      </div>

      {studentNotice && (
        <div className="p-3.5 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center justify-between text-xs font-bold text-[#075C42] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#138A62]" />
            <span>{studentNotice}</span>
          </div>
          <button onClick={() => setStudentNotice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* TAB 1: STUDY SESSION MONITORING */}
      {activeEducatorTab === 'study_session' && (
        <div className="space-y-6">
          {students.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#E6F4EA] text-[#075C42] flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-extrabold text-lg text-[#24342D]">
                  Сыныпта әлі оқушылар тіркелмеген (0 / {MAX_STUDENTS_PER_CLASS})
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Кешкі өзіндік дайындық бақылауын жүргізу үшін алдымен осы сыныпқа оқушыларды тіркеңіз (әр сыныпқа максимум 26 оқушы).
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveEducatorTab('my_students');
                  handleOpenAddStudent();
                }}
                className="px-6 py-3 rounded-2xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-extrabold transition inline-flex items-center gap-2 shadow-md shadow-[#075C42]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>+ Оқушыларды тіркеуге өту</span>
              </button>
            </div>
          ) : (
            <>
              {/* Submission Success Alert */}
              {submissionSuccess && (
        <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#075C42]" />
            <div>
              <h4 className="text-sm font-bold text-[#075C42]">{t.monitoringCompletedAlert}</h4>
              <p className="text-xs text-[#075C42]/80 mt-0.5">
                Басталған уақыты: {session?.startedAt || '19:00'} | Аяқталған уақыты: {session?.completedAt || '20:48'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#138A62] text-white">
            {t.statusCompleted}
          </span>
        </div>
      )}

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          onClick={() => setCurrentStep(1)}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            currentStep === 1
              ? 'bg-[#075C42] text-white border-[#075C42] shadow-sm'
              : 'bg-white text-[#24342D] border-gray-100 hover:border-gray-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
              currentStep === 1 ? 'bg-white/20 text-[#FFE9A8]' : 'bg-[#E6F4EA] text-[#075C42]'
            }`}
          >
            1
          </div>
          <div className="truncate">
            <span className="block text-xs sm:text-sm font-bold truncate">1. Қатысу</span>
            <span className={`text-[11px] block truncate ${currentStep === 1 ? 'text-white/80' : 'text-gray-400'}`}>
              Оқушылар тізімі
            </span>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            currentStep === 2
              ? 'bg-[#075C42] text-white border-[#075C42] shadow-sm'
              : 'bg-white text-[#24342D] border-gray-100 hover:border-gray-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
              currentStep === 2 ? 'bg-white/20 text-[#FFE9A8]' : 'bg-[#E6F4EA] text-[#075C42]'
            }`}
          >
            2
          </div>
          <div className="truncate">
            <span className="block text-xs sm:text-sm font-bold truncate">2. Үй тапсырмасы</span>
            <span className={`text-[11px] block truncate ${currentStep === 2 ? 'text-white/80' : 'text-gray-400'}`}>
              Келесі күннің пәндері
            </span>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            currentStep === 3
              ? 'bg-[#075C42] text-white border-[#075C42] shadow-sm'
              : 'bg-white text-[#24342D] border-gray-100 hover:border-gray-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
              currentStep === 3 ? 'bg-white/20 text-[#FFE9A8]' : 'bg-[#E6F4EA] text-[#075C42]'
            }`}
          >
            3
          </div>
          <div className="truncate">
            <span className="block text-xs sm:text-sm font-bold truncate">3. Қорытынды</span>
            <span className={`text-[11px] block truncate ${currentStep === 3 ? 'text-white/80' : 'text-gray-400'}`}>
              Растау және тапсыру
            </span>
          </div>
        </button>
      </div>

      {/* STEP 1: ATTENDANCE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#24342D]">
                {t.step1Attendance}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Барлық оқушылардың сабақта отыруын белгілеңіз.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E6F4EA] text-[#075C42] hover:bg-[#cbe6d4] transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#138A62]" />
                <span>{t.markAllPresent}</span>
              </button>
            </div>
          </div>

          {/* Student attendance list */}
          <div className="divide-y divide-gray-100">
            {students.map((student, idx) => {
              const currentAtt = attendance[student.id] || { status: 'present', comment: '' };
              return (
                <div
                  key={student.id}
                  className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-[#F8FAF9] px-2 rounded-2xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-gray-400">{idx + 1}</span>
                    <button
                      onClick={() => setInspectedStudent(student)}
                      className="text-left hover:text-[#138A62] transition"
                    >
                      <h4 className="text-sm font-bold text-[#24342D] group-hover:text-[#075C42]">
                        {student.fullName}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {student.id} {student.roomNumber ? `• Бөлме ${student.roomNumber}` : ''}
                      </span>
                    </button>
                  </div>

                  {/* Attendance status buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {(['present', 'late', 'absent', 'excused', 'sick'] as AttendanceStatus[]).map((st) => {
                      const isSelected = currentAtt.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleAttendanceChange(student.id, st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? st === 'present'
                                ? 'bg-[#138A62] text-white shadow-xs'
                                : st === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : st === 'sick'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t.attendanceStatuses[st]}
                        </button>
                      );
                    })}

                    <input
                      type="text"
                      placeholder="Себеп / түсініктеме..."
                      value={currentAtt.comment}
                      onChange={(e) => handleAttendanceChange(student.id, currentAtt.status, e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#138A62] w-36 sm:w-44"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
            >
              <span>Келесі қадам: Үй тапсырмасын тексеру</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: HOMEWORK MONITORING */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#24342D]">
                  {t.step2Homework}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFE9A8] text-[#075C42] font-bold">
                  {targetDayInfo.dayName} ({targetDayInfo.date})
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {t.timetablesInfo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllCompleted}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E6F4EA] text-[#075C42] hover:bg-[#cbe6d4] transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#138A62]" />
                <span>{t.markAllHomeworkDone}</span>
              </button>
            </div>
          </div>

          {/* Color legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-[#F8FAF9] text-[11px] font-semibold">
            <span className="text-gray-400">Мәртебелер:</span>
            <span className="flex items-center gap-1 text-[#138A62]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#138A62]" /> Жасыл: Орындалды
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE9A8] border border-amber-400" /> Сары: Жартылай
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Қызыл: Орындалмады
            </span>
            <span className="flex items-center gap-1 text-sky-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Көк: Берілмеген
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Сұр: Тексерілмеді
            </span>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8FAF9]">
                  <th className="py-3 px-3 font-extrabold text-[#24342D] min-w-[180px]">Оқушының аты-жөні</th>
                  {targetSubjects.map((sub) => (
                    <th key={sub.id} className="py-3 px-2 font-extrabold text-center min-w-[120px]">
                      <div>{sub.nameKk}</div>
                      <button
                        onClick={() => handleMarkSubjectCompleted(sub.id)}
                        className="text-[10px] text-[#138A62] hover:underline font-semibold block mx-auto mt-0.5"
                      >
                        Барлығы орындады
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st) => {
                  const att = attendance[st.id]?.status;
                  const isPresent = att === 'present' || att === 'late';
                  return (
                    <tr key={st.id} className="hover:bg-[#F8FAF9]/80 transition">
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setInspectedStudent(st)}
                          className="font-bold text-[#24342D] hover:text-[#138A62] text-left block"
                        >
                          {st.fullName}
                        </button>
                        <span className="text-[10px] text-gray-400">
                          {t.attendanceStatuses[att] || att}
                        </span>
                      </td>

                      {targetSubjects.map((sub) => {
                        const status = homework[st.id]?.[sub.id] || 'not_checked';
                        const cfg = hwStatusConfig[status];
                        return (
                          <td key={sub.id} className="py-3 px-2 text-center">
                            <select
                              value={status}
                              onChange={(e) =>
                                handleHomeworkChange(st.id, sub.id, e.target.value as HomeworkStatus)
                              }
                              className={`text-[11px] font-bold px-2 py-1.5 rounded-xl border focus:outline-none transition cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              <option value="completed" className="bg-white text-gray-900">Толық орындалды (Жасыл)</option>
                              <option value="partially_completed" className="bg-white text-gray-900">Жартылай (Сары)</option>
                              <option value="not_completed" className="bg-white text-gray-900">Орындалмады (Қызыл)</option>
                              <option value="no_homework" className="bg-white text-gray-900">Тапсырма жоқ (Көк)</option>
                              <option value="not_checked" className="bg-white text-gray-900">Тексерілмеді (Сұр)</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              1-қадамға оралу
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
            >
              <span>Келесі қадам: Қорытынды растау</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUBMISSION & CONFIRMATION */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="font-extrabold text-base sm:text-lg text-[#24342D]">
              {t.step3Submission}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Мониторинг нәтижесін тексеріп, жүйеге біржолата бекітіңіз.
            </p>
          </div>

          {/* Status summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/20">
              <span className="text-[11px] font-bold text-[#075C42] block">Қатысу есебі</span>
              <div className="text-2xl font-extrabold text-[#075C42] mt-1">
                {Object.values(attendance).filter((a) => a.status === 'present').length} / {students.length}
              </div>
              <span className="text-xs text-[#075C42]/80 mt-1 block">
                {Object.values(attendance).filter((a) => a.status === 'absent').length} жоқ,{' '}
                {Object.values(attendance).filter((a) => a.status === 'sick').length} ауырды
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8]">
              <span className="text-[11px] font-bold text-amber-900 block">Үй тапсырмасы</span>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">
                {targetSubjects.length} пән
              </div>
              <span className="text-xs text-amber-800/80 mt-1 block">
                Келесі күнге: {targetDayInfo.dayName} ({targetDayInfo.date})
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] font-bold text-blue-900 block">Мониторинг уақыты</span>
              <div className="text-2xl font-extrabold text-blue-900 mt-1">
                {session?.startedAt || '19:00'} — {session?.completedAt || 'Жүруде'}
              </div>
              <span className="text-xs text-blue-700/80 mt-1 block">
                Тәрбиеші: {currentUser.name}
              </span>
            </div>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>{t.notCompletedWarning}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-rose-700">
                {validationErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {validationErrors.length > 5 && (
                  <li>Және тағы {validationErrors.length - 5} оқушы...</li>
                )}
              </ul>
            </div>
          )}

          {/* Final Action Button */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              2-қадамға оралу
            </button>

            <button
              onClick={handleInitiateSubmission}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#075C42] to-[#138A62] text-white font-extrabold text-sm hover:from-[#054531] hover:to-[#0f7150] shadow-md shadow-[#075C42]/20 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#FFE9A8]" />
              <span>{t.completeMonitoringBtn}</span>
            </button>
          </div>
        </div>
      )}
      </>
    )}
  </div>
)}

      {/* TAB 2: MY CLASS STUDENTS MANAGEMENT WITH 26-STUDENT LIMIT */}
      {activeEducatorTab === 'my_students' && (
        <div className="space-y-6">
          {/* Capacity and Class Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#138A62] uppercase tracking-wider">
                  Тәрбиеленушілер құрамы • {classes.find((c) => c.id === selectedClassId)?.name || 'Сынып'}
                </span>
                <h3 className="text-xl font-extrabold text-[#24342D] mt-1">
                  Сынып оқушыларын басқару және тіркеу
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Бекітілген сынып бойынша оқушыларды қабылдау. Сыныптағы ең жоғарғы сыйымдылық шегі — <span className="font-bold text-[#075C42]">{MAX_STUDENTS_PER_CLASS} оқушы</span>.
                </p>
              </div>

              <button
                onClick={handleOpenAddStudent}
                disabled={students.length >= MAX_STUDENTS_PER_CLASS}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm ${
                  students.length >= MAX_STUDENTS_PER_CLASS
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#075C42] text-white hover:bg-[#054531]'
                }`}
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>Жаңа оқушы қосу</span>
              </button>
            </div>

            {/* Capacity Progress Bar & Metrics */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-gray-600">Сыныптың толу деңгейі:</span>
                  <span className={`font-extrabold ${
                    students.length >= MAX_STUDENTS_PER_CLASS
                      ? 'text-rose-600'
                      : students.length >= 24
                      ? 'text-amber-600'
                      : 'text-[#138A62]'
                  }`}>
                    {students.length} / {MAX_STUDENTS_PER_CLASS} оқушы ({Math.round((students.length / MAX_STUDENTS_PER_CLASS) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      students.length >= MAX_STUDENTS_PER_CLASS
                        ? 'bg-rose-500'
                        : students.length >= 24
                        ? 'bg-amber-400'
                        : 'bg-[#138A62]'
                    }`}
                    style={{ width: `${Math.min(100, (students.length / MAX_STUDENTS_PER_CLASS) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 block">Бос орындар</span>
                <span className="text-xl font-extrabold text-[#24342D]">
                  {Math.max(0, MAX_STUDENTS_PER_CLASS - students.length)} орын
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/20">
                <span className="text-[11px] font-bold text-[#075C42] block">Бекітілген тәрбиеші</span>
                <span className="text-xs font-bold text-[#075C42] truncate block mt-1">
                  {currentUser.name}
                </span>
              </div>
            </div>

            {/* Strict capacity notice if class is full */}
            {students.length >= MAX_STUDENTS_PER_CLASS && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 font-bold">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  Сынып максималды {MAX_STUDENTS_PER_CLASS} оқушы шегіне жетті (100% толық). Жаңа оқушы қосу бұғатталған. Басқа оқушы қосу үшін бұрынғы оқушыны өшіру немесе ауыстыру қажет.
                </span>
              </div>
            )}
          </div>

          {/* Search & Student List */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Оқушы аты-жөні, коды немесе бөлмесі..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>

              <span className="text-xs font-bold text-gray-500">
                Көрсетілуде: {filteredStudents.length} / {students.length} оқушы
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#F8FAF9]">
                    <th className="py-3 px-3 font-extrabold text-[#24342D] w-12 text-center">№</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D]">Оқушының аты-жөні</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D]">Жүйелік ID / Код</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D]">Жатақхана бөлмесі</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D]">Ата-ана телефоны</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Күйі</th>
                    <th className="py-3 px-3 font-extrabold text-[#24342D] text-right">Әрекет</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#075C42] flex items-center justify-center mx-auto">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-[#24342D]">
                              {studentSearch ? 'Іздеу бойынша оқушы табылмады' : `Бұл сыныпта әлі оқушылар тіркелмеген (0 / ${MAX_STUDENTS_PER_CLASS})`}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {studentSearch ? 'Басқа сөз немесе бөлме нөмірімен іздеп көріңіз' : 'Төмендегі батырмамен сыныбыңызға оқушыларды тіркеңіз'}
                            </p>
                          </div>
                          {!studentSearch && (
                            <button
                              onClick={handleOpenAddStudent}
                              className="px-4 py-2 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#FFE9A8]" />
                              <span>Жаңа оқушы қосу</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-[#F8FAF9] transition">
                        <td className="py-3.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => setInspectedStudent(st)}
                            className="font-extrabold text-[#24342D] hover:text-[#138A62] text-left transition"
                          >
                            {st.fullName}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-gray-500">{st.id}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-gray-100 font-bold text-[#24342D]">
                            № {st.roomNumber || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 font-mono text-[11px]">
                          {st.parentPhone || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E6F4EA] text-[#075C42]">
                            Белсенді
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedStudent(st)}
                              className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition"
                              title="Оқушы карточкасы және үлгерімі"
                            >
                              Карточка
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st.id, st.fullName)}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Сыныптан өшіру"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddStudentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#075C42]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#24342D]">
                        Жаңа оқушы тіркеу
                      </h3>
                      <p className="text-xs text-gray-500">
                        {classes.find((c) => c.id === selectedClassId)?.name} сыныбына оқушы қосу
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddStudentModal(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddStudentSubmit} className="mt-4 space-y-4">
                  {addStudentError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{addStudentError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Оқушының аты-жөні <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Мысалы: Бекетов Дамир Қайратұлы"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Жүйелік ID / Код
                      </label>
                      <input
                        type="text"
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Жатақхана бөлмесі
                      </label>
                      <input
                        type="text"
                        placeholder="Мысалы: 204"
                        value={newStudentRoom}
                        onChange={(e) => setNewStudentRoom(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ата-ана телефоны
                    </label>
                    <input
                      type="tel"
                      placeholder="+7 (701) 000-00-00"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8] text-[11px] text-amber-900">
                    <span className="font-bold">Ескерту:</span> Сынып шегі 26 оқушы. Қазір бұл сыныпта {students.length} оқушы тіркелген.
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Болдырмау
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-extrabold hover:bg-[#054531] shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-[#FFE9A8]" />
                      <span>Сақтау және тіркеу</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#075C42]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#24342D]">
                  Мониторингті бекіту
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedDate} күнгі нәтижелер ресми журналға тіркеледі
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 space-y-2">
              <p>Сіз мына деректерді растағалы жатырсыз:</p>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 font-semibold text-[#24342D]">
                <div>Сынып: {classes.find((c) => c.id === selectedClassId)?.name}</div>
                <div>Оқушы саны: {students.length}</div>
                <div>Келесі күннің пәндері: {targetSubjects.map((s) => s.nameKk).join(', ')}</div>
                <div>Уақыты: {new Date().toLocaleTimeString()}</div>
              </div>
              <p className="text-[11px] text-gray-400">
                Бекітуден кейін бұл әрекет әкімшілік аудит журналында сақталады.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Болдырмау
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
              >
                Иә, мониторингті аяқтау
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drill-down Modal */}
      {inspectedStudent && (
        <StudentModal
          student={inspectedStudent}
          onClose={() => setInspectedStudent(null)}
          onUpdate={() => {
            setStudents(storage.getStudents().filter((s) => s.classId === selectedClassId));
          }}
        />
      )}
    </div>
  );
};
