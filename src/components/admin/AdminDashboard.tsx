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
  Check,
  Pause,
  Play,
  Search,
  Filter,
  ArrowRightLeft,
  UserPlus,
  Grid,
  Table,
  School
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

  // Class Form & Management State
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(7);
  const [newClassYearId, setNewClassYearId] = useState('ay-2026-2027');
  const [selectedEducatorId, setSelectedEducatorId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedAssistantEducatorId, setSelectedAssistantEducatorId] = useState('');
  const [newClassActive, setNewClassActive] = useState<boolean>(true);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [classGradeFilter, setClassGradeFilter] = useState<'ALL' | '7' | '8' | '9' | '10' | '11'>('ALL');
  const [classStatusFilter, setClassStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [classViewMode, setClassViewMode] = useState<'grid' | 'table'>('table');

  // User Form State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIin, setNewUserIin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('EDUCATOR');
  const [newSecondaryRole, setNewSecondaryRole] = useState<Role | ''>('');
  const [newAssignedClass, setNewAssignedClass] = useState('');
  const [newUserActive, setNewUserActive] = useState<boolean>(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Staff Management Filter State
  const [staffRoleFilter, setStaffRoleFilter] = useState<'ALL' | 'EDUCATOR' | 'CLASS_TEACHER' | 'ADMINISTRATOR'>('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

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

  const handleAdminSendResetLink = (userId: string, userName: string) => {
    const res = storage.adminGenerateStaffResetLink(userId, currentUser.id, currentUser.name);
    if (res.success && res.resetLink) {
      navigator.clipboard.writeText(res.resetLink);
      showNotification(`«${userName}» қызметкеріне құпиясөзді қалпына келтіру сілтемесі жасалды және көшірілді! (${res.email})`);
    } else {
      showNotification(res.message);
    }
  };

  const handleOpenUserModal = (userToEdit?: User, presetRole?: Role, presetClassId?: string) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setNewUserName(userToEdit.name);
      setNewUserPhone(userToEdit.phone || '');
      setNewUserRole(userToEdit.role);
      setNewSecondaryRole(userToEdit.secondaryRole || '');
      setNewAssignedClass(userToEdit.assignedClassIds?.[0] || '');
      setNewUserIin(userToEdit.iin || '');
      setNewUserPassword(''); // Protected: do not expose existing plaintext password
      setNewUserEmail(userToEdit.email || '');
      setNewUserActive(userToEdit.isActive !== false && userToEdit.status !== 'inactive');
    } else {
      setEditingUser(null);
      setNewUserName('');
      setNewUserPhone('');
      setNewUserRole(presetRole || 'EDUCATOR');
      setNewSecondaryRole('');
      setNewAssignedClass(presetClassId || '');
      setNewUserEmail('');
      setNewUserActive(true);
      generateSampleIin();
      generateSecurePassword();
    }
    setShowUserModal(true);
  };

  const handleToggleUserStatus = (u: User) => {
    const res = storage.toggleUserStatus(u.id, currentUser.id, currentUser.name);
    loadData();
    showNotification(res.message);
  };

  const handleTransferClass = (userId: string, targetClassId: string) => {
    storage.transferStaff(userId, targetClassId || undefined, currentUser.id, currentUser.name);
    loadData();
    const clsName = classes.find((c) => c.id === targetClassId)?.name;
    showNotification(targetClassId ? `Қызметкер ${clsName} сыныбына сәтті ауыстырылды!` : 'Қызметкер сыныптан босатылды.');
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
  const handleOpenClassModal = (clsToEdit?: SchoolClass) => {
    if (clsToEdit) {
      setEditingClass(clsToEdit);
      setNewClassName(clsToEdit.name);
      setNewClassGrade(clsToEdit.grade);
      setNewClassYearId(clsToEdit.academicYearId || 'ay-2026-2027');
      setSelectedEducatorId(clsToEdit.educatorId || '');
      setSelectedTeacherId(clsToEdit.classTeacherId || '');
      setSelectedAssistantEducatorId(clsToEdit.assistantEducatorId || '');
      setNewClassActive(clsToEdit.isActive !== false && clsToEdit.status !== 'inactive');
    } else {
      setEditingClass(null);
      setNewClassName('');
      setNewClassGrade(7);
      setNewClassYearId('ay-2026-2027');
      setSelectedEducatorId('');
      setSelectedTeacherId('');
      setSelectedAssistantEducatorId('');
      setNewClassActive(true);
    }
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newClassName.trim().toUpperCase();
    if (!cleanName) {
      alert('Сынып атауын енгізіңіз (мысалы, 7А немесе 9Б)!');
      return;
    }

    const classId = editingClass
      ? editingClass.id
      : `cls-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;

    const classToSave: SchoolClass = {
      id: classId,
      name: cleanName,
      grade: Number(newClassGrade),
      academicYearId: newClassYearId,
      academicYearName: newClassYearId === 'ay-2025-2026' ? '2025–2026' : '2026–2027',
      educatorId: selectedEducatorId || undefined,
      classTeacherId: selectedTeacherId || undefined,
      assistantEducatorId: selectedAssistantEducatorId || undefined,
      additionalStaffIds: selectedAssistantEducatorId ? [selectedAssistantEducatorId] : [],
      isActive: newClassActive,
      status: newClassActive ? 'active' : 'inactive',
    };

    storage.saveClass(classToSave, currentUser.id, currentUser.name);
    loadData();
    setShowClassModal(false);
    showNotification(
      editingClass
        ? `«${classToSave.name}» сыныбының мәліметтері сәтті жаңартылды!`
        : `Жаңа «${classToSave.name}» сыныбы сәтті қосылды!`
    );
  };

  const handleDeleteClass = (classId: string, name: string) => {
    const studentCount = students.filter((s) => s.classId === classId).length;
    const confirmMessage = `«${name}» сыныбын жүйеден өшіруді растайсыз ба?\n\nБұл сыныпта ${studentCount} оқушы тіркелген.\n\nМАҢЫЗДЫ: Сынып өшірілгенде оның оқушылары мен олардың барлық бұрынғы есептері ДЕРЕКҚОРДАН ӨШІРІЛМЕЙДІ, толық сақталады.`;

    if (confirm(confirmMessage)) {
      const res = storage.deleteClass(classId, currentUser.id, currentUser.name);
      loadData();
      showNotification(res.message);
    }
  };

  const handleToggleClassStatus = (cls: SchoolClass) => {
    const res = storage.toggleClassStatus(cls.id, currentUser.id, currentUser.name);
    loadData();
    showNotification(res.message);
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
      secondaryRole: (newSecondaryRole && newSecondaryRole !== newUserRole) ? (newSecondaryRole as Role) : undefined,
      allowedRoles: (newSecondaryRole && newSecondaryRole !== newUserRole)
        ? [newUserRole, newSecondaryRole as Role]
        : [newUserRole],
      assignedClassIds: newAssignedClass ? [newAssignedClass] : [],
      isActive: newUserActive,
      status: newUserActive ? 'active' : 'inactive',
    };

    storage.saveUser(userToSave, currentUser.id, currentUser.name);

    // If an assigned class is selected or cleared, sync properly across classes
    if (newUserRole === 'EDUCATOR' || newUserRole === 'CLASS_TEACHER') {
      storage.transferStaff(userId, newAssignedClass || undefined, currentUser.id, currentUser.name);
    }

    loadData();
    setShowUserModal(false);
    showNotification(
      editingUser
        ? `«${userToSave.name}» қызметкерінің мәліметтері сәтті жаңартылды!`
        : `Қызметкер «${userToSave.name}» сәтті тіркелді! Логин (ЖСН): ${cleanIin}`
    );
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === 'user-admin') {
      alert('Бас әкімшіні (Достонбек Тажиханов) өшіруге болмайды!');
      return;
    }
    if (confirm(`«${name}» қызметкерін жүйеден біржола өшіруді растайсыз ба?\n\nӨшірілген қызметкер қайта пайда болмайды.`)) {
      storage.deleteUser(userId, currentUser.id, currentUser.name);
      loadData();
      showNotification(`«${name}» қызметкері жүйеден толық өшірілді.`);
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
          <span>Сыныптарды басқару ({classes.length})</span>
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
          <span>Қызметкерлерді басқару ({users.length})</span>
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

      {/* TAB 4: CLASS MANAGEMENT (Сыныптарды басқару) */}
      {activeAdminTab === 'classes' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-5">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Сыныптарды басқару жүйесі
                </span>
                <span className="text-xs text-gray-500 font-bold">({classes.length} сынып)</span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#0F172A] mt-1.5">
                Сыныптарды басқару (Class Management)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Жаңа сынып қосыңыз, атауын өзгертіңіз, тәрбиеші мен жетекшілерді бекітіңіз, уақытша өшіріңіз немесе жойыңыз.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenClassModal()}
                className="px-4 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-extrabold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>+ Жаңа сынып қосу</span>
              </button>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[11px]">Барлық сыныптар</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{classes.length} сынып</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 font-semibold block text-[11px]">Белсенді сыныптар</span>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                {classes.filter((c) => c.isActive !== false && c.status !== 'inactive').length} сынып
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800 font-semibold block text-[11px]">Уақытша өшірілген</span>
              <div className="text-xl font-black text-amber-900 mt-0.5">
                {classes.filter((c) => c.isActive === false || c.status === 'inactive').length} сынып
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <span className="text-indigo-800 font-semibold block text-[11px]">Барлық оқушылар</span>
              <div className="text-xl font-black text-indigo-900 mt-0.5">{students.length} оқушы</div>
            </div>
          </div>

          {/* Search, Filter & View Controls */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={classSearchQuery}
                onChange={(e) => setClassSearchQuery(e.target.value)}
                placeholder="Сынып атауы бойынша іздеу (мысалы, 7А, 9, 10Б)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {classSearchQuery && (
                <button
                  onClick={() => setClassSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Grade Filter */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setClassGradeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    classGradeFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Барлық сынып
                </button>
                {(['7', '8', '9', '10', '11'] as const).map((gr) => (
                  <button
                    key={gr}
                    onClick={() => setClassGradeFilter(gr)}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      classGradeFilter === gr
                        ? 'bg-[#075C42] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {gr}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setClassStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    classStatusFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Барлығы
                </button>
                <button
                  onClick={() => setClassStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    classStatusFilter === 'ACTIVE'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  ✅ Белсенді
                </button>
                <button
                  onClick={() => setClassStatusFilter('INACTIVE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    classStatusFilter === 'INACTIVE'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  ⏸️ Өшірулі
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setClassViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    classViewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Кестелік көрініс"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setClassViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    classViewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Карточкалық көрініс"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Render Filtered Classes */}
          {(() => {
            const filteredClasses = classes.filter((cls) => {
              if (classGradeFilter !== 'ALL' && String(cls.grade) !== classGradeFilter) return false;
              if (classStatusFilter === 'ACTIVE' && (cls.isActive === false || cls.status === 'inactive')) return false;
              if (classStatusFilter === 'INACTIVE' && cls.isActive !== false && cls.status !== 'inactive') return false;
              if (classSearchQuery.trim()) {
                const q = classSearchQuery.toLowerCase();
                const matchName = cls.name.toLowerCase().includes(q);
                const matchGrade = String(cls.grade).includes(q);
                return matchName || matchGrade;
              }
              return true;
            });

            if (filteredClasses.length === 0) {
              return (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">Сыныптар табылмады</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Сүзгіге сәйкес келетін сынып жоқ немесе әлі қосылмаған. «+ Жаңа сынып қосу» батырмасын басып сынып қосыңыз.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => handleOpenClassModal()}
                      className="px-4 py-2 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#FFE9A8]" />
                      <span>+ Жаңа сынып қосу</span>
                    </button>
                  </div>
                </div>
              );
            }

            const availableEducators = users.filter((u) => u.role === 'EDUCATOR');
            const availableTeachers = users.filter((u) => u.role === 'CLASS_TEACHER');

            if (classViewMode === 'table') {
              return (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5">Сынып</th>
                        <th className="py-3 px-3">Оқу жылы</th>
                        <th className="py-3 px-3">Сынып жетекшісі</th>
                        <th className="py-3 px-3">Тәрбиешісі</th>
                        <th className="py-3 px-3">Қосымша қызметкер</th>
                        <th className="py-3 px-3">Оқушылар</th>
                        <th className="py-3 px-3">Мәртебесі</th>
                        <th className="py-3 px-3 text-right">Әрекеттер (Басқару)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredClasses.map((cls) => {
                        const isInactive = cls.isActive === false || cls.status === 'inactive';
                        const count = students.filter((s) => s.classId === cls.id).length;
                        const edu = users.find((u) => u.id === cls.educatorId);
                        const teacher = users.find((u) => u.id === cls.classTeacherId);
                        const assistant = users.find((u) => u.id === cls.assistantEducatorId);

                        return (
                          <tr
                            key={cls.id}
                            className={`transition ${
                              isInactive ? 'bg-amber-50/40 hover:bg-amber-50/70 text-slate-500' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Class Name & Grade */}
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                    isInactive ? 'bg-slate-300 text-slate-700' : 'bg-[#4338CA] text-white'
                                  }`}
                                >
                                  {cls.name}
                                </div>
                                <div>
                                  <span className={`font-extrabold text-sm block ${isInactive ? 'text-slate-600 line-through' : 'text-[#0F172A]'}`}>
                                    {cls.name} сыныбы
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-semibold">{cls.grade}-сынып тобы</span>
                                </div>
                              </div>
                            </td>

                            {/* Academic Year */}
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] font-mono border border-slate-200">
                                {cls.academicYearName || '2026–2027'}
                              </span>
                            </td>

                            {/* Class Teacher Selector */}
                            <td className="py-3.5 px-3">
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
                                className="w-full max-w-[200px] px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-200 bg-[#EFF6FF] text-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              >
                                <option value="">— Жетекші тағайындалмаған —</option>
                                {availableTeachers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Educator Selector */}
                            <td className="py-3.5 px-3">
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
                                className="w-full max-w-[200px] px-2.5 py-1 text-xs font-semibold rounded-lg border border-emerald-200 bg-[#F0FDF4] text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                              >
                                <option value="">— Тәрбиеші тағайындалмаған —</option>
                                {availableEducators.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Assistant Educator */}
                            <td className="py-3.5 px-3">
                              {assistant ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[11px]">
                                  {assistant.name}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">— Тағайындалмаған</span>
                              )}
                            </td>

                            {/* Student Count */}
                            <td className="py-3.5 px-3">
                              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                                {count} / 26 оқушы
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              {isInactive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                  ⏸️ Өшірулі
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  ✅ Белсенді
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Toggle Active / Inactive */}
                                {isInactive ? (
                                  <button
                                    onClick={() => handleToggleClassStatus(cls)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Белсенді ету"
                                  >
                                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>✅ Белсенді ету</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleClassStatus(cls)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Уақытша өшіру (белсенді емес ету)"
                                  >
                                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                                    <span>⏸️ Уақытша өшіру</span>
                                  </button>
                                )}

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenClassModal(cls)}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Өзгерту (Сынып атауын, жылын, қызметкерлерін өңдеу)"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>✏️ Өзгерту</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Өшіру (Оқушылар мен есептер жойылмайды!)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>🗑️ Өшіру</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Grid View
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => {
                  const isInactive = cls.isActive === false || cls.status === 'inactive';
                  const edu = users.find((u) => u.id === cls.educatorId);
                  const teacher = users.find((u) => u.id === cls.classTeacherId);
                  const assistant = users.find((u) => u.id === cls.assistantEducatorId);
                  const count = students.filter((s) => s.classId === cls.id).length;

                  return (
                    <div
                      key={cls.id}
                      className={`p-5 rounded-3xl border transition shadow-xs flex flex-col justify-between space-y-4 ${
                        isInactive
                          ? 'bg-amber-50/30 border-amber-200'
                          : 'bg-[#F8FAFC] border-slate-200/90 hover:border-indigo-400'
                      }`}
                    >
                      {/* Class Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
                              isInactive ? 'bg-slate-400' : 'bg-[#4338CA]'
                            }`}
                          >
                            {cls.name}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-[#0F172A]">{cls.name} сыныбы</h4>
                              {isInactive && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  ⏸️ Өшірулі
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              {cls.grade}-сынып тобы • {cls.academicYearName || '2026–2027'}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs">
                          {count} / 26 оқушы
                        </span>
                      </div>

                      {/* Educator Box */}
                      <div className="p-3 rounded-2xl bg-white border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Тәрбиеші:</span>
                          </span>
                          {edu ? (
                            <span className="text-[10px] text-emerald-700 font-bold font-mono">ЖСН: {edu.iin}</span>
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
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#F0FDF4] text-slate-800 cursor-pointer"
                        >
                          <option value="">— Тәрбиеші тағайындалмаған (Бос) —</option>
                          {availableEducators.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} (ЖСН: {u.iin})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Teacher Box */}
                      <div className="p-3 rounded-2xl bg-white border border-blue-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-800 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Сынып жетекшісі:</span>
                          </span>
                          {teacher ? (
                            <span className="text-[10px] text-blue-700 font-bold font-mono">ЖСН: {teacher.iin}</span>
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
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#EFF6FF] text-slate-800 cursor-pointer"
                        >
                          <option value="">— Жетекші тағайындалмаған (Бос) —</option>
                          {availableTeachers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} (ЖСН: {u.iin})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        {isInactive ? (
                          <button
                            onClick={() => handleToggleClassStatus(cls)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Белсенді ету</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleClassStatus(cls)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                            <span>Уақытша өшіру</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenClassModal(cls)}
                            className="p-2 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl transition cursor-pointer"
                            title="Өзгерту"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id, cls.name)}
                            className="p-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                            title="Өшіру"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: STAFF MANAGEMENT (Қызметкерлерді басқару) */}
      {activeAdminTab === 'staff' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-5">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Қызметкерлерді басқару жүйесі
                </span>
                <span className="text-xs text-gray-500 font-bold">({users.length} қызметкер)</span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#0F172A] mt-1.5">
                Қызметкерлерді басқару (Staff Management)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Тәрбиешілер мен сынып жетекшілерін өзіңіз қосыңыз, сыныпқа бекітіңіз, ақпараттарын өзгертіңіз, уақытша өшіріңіз немесе біржола жойыңыз.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenUserModal(undefined, 'EDUCATOR')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>+ Жаңа тәрбиеші қосу</span>
              </button>

              <button
                onClick={() => handleOpenUserModal(undefined, 'CLASS_TEACHER')}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFE9A8]" />
                <span>+ Жаңа сынып жетекшісін қосу</span>
              </button>

              <button
                onClick={() => handleOpenUserModal()}
                className="px-3.5 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#FFE9A8]" />
                <span>+ Қызметкер қосу</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[11px]">Барлық қызметкерлер</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{users.length} адам</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 font-semibold block text-[11px]">Белсенді қызметкерлер</span>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                {users.filter((u) => u.isActive !== false && u.status !== 'inactive').length} адам
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800 font-semibold block text-[11px]">Уақытша өшірілген</span>
              <div className="text-xl font-black text-amber-900 mt-0.5">
                {users.filter((u) => u.isActive === false || u.status === 'inactive').length} адам
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <span className="text-indigo-800 font-semibold block text-[11px]">Сыныпқа бекітілген</span>
              <div className="text-xl font-black text-indigo-900 mt-0.5">
                {users.filter((u) => (u.assignedClassIds || []).length > 0).length} сынып
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Қызметкер аты-жөні, ЖСН немесе телефон бойынша іздеу..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {staffSearchQuery && (
                <button
                  onClick={() => setStaffSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStaffRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffRoleFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Барлық рөл
                </button>
                <button
                  onClick={() => setStaffRoleFilter('EDUCATOR')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffRoleFilter === 'EDUCATOR'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Тәрбиешілер
                </button>
                <button
                  onClick={() => setStaffRoleFilter('CLASS_TEACHER')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffRoleFilter === 'CLASS_TEACHER'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Сынып жетекшілері
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStaffStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffStatusFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Барлығы
                </button>
                <button
                  onClick={() => setStaffStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffStatusFilter === 'ACTIVE'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  ✅ Белсенді
                </button>
                <button
                  onClick={() => setStaffStatusFilter('INACTIVE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    staffStatusFilter === 'INACTIVE'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  ⏸️ Уақытша өшірулі
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Staff Table */}
          {(() => {
            const filteredUsers = users.filter((u) => {
              if (staffRoleFilter !== 'ALL' && u.role !== staffRoleFilter) return false;
              if (staffStatusFilter === 'ACTIVE' && (u.isActive === false || u.status === 'inactive')) return false;
              if (staffStatusFilter === 'INACTIVE' && u.isActive !== false && u.status !== 'inactive') return false;
              if (staffSearchQuery.trim()) {
                const q = staffSearchQuery.toLowerCase();
                const matchName = u.name.toLowerCase().includes(q);
                const matchIin = (u.iin || '').includes(q);
                const matchPhone = (u.phone || '').toLowerCase().includes(q);
                const matchEmail = (u.email || '').toLowerCase().includes(q);
                return matchName || matchIin || matchPhone || matchEmail;
              }
              return true;
            });

            if (filteredUsers.length === 0) {
              return (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">Қызметкерлер тізімінде ешкім табылмады</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Сайтта боттар немесе жасанды интеллект ойдан шығарған қызметкерлер жоқ. Өз тәрбиешілеріңіз бен сынып жетекшілеріңізді төмендегі батырмалар арқылы өзіңіз қосыңыз.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => handleOpenUserModal(undefined, 'EDUCATOR')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#FFE9A8]" />
                      <span>+ Жаңа тәрбиеші қосу</span>
                    </button>
                    <button
                      onClick={() => handleOpenUserModal(undefined, 'CLASS_TEACHER')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#FFE9A8]" />
                      <span>+ Жаңа сынып жетекшісін қосу</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3.5">Қызметкер</th>
                      <th className="py-3 px-3">Лауазымы</th>
                      <th className="py-3 px-3">Бекітілген сыныбы</th>
                      <th className="py-3 px-3">Мәртебесі</th>
                      <th className="py-3 px-3">Логин (ЖСН)</th>
                      <th className="py-3 px-3">Құпиясөз (Қауіпсіздік)</th>
                      <th className="py-3 px-3">Телефон</th>
                      <th className="py-3 px-3 text-right">Әрекеттер (Басқару)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.map((u) => {
                      const isInactive = u.isActive === false || u.status === 'inactive';
                      const isPassVisible = visiblePasswords[u.id];
                      const userPassword = u.password || 'BIL#8492';
                      const userIin = u.iin || (u.email.includes('@') ? u.email.split('@')[0] : '850412301492');
                      const currentClassId = u.assignedClassIds?.[0] || '';

                      return (
                        <tr
                          key={u.id}
                          className={`transition ${
                            isInactive ? 'bg-amber-50/40 hover:bg-amber-50/70 text-slate-500' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Name & Avatar */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                  isInactive
                                    ? 'bg-slate-300 text-slate-600'
                                    : u.role === 'ADMINISTRATOR'
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
                                <span className={`font-bold block ${isInactive ? 'text-slate-600 line-through' : 'text-[#0F172A]'}`}>
                                  {u.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                                u.role === 'ADMINISTRATOR'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : u.role === 'EDUCATOR'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : u.role === 'CLASS_TEACHER'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {u.role === 'EDUCATOR'
                                ? 'Тәрбиеші'
                                : u.role === 'CLASS_TEACHER'
                                ? 'Сынып жетекшісі'
                                : u.role === 'ADMINISTRATOR'
                                ? 'Жатақхана меңгерушісі'
                                : t.roles[u.role] || u.role}
                            </span>
                          </td>

                          {/* Assigned Class with Direct Transfer Dropdown */}
                          <td className="py-3.5 px-3">
                            {u.role === 'ADMINISTRATOR' ? (
                              <span className="text-slate-400 font-semibold text-[11px]">— Мектеп/Жатақхана деңгейі</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={currentClassId}
                                  onChange={(e) => handleTransferClass(u.id, e.target.value)}
                                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                                  title="Қызметкерді басқа сыныпқа ауыстыру немесе бекіту"
                                >
                                  <option value="">— Сынып бекітілмеген (Бос) —</option>
                                  {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                      {cls.name} сыныбы
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3">
                            {isInactive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                ⏸️ Уақытша өшірулі
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                ✅ Белсенді
                              </span>
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

                          {/* Protected Password & Reset Link Action */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-1 rounded-lg bg-slate-100 font-mono text-slate-400 font-bold text-xs tracking-widest border border-slate-200">
                                ••••••••
                              </span>
                              <button
                                onClick={() => handleAdminSendResetLink(u.id, u.name)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] border border-indigo-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Қызметкерге құпиясөзді қалпына келтіру сілтемесін жасау/көшіру"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-[#4338CA]" />
                                <span>Сілтеме</span>
                              </button>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-3 font-mono text-[11px] text-gray-600">
                            {u.phone || '—'}
                          </td>

                          {/* Actions: exactly the 4 requested actions */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Action 1 & 2: Toggle Active / Inactive */}
                              {u.id !== 'user-admin' && (
                                isInactive ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Белсенді ету (Жүйеге кіруге қайта рұқсат беру)"
                                  >
                                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>✅ Белсенді ету</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Уақытша өшіру (Жүйеге кіру тоқтатылады, бірақ барлық есептері сақталады)"
                                  >
                                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                                    <span>⏸️ Уақытша өшіру</span>
                                  </button>
                                )
                              )}

                              {/* Action 3: Edit */}
                              <button
                                onClick={() => handleOpenUserModal(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Өзгерту (Аты-жөнін, сыныбын, ЖСН, құпиясөзін өңдеу)"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                <span>✏️ Өзгерту</span>
                              </button>

                              {/* Action 4: Delete */}
                              {u.id !== currentUser.id && u.id !== 'user-admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Толық жою (Дерекқордан біржола өшіру)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>🗑️ Толық жою</span>
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
            );
          })()}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Сыныптарды басқару
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-[#0F172A] mt-1">
                  {editingClass ? 'Сынып мәліметтерін өзгерту' : 'Жаңа сынып қосу'}
                </h3>
                <p className="text-xs text-gray-400">
                  {editingClass
                    ? `«${editingClass.name}» сыныбының атауын, оқу жылын, қызметкерлерін және күйін жаңарту`
                    : 'Мектепке жаңа сынып қосып, оған жетекші мен тәрбиешіні бекітіңіз'}
                </p>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="mt-4 space-y-4">
              {/* Class Name & Quick Suggestions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Сынып атауы <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setNewClassName(val);
                    const match = val.match(/^(\d+)/);
                    if (match && [7, 8, 9, 10, 11].includes(Number(match[1]))) {
                      setNewClassGrade(Number(match[1]));
                    }
                  }}
                  placeholder="Мысалы, 7А, 7Б, 8А, 9Б, 10А, 11Б"
                  className="w-full px-3.5 py-2.5 text-sm font-extrabold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider"
                />

                {/* Quick suggestion badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 font-semibold mr-1">Үлгілер:</span>
                  {['7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B'].map((sample) => (
                    <button
                      type="button"
                      key={sample}
                      onClick={() => {
                        setNewClassName(sample);
                        const num = Number(sample.replace(/\D/g, ''));
                        if (num) setNewClassGrade(num);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition cursor-pointer ${
                        newClassName === sample
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parallel Grade & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Параллель (Сынып деңгейі) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value={7}>7-сынып параллелі</option>
                    <option value={8}>8-сынып параллелі</option>
                    <option value={9}>9-сынып параллелі</option>
                    <option value={10}>10-сынып параллелі</option>
                    <option value={11}>11-сынып параллелі</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Оқу жылы <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newClassYearId}
                    onChange={(e) => setNewClassYearId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                  >
                    <option value="ay-2026-2027">2026–2027 (Ағымдағы оқу жылы)</option>
                    <option value="ay-2025-2026">2025–2026 (Алдыңғы оқу жылы)</option>
                  </select>
                </div>
              </div>

              {/* Staff Assignments: Class Teacher & Main Educator */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="font-black text-[#0F172A] block text-xs">
                  Сынып қызметкерлерін бекіту
                </span>

                {/* Class Teacher */}
                <div>
                  <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Сынып жетекшісі:</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#EFF6FF] text-blue-950"
                  >
                    <option value="">— Сынып жетекшісі тағайындалмаған (Бос) —</option>
                    {users
                      .filter((u) => u.role === 'CLASS_TEACHER' || u.role === 'ADMINISTRATOR')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (ЖСН: {u.iin})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Main Educator */}
                <div>
                  <label className="block font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Негізгі тәрбиеші:</span>
                  </label>
                  <select
                    value={selectedEducatorId}
                    onChange={(e) => setSelectedEducatorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#F0FDF4] text-emerald-950"
                  >
                    <option value="">— Тәрбиеші тағайындалмаған (Бос) —</option>
                    {users
                      .filter((u) => u.role === 'EDUCATOR' || u.role === 'ADMINISTRATOR')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (ЖСН: {u.iin})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Assistant Educator / Multiple Staff */}
                <div>
                  <label className="block font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Қосымша жауапты қызметкер (Көмекші тәрбиеші):</span>
                  </label>
                  <select
                    value={selectedAssistantEducatorId}
                    onChange={(e) => setSelectedAssistantEducatorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50 text-purple-950"
                  >
                    <option value="">— Қосымша қызметкер жоқ —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'EDUCATOR' ? 'Тәрбиеші' : u.role === 'CLASS_TEACHER' ? 'Жетекші' : 'Әкімші'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Белсенділік мәртебесі <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewClassActive(true)}
                    className={`p-2.5 rounded-xl border font-bold text-left flex items-start gap-2 transition cursor-pointer ${
                      newClassActive
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">✅</span>
                    <div>
                      <div className="font-extrabold text-xs">Белсенді</div>
                      <div className="text-[10px] text-slate-500 font-normal">Журналдарда, кестелерде және есептерде көрінеді</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewClassActive(false)}
                    className={`p-2.5 rounded-xl border font-bold text-left flex items-start gap-2 transition cursor-pointer ${
                      !newClassActive
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">⏸️</span>
                    <div>
                      <div className="font-extrabold text-xs">Уақытша өшірулі</div>
                      <div className="text-[10px] text-slate-500 font-normal">Уақытша жасырылады, оқушылары сақталады</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#075C42] hover:bg-[#054531] text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#FFE9A8]" />
                  <span>{editingClass ? 'Өзгерістерді сақтау' : 'Сыныпты сақтау'}</span>
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
                    Лауазымы <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white"
                  >
                    <option value="EDUCATOR">Тәрбиеші (Educator)</option>
                    <option value="CLASS_TEACHER">Сынып жетекшісі (Class Teacher)</option>
                    <option value="ADMINISTRATOR">Жатақхана меңгерушісі (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Бекітілген сыныбы
                  </label>
                  <select
                    value={newAssignedClass}
                    onChange={(e) => setNewAssignedClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white"
                  >
                    <option value="">— Сынып бекітілмеген (Бос) —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} сыныбы ({c.grade}-сынып)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Secondary Role (Екі рөл қатар тағайындалса) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Қосымша бекітілген 2-рөл (Қажет болса)
                </label>
                <select
                  value={newSecondaryRole}
                  onChange={(e) => setNewSecondaryRole(e.target.value as Role | '')}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white"
                >
                  <option value="">— Қосымша рөл жоқ (Тек 1 ресми рөл) —</option>
                  <option value="EDUCATOR">Тәрбиеші (Educator)</option>
                  <option value="CLASS_TEACHER">Сынып жетекшісі (Class Teacher)</option>
                  <option value="CAFETERIA_STAFF">Асхана қызметкері</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Егер бір қызметкерге екі рөл ресми бекітілсе, сол қызметкерге ғана өзіне бекітілген рөлдердің тиісті бөлімдеріне ауысу мүмкіндігі ашылады.
                </p>
              </div>

              {/* Status Selector */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Белсенділік мәртебесі <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewUserActive(true)}
                    className={`p-2.5 rounded-xl border font-bold text-left flex items-start gap-2 transition cursor-pointer ${
                      newUserActive
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">✅</span>
                    <div>
                      <div className="font-extrabold text-xs">Белсенді</div>
                      <div className="text-[10px] text-slate-500 font-normal">Жүйеге кіре алады, есептерде көрінеді</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewUserActive(false)}
                    className={`p-2.5 rounded-xl border font-bold text-left flex items-start gap-2 transition cursor-pointer ${
                      !newUserActive
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base leading-none">⏸️</span>
                    <div>
                      <div className="font-extrabold text-xs">Уақытша өшірулі</div>
                      <div className="text-[10px] text-slate-500 font-normal">Кіру тоқтатылған, есептері сақталады</div>
                    </div>
                  </button>
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
                    {editingUser ? 'Құпиясөзді өзгерту (Міндетті емес)' : 'Уақытша құпиясөз (Password) *'}
                  </label>
                  {editingUser ? (
                    <button
                      type="button"
                      onClick={() => handleAdminSendResetLink(editingUser.id, editingUser.name)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-extrabold hover:bg-indigo-700 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#FFE9A8]" />
                      <span>Қалпына келтіру сілтемесін беру</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="px-2.5 py-1 rounded-lg bg-[#4338CA] text-white text-[11px] font-extrabold hover:bg-[#3730A3] transition flex items-center gap-1 shadow-2xs"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#FFE9A8]" />
                      <span>Құпиясөз жасау (Generate)</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={editingUser ? 'password' : 'text'}
                    required={!editingUser}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder={editingUser ? '•••••••• (Өзгерту үшін жаңасын жазыңыз)' : 'BIL#8492'}
                    className="w-full px-3.5 py-2 text-sm font-mono font-black text-indigo-950 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-[#4338CA] bg-white tracking-wider"
                  />
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(newUserPassword, 'modal-pass')}
                      className="px-3 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-800 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Көшіріп алу"
                    >
                      {copiedKey === 'modal-pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>Көшіру</span>
                    </button>
                  )}
                </div>
                {editingUser ? (
                  <p className="text-[10px] text-slate-500">
                    Қауіпсіздік ережесі бойынша қызметкерлердің қазіргі құпиясөзі әкімшіге де көрсетілмейді. Бос қалдырсаңыз, қазіргі құпиясөзі өзгеріссіз қалады.
                  </p>
                ) : (
                  <p className="text-[11px] text-indigo-900/80">
                    Жүйе сенімді уақытша құпиясөз жасайды. Қызметкер алғашқы рет кіргенде өзі өзгерте алады.
                  </p>
                )}
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
