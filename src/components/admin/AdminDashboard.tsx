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
  GraduationCap,
  Globe,
  Sliders,
  Key,
  Edit3,
  Megaphone,
  Palette,
  Phone,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';
import { NotificationSettings, Role, SchoolClass, Subject, User, SiteConfig } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminDashboard: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { currentUser, siteConfig, updateSiteConfig, updateCurrentUserProfile } = useAuth();
  const { t } = useLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'site_settings' | 'subjects' | 'classes' | 'staff' | 'reminders' | 'profile' | 'backup'>('overview');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => storage.getSettings());
  const [notice, setNotice] = useState<string | null>(null);

  // Site Config Form State
  const [siteForm, setSiteForm] = useState<SiteConfig>(siteConfig);

  // Subject Form State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subNameKk, setSubNameKk] = useState('');
  const [subNameRu, setSubNameRu] = useState('');
  const [subNameEn, setSubNameEn] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subColor, setSubColor] = useState('#138A62');

  // Class Form State
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(7);
  const [selectedEducatorId, setSelectedEducatorId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // User Form State
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('EDUCATOR');

  // Admin Profile state
  const [adminName, setAdminName] = useState(currentUser.name);
  const [adminEmail, setAdminEmail] = useState(currentUser.email);
  const [adminPhone, setAdminPhone] = useState(currentUser.phone || '');
  const [adminPassword, setAdminPassword] = useState(currentUser.password || 'admin123');

  const loadData = () => {
    setClasses(storage.getClasses());
    setUsers(storage.getUsers());
    setSubjects(storage.getSubjects());
    setSettings(storage.getSettings());
    setSiteForm(storage.getSiteConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSiteForm(siteConfig);
  }, [siteConfig]);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // 1. Save Site Configuration
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(siteForm);
    showNotification('Сайт және мектеп баптаулары сәтті сақталды!');
  };

  // 2. Subject Handlers
  const handleOpenSubjectModal = (sub?: Subject) => {
    if (sub) {
      setEditingSubject(sub);
      setSubNameKk(sub.nameKk);
      setSubNameRu(sub.nameRu);
      setSubNameEn(sub.nameEn);
      setSubCode(sub.code);
      setSubColor(sub.color || '#138A62');
    } else {
      setEditingSubject(null);
      setSubNameKk('');
      setSubNameRu('');
      setSubNameEn('');
      setSubCode('');
      setSubColor('#138A62');
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const subject: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      nameKk: subNameKk.trim(),
      nameRu: subNameRu.trim() || subNameKk.trim(),
      nameEn: subNameEn.trim() || subNameKk.trim(),
      code: subCode.trim().toUpperCase(),
      color: subColor,
    };
    storage.saveSubject(subject, currentUser.id, currentUser.name);
    loadData();
    setShowSubjectModal(false);
    showNotification(`Пән «${subject.nameKk}» сәтті сақталды!`);
  };

  const handleDeleteSubject = (subId: string, name: string) => {
    if (confirm(`«${name}» пәнін жүйеден өшіруді растайсыз ба?`)) {
      storage.deleteSubject(subId, currentUser.id, currentUser.name);
      loadData();
      showNotification(`Пән өшірілді.`);
    }
  };

  // 3. Class Handlers
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
    showNotification(`Сынып ${newClass.name} сәтті сақталды!`);
  };

  // 4. User Handlers
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || 'bil123',
      phone: newUserPhone.trim() || undefined,
      role: newUserRole,
    };

    storage.saveUser(newUser, currentUser.id, currentUser.name);
    loadData();
    setShowUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserPhone('');
    showNotification(`Қолданушы ${newUser.name} тіркелді! Құпиясөз: ${newUser.password}`);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`«${name}» қолданушысын жүйеден өшіруді растайсыз ба?`)) {
      storage.deleteUser(userId, currentUser.id, currentUser.name);
      loadData();
      showNotification(`Қолданушы өшірілді.`);
    }
  };

  // 5. Admin Profile Update
  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: adminName.trim(),
      email: adminEmail.trim(),
      phone: adminPhone.trim(),
      password: adminPassword.trim(),
    });
    showNotification('Әкімші профилі мен құпиясөзі сәтті жаңартылды!');
  };

  // 6. Push Reminders Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings, currentUser);
    showNotification('Хабарлама және уақыт баптаулары сәтті сақталды!');
  };

  // 7. Backup & Restore Handlers
  const handleExportBackup = () => {
    const json = storage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arys_BIL_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && storage.importBackup(content)) {
        loadData();
        showNotification('Резервтік көшірмеден деректер сәтті қалпына келтірілді!');
      } else {
        alert('Резервтік көшірме файлын оқу мүмкін болмады.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Барлық деректерді тазартып, бастапқы демонстрациялық қалпына келтіруді растайсыз ба?')) {
      storage.resetToSample();
      loadData();
      showNotification('Жүйе деректері бастапқы демонстрациялық қалпына келтірілді!');
    }
  };

  const students = storage.getStudents();
  const educators = users.filter((u) => u.role === 'EDUCATOR');
  const teachers = users.filter((u) => u.role === 'CLASS_TEACHER');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Shield className="w-4 h-4" />
            <span>Әкімшілік басқару орталығы (Admin Control Suite)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            {siteConfig.schoolName} — Басқару Панелі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Мектеп атауын, сайт баптауларын, сабақ кестесін, мұғалімдерді және барлық деректерді басқару
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

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-1 sm:gap-2 overflow-x-auto text-xs font-bold bg-white p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'overview'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Жалпы шолу</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('site_settings')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'site_settings'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Сайт пен мектепті баптау</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('subjects')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'subjects'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Пәндер каталогы ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('classes')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'classes'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Сыныптар ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('staff')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'staff'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Қызметкерлер ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('profile')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'profile'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Админ профилі мен құпиясөз</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('reminders')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'reminders'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Ескертулер мен уақыт</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('backup')}
          className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'backup'
              ? 'bg-[#075C42] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Резервтік көшірме</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
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
              onClick={() => setActiveAdminTab('classes')}
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

          {/* Quick Settings Shortcut Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#075C42] to-[#138A62] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFE9A8]">
                <Sliders className="w-4 h-4" />
                <span>Сайтты басқару және реттеу</span>
              </div>
              <h3 className="text-lg font-bold mt-1">
                Мектеп атауын, директорды және кестені кез келген уақытта өзгертіңіз
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Қазіргі мектеп: <strong>{siteConfig.schoolName}</strong> | Дайындық: {siteConfig.studyStartTime}–{siteConfig.studyEndTime}
              </p>
            </div>
            <button
              onClick={() => setActiveAdminTab('site_settings')}
              className="px-5 py-2.5 rounded-xl bg-[#FFE9A8] text-[#075C42] font-extrabold text-xs hover:bg-white transition shrink-0"
            >
              Параметрлерді өзгерту
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SITE & SCHOOL CUSTOMIZATION */}
      {activeAdminTab === 'site_settings' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-[#24342D]">
              Сайт пен мектеп деректерін өзгерту
            </h3>
            <p className="text-xs text-gray-400">
              Мектеп атауы, бағдарлама тақырыбы, байланыс деректері мен хабарландыруларды басқару
            </p>
          </div>

          <form onSubmit={handleSaveSiteConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Мектеп атауы (School Name)</label>
                <input
                  type="text"
                  required
                  value={siteForm.schoolName}
                  onChange={(e) => setSiteForm({ ...siteForm, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Жүйе тақырыбы (App Title)</label>
                <input
                  type="text"
                  required
                  value={siteForm.appTitle}
                  onChange={(e) => setSiteForm({ ...siteForm, appTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Жүйе сипаттамасы (Subtitle)</label>
                <input
                  type="text"
                  value={siteForm.subtitle}
                  onChange={(e) => setSiteForm({ ...siteForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Мектеп директоры (Director)</label>
                <input
                  type="text"
                  value={siteForm.directorName}
                  onChange={(e) => setSiteForm({ ...siteForm, directorName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Мектеп телефоны</label>
                <input
                  type="text"
                  value={siteForm.contactPhone}
                  onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Мектеп Email-і</label>
                <input
                  type="email"
                  value={siteForm.contactEmail}
                  onChange={(e) => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Мектеп мекенжайы</label>
                <input
                  type="text"
                  value={siteForm.schoolAddress}
                  onChange={(e) => setSiteForm({ ...siteForm, schoolAddress: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Кешкі дайындық басталуы</label>
                <input
                  type="time"
                  value={siteForm.studyStartTime}
                  onChange={(e) => setSiteForm({ ...siteForm, studyStartTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Кешкі дайындық аяқталуы</label>
                <input
                  type="time"
                  value={siteForm.studyEndTime}
                  onChange={(e) => setSiteForm({ ...siteForm, studyEndTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Announcement banner setting */}
            <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FFE9A8] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#075C42]" />
                  <span className="text-xs font-extrabold text-[#075C42]">Мектеп бойынша жедел хабарландыру</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteForm.announcementActive}
                    onChange={(e) => setSiteForm({ ...siteForm, announcementActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#138A62] focus:ring-[#138A62]"
                  />
                  <span>Хабарландыруды көрсету</span>
                </label>
              </div>
              <textarea
                rows={2}
                value={siteForm.announcement}
                onChange={(e) => setSiteForm({ ...siteForm, announcement: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#FFE9A8] bg-white text-xs text-[#24342D]"
                placeholder="Мысалы, барлық тәрбиешілерге бүгін сағат 21:00-де жиналыс болады..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#FFE9A8]" />
                <span>Өзгерістерді сақтау</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SUBJECTS CATALOG */}
      {activeAdminTab === 'subjects' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-[#24342D]">
                Мектеп пәндерінің каталогы ({subjects.length})
              </h3>
              <p className="text-xs text-gray-400">
                Кешкі дайындықта және сабақ кестесінде қолданылатын барлық оқу пәндері
              </p>
            </div>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="px-3.5 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#FFE9A8]" />
              <span>Жаңа пән қосу</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-[#138A62] transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white"
                    style={{ backgroundColor: sub.color || '#138A62' }}
                  >
                    {sub.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24342D]">{sub.nameKk}</h4>
                    <span className="text-[10px] text-gray-400 block">{sub.nameEn} • {sub.nameRu}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenSubjectModal(sub)}
                    className="p-1.5 text-gray-500 hover:text-[#075C42]"
                    title="Өзгерту"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.nameKk)}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                    title="Өшіру"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLASSES & ASSIGNMENTS */}
      {activeAdminTab === 'classes' && (
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
      )}

      {/* TAB 5: STAFF & LOGINS */}
      {activeAdminTab === 'staff' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-[#24342D]">
                Қызметкерлер мен логиндер ({users.length})
              </h3>
              <p className="text-xs text-gray-400">
                Тәрбиешілер, сынып жетекшілері және асхана қызметкерлерінің есептік жазбалары
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
              <div key={u.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#24342D]">{u.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                      {t.roles[u.role] || u.role}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] block mt-0.5">
                    Логин / Email: <strong className="font-mono">{u.email}</strong> • Құпиясөз: <strong className="font-mono">{u.password || 'admin123'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Өшіру"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ADMIN PROFILE & PASSWORD */}
      {activeAdminTab === 'profile' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-[#24342D]">
              Әкімші профилі мен құпиясөзін өзгерту
            </h3>
            <p className="text-xs text-gray-400">
              Басқарушының жеке аты-жөнін, байланыс нөмірін және кіру құпиясөзін жаңарту
            </p>
          </div>

          <form onSubmit={handleSaveAdminProfile} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Әкімші аты-жөні</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email / Логин</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Телефон байланысы</label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Жаңа құпиясөз (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#FFE9A8]" />
                <span>Профильді сақтау</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: PUSH REMINDERS */}
      {activeAdminTab === 'reminders' && (
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
        </div>
      )}

      {/* TAB 8: BACKUP & RESTORE */}
      {activeAdminTab === 'backup' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-[#24342D]">
              Деректер қорының қауіпсіздігі және Резервтік көшірме
            </h3>
            <p className="text-xs text-gray-400">
              Барлық сыныптар, оқушылар, қатысу және үй тапсырмалары жазбаларын толық экспорттау немесе қалпына келтіру
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <h4 className="font-bold text-sm text-[#24342D] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#075C42]" />
                <span>Толық резервтік көшірме жүктеу (Backup)</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Барлық деректерді JSON форматында компьютеріңізге жүктеп алып, қауіпсіз сақтай аласыз.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Резервтік көшірмені жүктеу (.json)</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <h4 className="font-bold text-sm text-[#24342D] flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Көшірмеден қалпына келтіру (Restore)</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Бұрын сақталған JSON көшірме файлын таңдап, жүйе деректерін қалпына келтіріңіз.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>Файлды таңдау (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Бастапқы демо деректерін қалпына келтіру</span>
            </button>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              {editingSubject ? 'Пәнді өзгерту' : 'Жаңа пән қосу'}
            </h3>
            <form onSubmit={handleSaveSubject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Пән атауы (Қазақша)</label>
                <input
                  type="text"
                  required
                  value={subNameKk}
                  onChange={(e) => setSubNameKk(e.target.value)}
                  placeholder="Мысалы, Робототехника"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Пән атауы (Орысша)</label>
                  <input
                    type="text"
                    value={subNameRu}
                    onChange={(e) => setSubNameRu(e.target.value)}
                    placeholder="Робототехника"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Пән атауы (Ағылшынша)</label>
                  <input
                    type="text"
                    value={subNameEn}
                    onChange={(e) => setSubNameEn(e.target.value)}
                    placeholder="Robotics"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Қысқа коды (Код)</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="ROBOT"
                    className="w-full px-3 py-2 text-xs font-bold uppercase rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Түсі (Белгіше)</label>
                  <input
                    type="color"
                    value={subColor}
                    onChange={(e) => setSubColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
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
              Қызметкерді тіркеу
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Құпиясөз (Password)</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="bil123"
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Телефон байланысы</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+7 701 000 0000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
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
