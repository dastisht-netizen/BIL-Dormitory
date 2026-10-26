import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  GraduationCap,
  Utensils,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  Lock,
  UserCheck,
  ArrowRight,
  Copy,
  Check,
  List
} from 'lucide-react';
import { BilLogo } from '../common/BilLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language, Role, SchoolClass, User } from '../../types';
import { NavTab } from '../common/Sidebar';
import { storage } from '../../db/storage';

interface LoginScreenProps {
  onLoginSuccess?: (targetTab: NavTab) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [classesList] = useState<SchoolClass[]>(() => storage.getClasses());
  const [usersList] = useState<User[]>(() => storage.getUsers());
  const [selectedClassTab, setSelectedClassTab] = useState<string>('cls-7a');
  const [showAllCredentialsModal, setShowAllCredentialsModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const handleIinChange = (val: string) => {
    // Digits only, max 12
    const clean = val.replace(/\D/g, '').slice(0, 12);
    setIin(clean);
  };

  const executeLogin = (targetIin: string, targetPass: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(targetIin, targetPass);
      setIsLoading(false);

      if (result.success && result.user) {
        // Route according to assigned role
        let targetTab: NavTab = 'dashboard';
        if (result.user.role === 'ADMINISTRATOR') {
          targetTab = 'settings';
        } else if (result.user.role === 'EDUCATOR') {
          targetTab = 'self_study';
        } else if (result.user.role === 'CLASS_TEACHER') {
          targetTab = 'dashboard';
        } else if (result.user.role === 'CAFETERIA_STAFF') {
          targetTab = 'meals';
        }
        if (onLoginSuccess) {
          onLoginSuccess(targetTab);
        }
      } else {
        setError(result.message || 'Жүйеге кіру мүмкін болмады. Деректерді тексеріңіз.');
      }
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iin.trim()) {
      setError('12 таңбалы ЖСН (ИИН) енгізіңіз');
      return;
    }
    executeLogin(iin, password);
  };

  const handleQuickFill = (presetIin: string, presetPass: string) => {
    setIin(presetIin);
    setPassword(presetPass);
    executeLogin(presetIin, presetPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4338CA]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#075C42]/20 blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <BilLogo className="w-10 h-10 drop-shadow-lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                BIL Dormitory
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4338CA] text-white border border-indigo-400/30">
                Арыс БІЛ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Өзін-өзі дайындық және жатақхана мониторинг порталы
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-[#1E293B]/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                language === l.code
                  ? 'bg-[#4338CA] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{l.flag}</span>
              <span className="uppercase text-[11px]">{l.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8 z-10">
        {/* Left Column: Login Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-[#1E293B]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Авторизация</span>
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Жүйеге кіру
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Қызметкердің 12 таңбалы ЖСН (ИИН) мен берілген құпиясөзін енгізіңіз
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs font-bold text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    12 таңбалы ЖСН (ИИН) логині
                  </label>
                  <span className={`text-[10px] font-mono ${iin.length === 12 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {iin.length}/12 таңба
                  </span>
                </div>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={12}
                    value={iin}
                    onChange={(e) => handleIinChange(e.target.value)}
                    placeholder="900101300000"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm font-mono tracking-wider text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Құпиясөз
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Формат: BIL#XXXX
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="BIL#1234"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] hover:from-[#3730A3] hover:to-[#4F46E5] text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Тексерілуде...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Жүйеге кіру</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Master Admin & Class Accounts */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">
                Ресми аккаунттар (Логин & Парольдер)
              </h3>
            </div>
            <button
              onClick={() => setShowAllCredentialsModal(true)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20 transition cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
              <span>Барлық тізім</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Primary Master Admin: Dostonbek Tajihanov */}
            <button
              onClick={() => handleQuickFill('900101300000', 'BIL#1234')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#1E1B4B] hover:from-[#1E293B] hover:to-[#312E81] border-2 border-amber-500/40 hover:border-amber-400 text-left transition group shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white group-hover:text-amber-300 transition">
                        Достонбек Тажиханов
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                        Жатақхана меңгерушісі
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Логин (ЖСН): <span className="text-amber-300 font-bold">900101300000</span> • Құпиясөз: <span className="text-slate-100 font-bold">BIL#1234</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <span>1-басумен кіру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>

            {/* Class Accounts Selector Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#1E293B]/90 border border-slate-700/80 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  Сыныпты таңдаңыз (Тәрбиеші & Сынып жетекші):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">7 сынып</span>
              </div>

              {/* Class Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {classesList.map((c) => {
                  const isSelected = selectedClassTab === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassTab(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#4338CA] text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Class Staff Cards */}
              {(() => {
                const currentCls = classesList.find((c) => c.id === selectedClassTab) || classesList[0];
                const edu = usersList.find(
                  (u) =>
                    u.role === 'EDUCATOR' &&
                    (u.assignedClassIds?.includes(currentCls.id) || u.id === currentCls.educatorId)
                );
                const teacher = usersList.find(
                  (u) =>
                    u.role === 'CLASS_TEACHER' &&
                    (u.assignedClassIds?.includes(currentCls.id) || u.id === currentCls.classTeacherId)
                );

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Educator Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {currentCls.name} Тәрбиешісі
                          </span>
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="text-xs font-black text-white mt-1.5">
                          {edu ? edu.name : 'Тәрбиеші бекітілмеген'}
                        </h4>
                        {edu && (
                          <div className="space-y-1 mt-2 text-[11px] font-mono text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">ЖСН:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-emerald-300">{edu.iin}</span>
                                <button
                                  onClick={() => copyText(edu.iin || '', `iin-${edu.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="Көшіру"
                                >
                                  {copiedKey === `iin-${edu.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Пароль:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-white">{edu.password}</span>
                                <button
                                  onClick={() => copyText(edu.password || '', `pass-${edu.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="Көшіру"
                                >
                                  {copiedKey === `pass-${edu.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {edu && (
                        <button
                          onClick={() => handleQuickFill(edu.iin || '', edu.password || '')}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Тәрбиеші болып кіру</span>
                        </button>
                      )}
                    </div>

                    {/* Class Teacher Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {currentCls.name} Сынып жетекшісі
                          </span>
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                        </div>
                        <h4 className="text-xs font-black text-white mt-1.5">
                          {teacher ? teacher.name : 'Жетекші бекітілмеген'}
                        </h4>
                        {teacher && (
                          <div className="space-y-1 mt-2 text-[11px] font-mono text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">ЖСН:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-blue-300">{teacher.iin}</span>
                                <button
                                  onClick={() => copyText(teacher.iin || '', `iin-${teacher.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="Көшіру"
                                >
                                  {copiedKey === `iin-${teacher.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Пароль:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-white">{teacher.password}</span>
                                <button
                                  onClick={() => copyText(teacher.password || '', `pass-${teacher.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="Көшіру"
                                >
                                  {copiedKey === `pass-${teacher.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {teacher && (
                        <button
                          onClick={() => handleQuickFill(teacher.iin || '', teacher.password || '')}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Жетекші болып кіру</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Official BIL Security Info */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/60 border border-slate-700/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Сынып оқшаулау & Құпиялылық ережесі:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Әр тәрбиеші мен сынып жетекші тек өзіне бекітілген сынып оқушыларын көріп, 26 оқушыға дейін тіркеп, өшіре алады. Жүйеге кіргенде әр қызметкердің аты-жөні мен сыныбы жоғарғы мәзірде шығады.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Accounts Modal */}
      {showAllCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#1E293B] rounded-3xl p-6 border border-slate-700 shadow-2xl text-left max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Барлық сыныптардың логин және құпиясөздері
                  </h3>
                  <p className="text-xs text-slate-400">
                    Арыс БІЛ 7–11 сынып тәрбиешілері мен сынып жетекшілері
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllCredentialsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-800 py-2 space-y-2 flex-1 pr-1">
              {classesList.map((cls) => {
                const edu = usersList.find(
                  (u) =>
                    u.role === 'EDUCATOR' &&
                    (u.assignedClassIds?.includes(cls.id) || u.id === cls.educatorId)
                );
                const teacher = usersList.find(
                  (u) =>
                    u.role === 'CLASS_TEACHER' &&
                    (u.assignedClassIds?.includes(cls.id) || u.id === cls.classTeacherId)
                );

                return (
                  <div key={cls.id} className="pt-3 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#4338CA] text-white text-xs font-black">
                        {cls.name} сыныбы
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Educator */}
                      {edu && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-emerald-400">Тәрбиеші: {edu.name}</div>
                            <div className="font-mono text-[11px] text-slate-300 mt-0.5">
                              ЖСН: <span className="text-emerald-300">{edu.iin}</span> • Пароль: {edu.password}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowAllCredentialsModal(false);
                              handleQuickFill(edu.iin || '', edu.password || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition ml-2 shrink-0 cursor-pointer"
                          >
                            Кіру
                          </button>
                        </div>
                      )}

                      {/* Teacher */}
                      {teacher && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-blue-400">Жетекші: {teacher.name}</div>
                            <div className="font-mono text-[11px] text-slate-300 mt-0.5">
                              ЖСН: <span className="text-blue-300">{teacher.iin}</span> • Пароль: {teacher.password}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowAllCredentialsModal(false);
                              handleQuickFill(teacher.iin || '', teacher.password || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition ml-2 shrink-0 cursor-pointer"
                          >
                            Кіру
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowAllCredentialsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 BIL Dormitory • Арыс «Білім-Инновация» лицей-интернаты</span>
        <span className="font-mono text-[11px]">ARYS BIL STUDY TRACKER • PWA v2.0</span>
      </div>
    </div>
  );
};
