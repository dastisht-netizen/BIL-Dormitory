import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Upload,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  GraduationCap
} from 'lucide-react';
import { SchoolClass, Student } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StudentModal } from './StudentModal';
import { exportToExcel } from '../../utils/exportUtils';

export const StudentManager: React.FC = () => {
  const { currentUser, isAdmin, isEducator, isClassTeacher } = useAuth();
  const { t } = useLanguage();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Filter classes according to role (Class Isolation)
  const allowedClasses = React.useMemo(() => {
    if (isAdmin) return classes;
    return classes.filter(
      (c) =>
        currentUser.assignedClassIds?.includes(c.id) ||
        (isEducator && c.educatorId === currentUser.id) ||
        (isClassTeacher && c.classTeacherId === currentUser.id)
    );
  }, [classes, currentUser, isAdmin, isEducator, isClassTeacher]);

  // New Student Form state
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newClassId, setNewClassId] = useState('cls-7a');
  const [newRoom, setNewRoom] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadData = () => {
    setStudents(storage.getStudents());
    setClasses(storage.getClasses());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Default selectedClassId to first allowed class for staff
  useEffect(() => {
    if (!isAdmin && allowedClasses.length > 0) {
      if (selectedClassId === 'all' || !allowedClasses.some((c) => c.id === selectedClassId)) {
        setSelectedClassId(allowedClasses[0].id);
        setNewClassId(allowedClasses[0].id);
      }
    }
  }, [allowedClasses, isAdmin, selectedClassId]);

  const [addError, setAddError] = useState<string | null>(null);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const idToUse = newId.trim() || `BIL-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent: Student = {
      id: idToUse,
      fullName: newName.trim(),
      classId: newClassId,
      academicYearId: storage.getCurrentAcademicYear().id,
      status: 'active',
      roomNumber: newRoom.trim() || undefined,
      parentPhone: newPhone.trim() || undefined,
    };

    const res = storage.saveStudent(newStudent, currentUser.id, currentUser.name);
    if (!res.success) {
      setAddError(res.message || 'Сыныпқа оқушы қосу мүмкін емес!');
      return;
    }

    loadData();
    setShowAddModal(false);
    setNewId('');
    setNewName('');
    setNewRoom('');
    setNewPhone('');
    setNotice(`Оқушы ${newStudent.fullName} сәтті қосылды!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`«${name}» оқушысын жүйеден өшіруді растайсыз ба?`)) {
      storage.deleteStudent(id, currentUser.id, currentUser.name);
      loadData();
      setNotice(`Оқушы ${name} өшірілді.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Excel bulk text import
  const handleBulkImport = () => {
    const lines = importText.split('\n').filter((l) => l.trim().length > 0);
    const imported: Student[] = [];
    const currentYearId = storage.getCurrentAcademicYear().id;

    lines.forEach((line) => {
      // format: ID, Full Name, ClassName, Room, Phone
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const id = parts[0] || `BIL-2026-${Math.floor(100 + Math.random() * 900)}`;
        const fullName = parts[1];
        const className = parts[2] || '7A';
        const room = parts[3] || '201';
        const phone = parts[4] || '';

        const matchedClass = classes.find((c) => c.name.toLowerCase() === className.toLowerCase()) || classes[0];

        imported.push({
          id,
          fullName,
          classId: matchedClass.id,
          academicYearId: currentYearId,
          status: 'active',
          roomNumber: room,
          parentPhone: phone,
        });
      }
    });

    if (imported.length > 0) {
      storage.importStudents(imported, currentUser.id, currentUser.name);
      loadData();
      setShowImportModal(false);
      setImportText('');
      setNotice(`${imported.length} оқушы сәтті импортталды!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      return {
        'Оқушы ID': st.id,
        'Аты-жөні': st.fullName,
        'Сынып': cls?.name || '',
        'Күйі': st.status,
        'Бөлме №': st.roomNumber || '',
        'Ата-ана байланысы': st.parentPhone || '',
      };
    });

    exportToExcel(
      [{ sheetName: 'Students_List', data }],
      'Arys_BIL_Students_Registry'
    );
  };

  const filteredStudents = students
    .filter((st) => {
      if (isAdmin) {
        return selectedClassId === 'all' || st.classId === selectedClassId;
      }
      // Strict role isolation: educators and teachers only see students belonging to their assigned classes
      const isAllowed = allowedClasses.some((c) => c.id === st.classId);
      if (!isAllowed) return false;
      return selectedClassId === 'all' || st.classId === selectedClassId;
    })
    .filter((st) => statusFilter === 'all' || st.status === statusFilter)
    .filter((st) =>
      st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.roomNumber && st.roomNumber.includes(searchQuery))
    );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Users className="w-4 h-4" />
            <span>Оқушылар контингенті</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Оқушыларды басқару жүйесі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Бірегей ID, жеке карточкалар, сынып шегі (максимум 26 оқушы)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-[#E6F4EA] text-[#075C42] text-xs font-bold hover:bg-[#cdecd8] transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-[#138A62]" />
              <span>Импорт</span>
            </button>
          )}

          <button
            onClick={() => {
              setAddError(null);
              if (selectedClassId !== 'all') {
                setNewClassId(selectedClassId);
              } else if (allowedClasses.length > 0) {
                setNewClassId(allowedClasses[0].id);
              }
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFE9A8]" />
            <span>Жаңа оқушы қосу</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center gap-2 text-xs font-bold text-[#075C42] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-[#F8FAF9] focus:outline-none focus:ring-2 focus:ring-[#138A62]"
            >
              {isAdmin && <option value="all">Барлық сыныптар</option>}
              {allowedClasses.map((c) => {
                const count = storage.getClassStudentCount(c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} сыныбы ({count} / 26)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-[#F8FAF9] focus:outline-none focus:ring-2 focus:ring-[#138A62]"
            >
              <option value="all">Барлық мәртебелер</option>
              <option value="active">Оқып жатқандар (Active)</option>
              <option value="graduated">Түлектер (Graduated)</option>
              <option value="transferred">Ауысқандар (Transferred)</option>
            </select>
          </div>
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

      {/* Student Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8FAF9]">
              <th className="py-3 px-3 font-extrabold text-[#24342D]">ID</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D]">Оқушының аты-жөні</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Сынып</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D] text-center">Бөлме №</th>
              <th className="py-3 px-3 font-extrabold text-[#24342D]">Ата-ана байланысы</th>
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
                        {searchQuery ? 'Іздеу бойынша оқушы табылмады' : 'Әзірге оқушылар тіркелмеген (0 / 26)'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {searchQuery
                          ? 'Басқа сөз немесе бөлме нөмірімен іздеп көріңіз'
                          : 'Сыныбыңызға оқушыларды тіркеу үшін төмендегі батырманы басыңыз (әр сыныпқа максимум 26 оқушы)'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <button
                        onClick={() => {
                          setAddError(null);
                          if (selectedClassId !== 'all') {
                            setNewClassId(selectedClassId);
                          } else if (allowedClasses.length > 0) {
                            setNewClassId(allowedClasses[0].id);
                          }
                          setShowAddModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FFE9A8]" />
                        <span>Жаңа оқушы тіркеу</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => {
                const cls = classes.find((c) => c.id === st.classId);
                const canManageStudent = isAdmin || allowedClasses.some((c) => c.id === st.classId);
                return (
                  <tr key={st.id} className="hover:bg-[#F8FAF9]/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-gray-500">{st.id}</td>
                    <td className="py-3 px-3 font-bold text-[#24342D]">
                      <button
                        onClick={() => setInspectedStudent(st)}
                        className="text-left hover:text-[#138A62] transition"
                      >
                        {st.fullName}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-700">{cls?.name}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-600">{st.roomNumber || '—'}</td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-[11px]">{st.parentPhone || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          st.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.status === 'graduated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {st.status === 'active' ? 'Оқуда' : st.status === 'graduated' ? 'Түлек' : 'Ауысқан'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedStudent(st)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                        >
                          Профиль
                        </button>
                        {canManageStudent && (
                          <button
                            onClick={() => handleDelete(st.id, st.fullName)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                            title="Өшіру"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              Жаңа оқушыны тіркеу
            </h3>

            <form onSubmit={handleAddStudent} className="mt-4 space-y-3.5">
              {addError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Оқушының аты-жөні</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Мысалы, Ернұр Сәрсенбайұлы"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Сыныбы</label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  >
                    {allowedClasses.map((c) => {
                      const count = storage.getClassStudentCount(c.id);
                      return (
                        <option key={c.id} value={c.id} disabled={count >= 26}>
                          {c.name} сыныбы ({count} / 26 оқушы){count >= 26 ? ' — ТОЛЫ' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Бөлме №</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="201"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFF8E7] border border-[#FFE9A8] text-[11px] text-amber-900 font-medium">
                <span className="font-bold">Шектеу:</span> Сынып шегі 26 оқушы. Таңдалған сыныпта қазір: {storage.getClassStudentCount(newClassId)} / 26 оқушы.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Оқушы ID (Қосымша, бос болса автоматты беріледі)</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="BIL-2026-799"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ата-ана байланыс телефоны</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+7 701 000 0000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
                >
                  Сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              Оқушыларды Excel немесе мәтіннен жаппай импорттау
            </h3>

            <p className="text-xs text-gray-500 mt-2">
              Әр жолға: <code>ID, Аты-жөні, Сынып, Бөлме, Телефон</code> пішімінде жазыңыз:
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="BIL-2026-750, Марат Асқарұлы, 7A, 201, +7 701 555 1234&#10;BIL-2026-751, Әділ Нұрланұлы, 7A, 201, +7 702 444 5678"
              className="mt-3 w-full p-3 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
            />

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Болдырмау
              </button>
              <button
                onClick={handleBulkImport}
                className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
              >
                Импорттау
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {inspectedStudent && (
        <StudentModal
          student={inspectedStudent}
          onClose={() => setInspectedStudent(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};
