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
  ArrowRight
} from 'lucide-react';
import { BilLogo } from '../common/BilLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language, Role } from '../../types';
import { NavTab } from '../common/Sidebar';

interface LoginScreenProps {
  onLoginSuccess?: (targetTab: NavTab) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        {/* Right Column: Pre-configured Test Accounts Quick Access Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">
                Тексеруге арналған аккаунттар (1-басумен кіру)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              Дайын логиндер
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Төмендегі ресми сынақ аккаунттарының бірін басып, жүйеге дереу кіріп толық функционалды тексеруге болады:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {/* Account 1: Dormitory Manager */}
            <button
              onClick={() => handleQuickFill('900101300000', 'BIL#1234')}
              className="p-4 rounded-2xl bg-[#1E293B]/70 hover:bg-[#1E293B] border border-amber-500/30 hover:border-amber-400 text-left transition group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                        Достонбек Тажиханов
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-500 text-slate-950">
                        Меңгеруші (Админ)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ЖСН: <span className="text-amber-300 font-bold">900101300000</span> • Құпиясөз: <span className="text-slate-200">BIL#1234</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Кіру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 pl-13">
                Мүмкіндік: Қызметкерлерді тіркеу (ИИН + BIL# құпиясөз), сыныптар, оқу жылы, толық әкімшілік.
              </p>
            </button>

            {/* Account 2: Educator */}
            <button
              onClick={() => handleQuickFill('900512300451', 'BIL#7821')}
              className="p-4 rounded-2xl bg-[#1E293B]/70 hover:bg-[#1E293B] border border-emerald-500/30 hover:border-emerald-400 text-left transition group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-emerald-300 transition">
                        Ерлан Бақытұлы
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-500 text-slate-950">
                        Тәрбиеші (Educator)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ЖСН: <span className="text-emerald-300 font-bold">900512300451</span> • Құпиясөз: <span className="text-slate-200">BIL#7821</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Кіру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 pl-13">
                Мүмкіндік: 7A сыныбын басқару (26 оқушы шегі), кешкі 3-қадамдық дайындық (19:00-21:00).
              </p>
            </button>

            {/* Account 3: Class Teacher */}
            <button
              onClick={() => handleQuickFill('850922400123', 'BIL#3490')}
              className="p-4 rounded-2xl bg-[#1E293B]/70 hover:bg-[#1E293B] border border-blue-500/30 hover:border-blue-400 text-left transition group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-blue-300 transition">
                        Айнұр Серікқызы
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-blue-500 text-slate-950">
                        Сынып жетекшісі
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ЖСН: <span className="text-blue-300 font-bold">850922400123</span> • Құпиясөз: <span className="text-slate-200">BIL#3490</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Кіру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 pl-13">
                Мүмкіндік: 7A сыныбының сабақ кестесін жасау/сақтау (Дүйсенбі–Жұма) және оқушылар үлгерімі.
              </p>
            </button>

            {/* Account 4: Cafeteria Staff */}
            <button
              onClick={() => handleQuickFill('830516401056', 'BIL#9182')}
              className="p-4 rounded-2xl bg-[#1E293B]/70 hover:bg-[#1E293B] border border-purple-500/30 hover:border-purple-400 text-left transition group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-purple-300 transition">
                        Баян Әбдікерімқызы
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-purple-500 text-slate-950">
                        Асхана қызметкері
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ЖСН: <span className="text-purple-300 font-bold">830516401056</span> • Құпиясөз: <span className="text-slate-200">BIL#9182</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Кіру</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 pl-13">
                Мүмкіндік: Демалыс күнгі 8 ас мәзіріне оқушылардың тіркелуін қадағалау.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 BIL Dormitory • Арыс «Білім-Инновация» лицей-интернаты</span>
        <span className="font-mono text-[11px]">ARYS BIL STUDY TRACKER • PWA v2.0</span>
      </div>
    </div>
  );
};
