import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  UserCheck,
  LogIn,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { BilLogo } from '../common/BilLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../types';
import { NavTab } from '../common/Sidebar';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';

interface LoginScreenProps {
  onLoginSuccess?: (targetTab: NavTab) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password Recovery state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') && hash.includes('token=')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const token = params.get('token');
        if (token) {
          setRecoveryToken(token);
          setShowRecoveryModal(true);
        }
      }
    }
  }, []);

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
      setError('12 таңбалы ЖСН (ИИН) немесе электрондық поштаны енгізіңіз');
      return;
    }
    if (!password.trim()) {
      setError('Құпиясөзді енгізіңіз');
      return;
    }
    executeLogin(iin, password);
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
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
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
        {/* Left Column: Secure Login Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-[#1E293B]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Жеке аккаунт арқылы кіру</span>
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Жүйеге кіру
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Қызметкердің 12 таңбалы ЖСН (ИИН) немесе поштасы мен құпиясөзін енгізіңіз
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
                    Логин (12 таңбалы ЖСН немесе Email)
                  </label>
                  <span className={`text-[10px] font-mono ${iin.length === 12 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {/^\d+$/.test(iin) ? `${iin.length}/12 таңба` : ''}
                  </span>
                </div>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={iin}
                    onChange={(e) => handleIinChange(e.target.value)}
                    placeholder="ЖСН (12 сан) немесе email"
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
                    Жеке берілген құпиясөз
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    title={showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Button */}
              <div className="flex items-center justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer py-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Құпиясөзді ұмыттыңыз ба?</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] hover:from-[#3730A3] hover:to-[#4F46E5] text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
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

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Құпиясөзді ұмытқан жағдайда жоғарыдағы батырма арқылы сілтеме алып, өзіңіз қалпына келтіре аласыз немесе жатақхана меңгерушісіне хабарласыңыз.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Information & Security Standards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E293B]/90 to-[#1E1B4B]/90 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-indigo-400 tracking-wider">
                  Ресми цифрлық платформа
                </span>
                <h3 className="text-lg font-black text-white">
                  Арыс «Білім-Инновация» лицейі
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Жатақхана мен кешкі өзін-өзі дайындық мониторингі, оқушылар сабағы мен тәртібін бақылаудың орталықтандырылған платформасы.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Жеке аккаунт пен сыныпты автоматты анықтау
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Тәрбиеші мен сынып жетекшісі жеке ЖСН арқылы кіргенде өзіне бекітілген сынып автоматты түрде ашылады.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Қатаң сынып оқшаулауы (RBAC)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Қызметкер тек өз сыныбының оқушылары мен есептерін көреді. Басқа сыныптар мен қызметкерлердің мәліметтері қорғалған.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Құпиясөзді қауіпсіз қалпына келтіру
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Құпиясөздер ешқашан ашық сақталмайды. Пайдаланушы поштасына ресми сілтеме алып, жаңа құпиясөз орната алады.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-indigo-300/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Сыныптар мен қызметкерлерді мектеп әкімшісі басқарады</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Recovery Modal */}
      <PasswordRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => {
          setShowRecoveryModal(false);
          setRecoveryToken(null);
          if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
            window.location.hash = '';
          }
        }}
        initialToken={recoveryToken}
        onPasswordResetSuccess={(updatedUser) => {
          setIin(updatedUser.iin || updatedUser.email);
          setPassword(updatedUser.password || '');
          executeLogin(updatedUser.iin || updatedUser.email, updatedUser.password || '');
        }}
      />

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 BIL Dormitory • Арыс «Білім-Инновация» лицей-интернаты</span>
        <span className="font-mono text-[11px]">ARYS BIL STUDY TRACKER • SECURE PORTAL</span>
      </div>
    </div>
  );
};
