import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  Calendar,
  UtensilsCrossed,
  Building2,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { NotificationSettings, Role, SchoolClass, Subject, User } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminDashboard: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => storage.getSettings());

  // Form states
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(7);
  const [selectedEducatorId, setSelectedEducatorId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('EDUCATOR');

  const [notice, setNotice] = useState<string | null>(null);

  const loadData = () => {
    setClasses(storage.getClasses());
    setUsers(storage.getUsers());
    setSubjects(storage.getSubjects());
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: SchoolClass = {
      id: `cls-${newClassName.toLowerCase()}`,
      name: newClassName.trim().toUpperCase(),
      grade: Number(newClassGrade),
      academicYearId: storage.getCurrentAcademicYear().id,
      educatorId: selectedEducatorId || undefined,
      classTeacherId: selectedTeacherId || undefined,
    };

    storage.saveClass(newClass, currentUser.id, currentUser.name);
    loadData();
    setShowClassModal(false);
    setNewClassName('');
    setNotice(`Сынып ${newClass.name} сәтті сақталды!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    };

    storage.saveUser(newUser, currentUser.id, currentUser.name);
    loadData();
    setShowUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNotice(`Қолданушы ${newUser.name} қосылды!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`«${name}» қолданушысын жүйеден өшіруді растайсыз ба?`)) {
      storage.deleteUser(userId, currentUser.id, currentUser.name);
      loadData();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings, currentUser);
    setNotice('Хабарлама және уақыт баптаулары сәтті сақталды!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleExportBackup = () => {
    const json = storage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arys_BIL_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Барлық деректерді тазартып, бастапқы демонстрациялық қалпына келтіруді растайсыз ба?')) {
      storage.resetToSample();
      loadData();
      setNotice('Жүйе деректері бастапқы демонстрациялық қалпына келтірілді!');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const students = storage.getStudents();
  const educators = users.filter((u) => u.role === 'EDUCATOR');
  const teachers = users.filter((u) => u.role === 'CLASS_TEACHER');

  return (
    <div className="space-y-6">
      {/* Overview Top Stats */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Shield className="w-4 h-4" />
            <span>Әкімшілік бақылау орталығы</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            ARYS BIL STUDY TRACKER Басқару Панелі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Оқушылар, тәрбиешілер, сынып жетекшілері, асхана мен кестені басқару
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('self_study')}
            className="px-4 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#FFE9A8]" />
            <span>Кешкі дайындыққа өту</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center gap-2 text-xs font-bold text-[#075C42] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Quick Access KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('students')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-[#138A62] transition shadow-xs text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#075C42] mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 block">Оқушылар</span>
          <div className="text-2xl font-black text-[#075C42] mt-1">{students.length}</div>
        </button>

        <button
          onClick={() => onNavigate('educator_performance')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-[#138A62] transition shadow-xs text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 block">Тәрбиешілер</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{educators.length}</div>
        </button>

        <button
          onClick={() => onNavigate('classes')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-[#138A62] transition shadow-xs text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 block">Сыныптар</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{classes.length}</div>
        </button>

        <button
          onClick={() => onNavigate('meals')}
          className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-[#138A62] transition shadow-xs text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 mb-3">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 block">Асхана кезеңдері</span>
          <div className="text-2xl font-black text-purple-700 mt-1">8 мезгіл</div>
        </button>
      </div>

      {/* Classes & Assignments Management */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-[#24342D]">
              Сыныптар мен бекітілген тәрбиешілер
            </h3>
            <p className="text-xs text-gray-400">
              Әр сыныпқа жауапты тәрбиеші мен сынып жетекшісін тағайындау
            </p>
          </div>
          <button
            onClick={() => setShowClassModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFE9A8]" />
            <span>Сынып қосу</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map((cls) => {
            const edu = users.find((u) => u.id === cls.educatorId);
            const teacher = users.find((u) => u.id === cls.classTeacherId);
            const count = students.filter((s) => s.classId === cls.id).length;

            return (
              <div key={cls.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-[#075C42]">{cls.name} сыныбы</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-gray-700 font-bold border border-gray-200">
                    {count} оқушы
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="text-gray-400 block text-[10px]">Тәрбиеші:</span>
                  <span className="font-bold text-[#24342D]">{edu ? edu.name : '— Тағайындалмаған'}</span>
                </div>
                <div className="text-gray-600">
                  <span className="text-gray-400 block text-[10px]">Сынып жетекшісі:</span>
                  <span className="font-bold text-[#24342D]">{teacher ? teacher.name : '— Тағайындалмаған'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff & User Management */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-[#24342D]">
              Қызметкерлер мен пайдаланушылар
            </h3>
            <p className="text-xs text-gray-400">
              Әкімшілер, тәрбиешілер, сынып жетекшілері мен асхана қызметкерлері
            </p>
          </div>
          <button
            onClick={() => setShowUserModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFE9A8]" />
            <span>Қызметкер қосу</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#24342D] block">{u.name}</span>
                <span className="text-gray-400 text-[11px]">{u.email} {u.phone ? `• ${u.phone}` : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-bold">
                  {t.roles[u.role] || u.role}
                </span>
                {u.id !== currentUser.id && (
                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Schedule Configuration & Backup Settings */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="font-extrabold text-base text-[#24342D]">
            Жүйелік ескертулер мен уақыт баптаулары (Push Reminders)
          </h3>
          <p className="text-xs text-gray-400">
            Кешкі дайындық (19:00, 19:30, 21:00) және бейсенбілік асхана ескертулері
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#24342D] block">1. Дайындықтың басталуы</span>
                <span className="text-gray-400 text-[11px]">Тәрбиешілерге қатысуды белгілеу ескертуі</span>
              </div>
              <input
                type="time"
                value={settings.selfStudyStartTime}
                onChange={(e) => setSettings({ ...settings, selfStudyStartTime: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-mono font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#24342D] block">2. Аралық ескерту (19:30)</span>
                <span className="text-gray-400 text-[11px]">Үй тапсырмасын тексеру ескертуі</span>
              </div>
              <input
                type="time"
                value={settings.selfStudyMidTime}
                onChange={(e) => setSettings({ ...settings, selfStudyMidTime: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-mono font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#24342D] block">3. Мониторингті аяқтау (21:00)</span>
                <span className="text-gray-400 text-[11px]">Күндізгі нәтижені бекіту соңғы мерзімі</span>
              </div>
              <input
                type="time"
                value={settings.selfStudyEndTime}
                onChange={(e) => setSettings({ ...settings, selfStudyEndTime: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-mono font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#24342D] block">4. Бейсенбі: Асхана ескертуі</span>
                <span className="text-gray-400 text-[11px]">Сенбі-жексенбі тізімін растау мерзімі</span>
              </div>
              <input
                type="time"
                value={settings.thursdayMealTime}
                onChange={(e) => setSettings({ ...settings, thursdayMealTime: e.target.value })}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FFE9A8]" />
              <span>Баптауларды сақтау</span>
            </button>
          </div>
        </form>

        {/* Database Backup & Demo Reset */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Деректер қорын жүктеу (Backup .json)</span>
            </button>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Бастапқы демо қалпына келтіру</span>
          </button>
        </div>
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              Жаңа сынып қосу
            </h3>
            <form onSubmit={handleSaveClass} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Сынып атауы (Мысалы, 9B)</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Параллель (Жасы)</label>
                <input
                  type="number"
                  min={7}
                  max={11}
                  required
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Бекітілген тәрбиеші</label>
                <select
                  value={selectedEducatorId}
                  onChange={(e) => setSelectedEducatorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                >
                  <option value="">— Тәрбиешіні таңдау —</option>
                  {educators.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Сынып жетекшісі</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                >
                  <option value="">— Сынып жетекшісін таңдау —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
                >
                  Қосу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              Қызметкерді жүйеге тіркеу
            </h3>
            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Аты-жөні</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Мысалы, Серік Болатұлы"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email / Логин</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="serik.b@bil-arys.edu.kz"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Рөлі</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                >
                  <option value="EDUCATOR">Тәрбиеші (Educator)</option>
                  <option value="CLASS_TEACHER">Сынып жетекшісі (Class Teacher)</option>
                  <option value="CAFETERIA_STAFF">Асхана қызметкері (Cafeteria)</option>
                  <option value="ADMINISTRATOR">Әкімші (Administrator)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
                >
                  Қосу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
