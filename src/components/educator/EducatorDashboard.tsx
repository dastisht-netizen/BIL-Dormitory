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
  User as UserIcon
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
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StudentModal } from '../students/StudentModal';

export const EducatorDashboard: React.FC = () => {
  const { currentUser, isAdmin, canAccessClass } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
