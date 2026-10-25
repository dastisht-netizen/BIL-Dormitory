import React, { useState } from 'react';
import { X, User, Phone, Home, Calendar, CheckCircle2, XCircle, AlertCircle, Clock, Utensils, BookOpen } from 'lucide-react';
import { Student, AttendanceRecord, HomeworkRecord, WeekendMealRecord, DormitoryStayRecord, ALL_MEAL_PERIODS } from '../../types';
import { storage } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface StudentModalProps {
  student: Student;
  onClose: () => void;
  onUpdate?: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, onClose, onUpdate }) => {
  const { t, getMealName } = useLanguage();
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'homework' | 'dormitory' | 'meals'>('info');

  const [fullName, setFullName] = useState(student.fullName);
  const [roomNumber, setRoomNumber] = useState(student.roomNumber || '');
  const [parentPhone, setParentPhone] = useState(student.parentPhone || '');
  const [notes, setNotes] = useState(student.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Retrieve records for this student
  const attendanceRecords = storage.getAttendanceRecords().filter((r) => r.studentId === student.id);
  const homeworkRecords = storage.getHomeworkRecords().filter((r) => r.studentId === student.id);
  const mealRecords = storage.getWeekendMeals().filter((r) => r.studentId === student.id);
  const dormRecords = storage.getDormitoryStays().filter((r) => r.studentId === student.id);
  const classes = storage.getClasses();
  const currentClass = classes.find((c) => c.id === student.classId);
  const subjects = storage.getSubjects();

  // Compute metrics
  const totalAtt = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  const validHw = homeworkRecords.filter((h) => h.status !== 'no_homework');
  const completedHw = validHw.filter((h) => h.status === 'completed').length;
  const hwRate = validHw.length > 0 ? Math.round((completedHw / validHw.length) * 100) : 100;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...student,
      fullName,
      roomNumber,
      parentPhone,
      notes,
    };
    storage.saveStudent(updated, currentUser.id, currentUser.name);
    setSavedSuccess(true);
    if (onUpdate) onUpdate();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#075C42] to-[#138A62] text-white flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg text-[#FFE9A8]">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">{student.fullName}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFE9A8] text-[#075C42] font-bold">
                  {currentClass?.name || '7A'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5 font-mono">
                ID: {student.id} | Бөлме: {student.roomNumber || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8FAF9] border-b border-gray-100 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px]">Қатысу пайызы</span>
            <span className="text-base font-extrabold text-[#075C42]">{attRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px]">Үй тапсырмасы</span>
            <span className="text-base font-extrabold text-[#138A62]">{hwRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px]">Жатақхана күндері</span>
            <span className="text-base font-extrabold text-blue-700">{dormRecords.filter((d) => d.isStaying).length} апта</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px]">Күйі</span>
            <span className="text-base font-bold text-emerald-700 capitalize">{student.status}</span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-100 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'info' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Ақпарат пен профиль
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'attendance' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Қатысу тарихы ({attendanceRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'homework' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Үй тапсырмасы ({homeworkRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('dormitory')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'dormitory' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Жатақхана
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'meals' ? 'border-[#075C42] text-[#075C42]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Тамақтану
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Оқушының аты-жөні</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Оқушы ID (Өзгермейді)</label>
                  <input
                    type="text"
                    disabled
                    value={student.id}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-mono"
                  />
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
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ескертпелер / Мәліметтер</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  placeholder="Оқушының ерекшеліктері, жетістіктері немесе тәрбиеші жазбасы..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-xs text-[#075C42] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Өзгерістер сәтті сақталды!
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {attendanceRecords.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">Қатысу жазбалары табылмады</p>
              ) : (
                attendanceRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="font-bold text-[#24342D] block">{r.date}</span>
                        {r.comment && <span className="text-gray-500 text-[11px]">{r.comment}</span>}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
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
                ))
              )}
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="space-y-2.5">
              {homeworkRecords.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">Үй тапсырмасы жазбалары табылмады</p>
              ) : (
                homeworkRecords.map((h) => {
                  const sub = subjects.find((s) => s.id === h.subjectId);
                  return (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <div>
                        <span className="font-bold text-[#24342D]">{sub?.nameKk || 'Пән'}</span>
                        <span className="text-gray-400 block text-[10px] mt-0.5">Күні: {h.date} (Келесі күнге: {h.targetDate})</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
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
                })
              )}
            </div>
          )}

          {activeTab === 'dormitory' && (
            <div className="space-y-3">
              {dormRecords.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">Жатақхана жазбалары табылмады</p>
              ) : (
                dormRecords.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#24342D]">Апта: {d.weekStartDate}</span>
                      {d.notes && <p className="text-gray-500 text-[11px] mt-0.5">{d.notes}</p>}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
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

          {activeTab === 'meals' && (
            <div className="space-y-4">
              {mealRecords.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">Тамақтану жазбалары табылмады</p>
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
      </div>
    </div>
  );
};
