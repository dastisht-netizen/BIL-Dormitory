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
  Lock,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  Check
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIin, setNewUserIin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('EDUCATOR');
  const [newAssignedClass, setNewAssignedClass] = useState('cls-7a');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Admin Profile state
  const [adminName, setAdminName] = useState(currentUser.name);
  const [adminEmail, setAdminEmail] = useState(currentUser.email);
  const [adminPhone, setAdminPhone] = useState(currentUser.phone || '');
  const [adminPassword, setAdminPassword] = useState(currentUser.password || 'admin123');

  // Helper to generate secure password like BIL#8492
  const generateSecurePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `BIL#${randomNum}`;
    setNewUserPassword(pass);
    return pass;
  };

  // Helper to generate valid-looking 12-digit IIN
  const generateSampleIin = () => {
    const year = Math.floor(80 + Math.random() * 20);
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const day = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const gender = Math.random() > 0.5 ? '3' : '4';
    const rest = String(Math.floor(10000 + Math.random() * 90000));
    const sampleIin = `${year}${month}${day}${gender}${rest}`.substring(0, 12);
    setNewUserIin(sampleIin);
    return sampleIin;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const resetStaffPassword = (userId: string, userName: string) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass = `BIL#${randomNum}`;
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedUser: User = { ...user, password: newPass };
    storage.saveUser(updatedUser, currentUser.id, currentUser.name);
    loadData();
    showNotification(`«${userName}» қызметкеріне жаңа құпиясөз берілді: ${newPass}`);
  };

  const handleOpenUserModal = (userToEdit?: User, presetRole?: Role, presetClassId?: string) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setNewUserName(userToEdit.name);
      setNewUserPhone(userToEdit.phone || '');
      setNewUserRole(userToEdit.role);
      setNewAssignedClass(userToEdit.assignedClassIds?.[0] || 'cls-7a');
      setNewUserIin(userToEdit.iin || '');
      setNewUserPassword(userToEdit.password || '');
      setNewUserEmail(userToEdit.email || '');
    } else {
      setEditingUser(null);
      setNewUserName('');
      setNewUserPhone('');
      setNewUserRole(presetRole || 'EDUCATOR');
      setNewAssignedClass(presetClassId || 'cls-7a');
      setNewUserEmail('');
      generateSampleIin();
      generateSecurePassword();
    }
    setShowUserModal(true);
  };

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
    const cleanIin = newUserIin.trim();

    if (!/^\d{12}$/.test(cleanIin)) {
      alert('Қызметкердің ЖСН (ИИН) нөмірі дәл 12 цифрдан тұруы тиіс!');
      return;
    }

    const passToUse = newUserPassword.trim() || (editingUser ? editingUser.password : generateSecurePassword());
    const userId = editingUser ? editingUser.id : `user-${Date.now()}`;

    const userToSave: User = {
      id: userId,
      name: newUserName.trim(),
      iin: cleanIin,
      email: newUserEmail.trim() || `${cleanIin}@bil-arys.edu.kz`,
      password: passToUse,
      phone: newUserPhone.trim() || undefined,
      role: newUserRole,
      assignedClassIds: newAssignedClass ? [newAssignedClass] : [],
    };

    storage.saveUser(userToSave, currentUser.id, currentUser.name);

    // If an assigned class is selected, link it in the class record as well
    if (newAssignedClass && (newUserRole === 'EDUCATOR' || newUserRole === 'CLASS_TEACHER')) {
      storage.assignStaffToClass(newAssignedClass, newUserRole, userId, currentUser.id, currentUser.name);
    }

    loadData();
    setShowUserModal(false);
    showNotification(
      editingUser
        ? `«${userToSave.name}» қызметкерінің мәліметтері сәтті жаңартылды!`
        : `Қызметкер «${userToSave.name}» сәтті тіркелді! Логин (ЖСН): ${cleanIin} | Құпиясөз: ${passToUse}`
    );
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
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#075C42]">
                  Сыныптарды басқару
                </span>
                <span className="text-xs text-gray-400 font-bold">({classes.length} сынып)</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#24342D] mt-1">
                Сыныптарға тәрбиеші мен сынып жетекшіні бекіту
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Әр сыныпқа нақты тәрбиеші мен жетекшіні таңдаңыз немесе жаңа адамды тіркеңіз. Өзгеріс жүйеге лезде бекітіледі.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenUserModal(undefined, 'EDUCATOR')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Тәрбиеші тіркеу</span>
              </button>
              <button
                onClick={() => handleOpenUserModal(undefined, 'CLASS_TEACHER')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Жетекші тіркеу</span>
              </button>
            </div>
          </div>

          {/* Classes Cards Grid with Interactive Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const edu = users.find((u) => u.id === cls.educatorId);
              const teacher = users.find((u) => u.id === cls.classTeacherId);
              const count = students.filter((s) => s.classId === cls.id).length;

              const availableEducators = users.filter((u) => u.role === 'EDUCATOR');
              const availableTeachers = users.filter((u) => u.role === 'CLASS_TEACHER');

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 hover:border-indigo-400 transition shadow-xs flex flex-col justify-between space-y-4"
                >
                  {/* Class Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-[#4338CA] text-white flex items-center justify-center font-black text-sm">
                        {cls.name}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#0F172A]">{cls.name} сыныбы</h4>
                        <span className="text-[11px] text-slate-400 font-semibold">{cls.grade}-сынып тобы</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs">
                      {count} / 26 оқушы
                    </span>
                  </div>

                  {/* Educator Selector Box */}
                  <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Тәрбиеші:</span>
                      </span>
                      {edu ? (
                        <button
                          onClick={() => {
                            storage.assignStaffToClass(cls.id, 'EDUCATOR', undefined, currentUser.id, currentUser.name);
                            loadData();
                            showNotification(`${cls.name} сыныбының тәрбиешісі босатылды.`);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                        >
                          Босату
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          Бос
                        </span>
                      )}
                    </div>

                    <select
                      value={cls.educatorId || ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        storage.assignStaffToClass(cls.id, 'EDUCATOR', val, currentUser.id, currentUser.name);
                        loadData();
                        const assignedPerson = users.find((u) => u.id === val);
                        showNotification(
                          val
                            ? `${cls.name} сыныбына тәрбиеші болып «${assignedPerson?.name}» бекітілді!`
                            : `${cls.name} сыныбының тәрбиешісі босатылды.`
                        );
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#F0FDF4] text-slate-800"
                    >
                      <option value="">— Тәрбиеші тағайындалмаған (Бос) —</option>
                      {availableEducators.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (ЖСН: {u.iin})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {edu ? `ЖСН: ${edu.iin} • Пароль: ${edu.password}` : 'Тәрбиеші бекітілмеген'}
                      </span>
                      <button
                        onClick={() => handleOpenUserModal(undefined, 'EDUCATOR', cls.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Жаңадан жазу</span>
                      </button>
                    </div>
                  </div>

                  {/* Class Teacher Selector Box */}
                  <div className="p-3 rounded-2xl bg-white border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Сынып жетекшісі:</span>
                      </span>
                      {teacher ? (
                        <button
                          onClick={() => {
                            storage.assignStaffToClass(cls.id, 'CLASS_TEACHER', undefined, currentUser.id, currentUser.name);
                            loadData();
                            showNotification(`${cls.name} сыныбының жетекшісі босатылды.`);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                        >
                          Босату
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          Бос
                        </span>
                      )}
                    </div>

                    <select
                      value={cls.classTeacherId || ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        storage.assignStaffToClass(cls.id, 'CLASS_TEACHER', val, currentUser.id, currentUser.name);
                        loadData();
                        const assignedPerson = users.find((u) => u.id === val);
                        showNotification(
                          val
                            ? `${cls.name} сыныбына жетекші болып «${assignedPerson?.name}» бекітілді!`
                            : `${cls.name} сыныбының жетекшісі босатылды.`
                        );
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#EFF6FF] text-slate-800"
                    >
                      <option value="">— Жетекші тағайындалмаған (Бос) —</option>
                      {availableTeachers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (ЖСН: {u.iin})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {teacher ? `ЖСН: ${teacher.iin} • Пароль: ${teacher.password}` : 'Жетекші бекітілмеген'}
                      </span>
                      <button
                        onClick={() => handleOpenUserModal(undefined, 'CLASS_TEACHER', cls.id)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Жаңадан жазу</span>
                      </button>
                    </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA]">
                  Жатақхана меңгерушісінің айрықша құқығы
                </span>
                <span className="text-xs text-gray-400 font-bold">({users.length} қызметкер)</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#0F172A] mt-1">
                Қызметкерлер тізімі және есептік жазбалар
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Қызметкерлерді өзіңіз тіркеңіз, аты-жөні мен сыныбын өңдеңіз, немесе өшіріңіз. Өшірілген қызметкер қайта пайда болмайды.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Барлық үлгілік/бот қызметкерлерді өшіріп, таза база қалдыруды растайсыз ба?\n\nТек сіздің бас әкімші (Достонбек Тажиханов) аккаунтыңыз қалады, содан соң барлық қызметкерлерді өзіңіз нөлден тіркейсіз.'
                    )
                  ) {
                    storage.clearAllSampleStaff(currentUser.id, currentUser.name);
                    loadData();
                    showNotification('Барлық үлгілік қызметкерлер өшірілді! Енді өз қызметкерлеріңізді тіркей аласыз.');
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Үлгілік қызметкерлерді өшіру"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Үлгілерді тазарту (Өзім тіркеймін)</span>
              </button>

              <button
                onClick={() => handleOpenUserModal()}
                className="px-4 py-2.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>Жаңа қызметкер тіркеу</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Толық бақылау:</strong> Тәрбиеші немесе жетекшіні өшіріп басқа адам жазғыңыз келсе, қасындағы <strong>«Өңдеу» (қарындаш)</strong> батырмасымен атын, ЖСН, сыныбын өзгертіңіз немесе <strong>«Өшіру» (қоқыс)</strong> батырмасымен өшіріп, жаңа адам тіркеңіз.
              </span>
            </div>
          </div>

          {/* Dedicated Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Қызметкер</th>
                  <th className="py-3 px-3">Рөлі</th>
                  <th className="py-3 px-3">Бекітілген сынып</th>
                  <th className="py-3 px-3">Логин (12-таңбалы ЖСН)</th>
                  <th className="py-3 px-3">Құпиясөз</th>
                  <th className="py-3 px-3">Байланыс</th>
                  <th className="py-3 px-3 text-right">Әрекеттер</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const assignedClassNames = (u.assignedClassIds || [])
                    .map((cid) => classes.find((c) => c.id === cid)?.name)
                    .filter(Boolean)
                    .join(', ');

                  const isPassVisible = visiblePasswords[u.id];
                  const userPassword = u.password || 'BIL#8492';
                  const userIin = u.iin || (u.email.includes('@') ? u.email.split('@')[0] : '850412301492');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              u.role === 'ADMINISTRATOR'
                                ? 'bg-amber-500 text-slate-950'
                                : u.role === 'EDUCATOR'
                                ? 'bg-emerald-600 text-white'
                                : u.role === 'CLASS_TEACHER'
                                ? 'bg-blue-600 text-white'
                                : 'bg-purple-600 text-white'
                            }`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] block">{u.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            u.role === 'ADMINISTRATOR'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role === 'EDUCATOR'
                              ? 'bg-emerald-100 text-emerald-900'
                              : u.role === 'CLASS_TEACHER'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {t.roles[u.role] || u.role}
                        </span>
                      </td>

                      {/* Assigned Class */}
                      <td className="py-3.5 px-3">
                        {assignedClassNames ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4338CA] font-black text-[11px] border border-indigo-100">
                            {assignedClassNames} сыныбы
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">— ТАҒАЙЫНДАЛМАҒАН</span>
                        )}
                      </td>

                      {/* 12-digit IIN Login */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-1 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 text-xs tracking-wider">
                            {userIin}
                          </code>
                          <button
                            onClick={() => copyToClipboard(userIin, `iin-${u.id}`)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition cursor-pointer"
                            title="ЖСН көшіріп алу"
                          >
                            {copiedKey === `iin-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Generated Password */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="px-2 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 font-mono font-bold text-indigo-900 text-xs flex items-center gap-1">
                            <span>{isPassVisible ? userPassword : '••••••••'}</span>
                          </div>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                            title={isPassVisible ? 'Жасыру' : 'Көрсету'}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(userPassword, `pass-${u.id}`)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition cursor-pointer"
                            title="Құпиясөзді көшіріп алу"
                          >
                            {copiedKey === `pass-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-gray-600">
                        {u.phone || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenUserModal(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Өңдеу (Аты-жөнін, ЖСН, сыныбын өзгерту)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => resetStaffPassword(u.id, u.name)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Жаңа BIL# құпиясөз жасау"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Өшіру"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA]">
                    Жатақхана меңгерушісі
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-[#0F172A] mt-1">
                  {editingUser ? 'Қызметкер мәліметтерін өңдеу' : 'Жаңа қызметкерді тіркеу'}
                </h3>
                <p className="text-xs text-gray-400">
                  {editingUser
                    ? 'Қызметкердің аты-жөнін, ЖСН нөмірін, құпиясөзін немесе сыныбын жаңарту'
                    : 'Тәрбиеші немесе сынып жетекшісіне ЖСН логинін беру және құпиясөз жасау'}
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Қызметкердің аты-жөні <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Мысалы, Серік Болатұлы"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] font-semibold"
                />
              </div>

              {/* Role & Assigned Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Рөлі <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  >
                    <option value="EDUCATOR">Тәрбиеші (Educator)</option>
                    <option value="CLASS_TEACHER">Сынып жетекшісі (Class Teacher)</option>
                    <option value="CAFETERIA_STAFF">Асхана қызметкері (Cafeteria)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Бекітілетін сынып <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAssignedClass}
                    onChange={(e) => setNewAssignedClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} сыныбы ({c.grade}-сынып)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 12-digit IIN (Login) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#0F172A]">
                    Жүйеге кіру логині (12-таңбалы ИИН) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSampleIin}
                    className="text-[11px] font-bold text-[#4338CA] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Кездейсоқ ИИН жасау</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={newUserIin}
                    onChange={(e) => setNewUserIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="12 таңбалы ИИН (мысалы, 940512301824)"
                    className="w-full px-3.5 py-2 text-sm font-mono tracking-widest font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-mono text-gray-400">
                    {newUserIin.length}/12
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Қызметкер жүйеге кіру үшін өзінің осы 12 таңбалы ИИН нөмірін қолданады.
                </p>
              </div>

              {/* Automated Password Generation */}
              <div className="p-3.5 rounded-2xl bg-[#EEF2FF]/60 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#0F172A]">
                    Уақытша құпиясөз (Password) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="px-2.5 py-1 rounded-lg bg-[#4338CA] text-white text-[11px] font-extrabold hover:bg-[#3730A3] transition flex items-center gap-1 shadow-2xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#FFE9A8]" />
                    <span>Құпиясөз жасау (Generate)</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="BIL#8492"
                    className="w-full px-3.5 py-2 text-sm font-mono font-black text-indigo-950 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newUserPassword, 'modal-pass')}
                    className="px-3 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-800 text-xs font-bold transition flex items-center gap-1 shrink-0"
                    title="Көшіріп алу"
                  >
                    {copiedKey === 'modal-pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>Көшіру</span>
                  </button>
                </div>
                <p className="text-[11px] text-indigo-900/80">
                  Жүйе сенімді уақытша құпиясөз жасайды. Қызметкер алғашқы рет кіргенде өзі өзгерте алады.
                </p>
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Телефон байланысы</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+7 701 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email (Қосымша)</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder={`${newUserIin || 'iin'}@bil-arys.edu.kz`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#FFE9A8]" />
                  <span>{editingUser ? 'Өзгерістерді сақтау' : 'Қызметкерді сақтау'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
