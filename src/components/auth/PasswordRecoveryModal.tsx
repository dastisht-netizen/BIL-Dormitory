import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { storage } from '../../db/storage';
import { User } from '../../types';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string | null;
  onPasswordResetSuccess?: (user: User) => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  initialToken,
  onPasswordResetSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Recovery link details after request
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(initialToken || null);
  const [tokenUser, setTokenUser] = useState<User | null>(null);

  // New password inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setActiveToken(initialToken);
      const check = storage.getResetTokenInfo(initialToken);
      if (check.valid && check.user) {
        setTokenUser(check.user);
        setStep('reset');
      } else {
        setError(check.message || 'Жарамсыз немесе мерзімі өткен сілтеме.');
        setStep('request');
      }
    }
  }, [initialToken]);

  if (!isOpen) return null;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = storage.requestPasswordReset(identifier);
      setIsLoading(false);

      if (res.success && res.resetToken && res.resetLink) {
        setGeneratedLink(res.resetLink);
        setTargetEmail(res.email || identifier);
        setActiveToken(res.resetToken);
        setStep('sent');
      } else {
        setError(res.message || 'Құпиясөзді қалпына келтіру сұранысы орындалмады.');
      }
    }, 350);
  };

  const handleProceedToReset = () => {
    if (activeToken) {
      const check = storage.getResetTokenInfo(activeToken);
      if (check.valid && check.user) {
        setTokenUser(check.user);
        setStep('reset');
      } else {
        setError(check.message || 'Сілтеме жарамсыз.');
      }
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Құпиясөз кемінде 6 таңбадан тұруы тиіс.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Құпиясөздер бір-біріне сәйкес келмейді. Қайта тексеріңіз.');
      return;
    }

    if (!activeToken) {
      setError('Қалпына келтіру токені табылмады.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = storage.resetPasswordWithToken(activeToken, newPassword);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessNotice(res.message);
        setTimeout(() => {
          if (onPasswordResetSuccess) {
            onPasswordResetSuccess(res.user!);
          }
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Құпиясөзді сақтау мүмкін болмады.');
      }
    }, 400);
  };

  const copyResetLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-6 sm:p-7 border border-slate-700 shadow-2xl text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {step === 'reset' ? 'Жаңа құпиясөз орнату' : 'Құпиясөзді қалпына келтіру'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 'reset'
                  ? 'Өзіңізге ыңғайлы жаңа құпиясөз жазыңыз'
                  : 'Supabase Auth қауіпсіз қалпына келтіру жүйесі'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs font-bold text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* STEP 1: Request Password Recovery Link */}
        {step === 'request' && (
          <form onSubmit={handleRequestSubmit} className="mt-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Тіркелген электрондық поштаңызды немесе 12 таңбалы ЖСН (ИИН) енгізіңіз. Жүйе сізге құпиясөзді қалпына келтірудің ресми сілтемесін жібереді.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Электрондық пошта немесе 12 таңбалы ЖСН
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="мысалы, serik@bil-arys.edu.kz немесе 900101300000"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Сілтеме тек мектептің ресми доменіне бағытталады және бұрынғы рөлдер мен сынып деректерін толық сақтайды.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Болдырмау
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] hover:from-[#3730A3] hover:to-[#4F46E5] text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Жіберілуде...</span>
                ) : (
                  <>
                    <span>Сілтемені жіберу</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Sent Confirmation & Action */}
        {step === 'sent' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Қалпына келтіру сілтемесі дайын!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Сілтеме <span className="font-bold text-emerald-300">{targetEmail}</span> электрондық поштасына тіркелді. Сіз қазір бірден жаңа құпиясөз орната аласыз немесе сілтемені көшіріп ала аласыз.
              </p>
            </div>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Ресми қауіпсіз сілтеме (2 сағат жарамды):</span>
                  <button
                    onClick={copyResetLink}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Көшірілді!' : 'Көшіру'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-20 overflow-y-auto">
                  {generatedLink}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Жабу
              </button>
              <button
                type="button"
                onClick={handleProceedToReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Жаңа құпиясөзді қазір енгізу</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Set New Password Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="mt-5 space-y-4">
            {tokenUser && (
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">{tokenUser.name}</span>
                    <span className="text-[10px] text-indigo-300 font-mono">{tokenUser.email}</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500 text-white">
                  {tokenUser.role === 'ADMINISTRATOR'
                    ? 'Әкімші'
                    : tokenUser.role === 'EDUCATOR'
                    ? 'Тәрбиеші'
                    : tokenUser.role === 'CLASS_TEACHER'
                    ? 'Сынып жетекшісі'
                    : 'Қызметкер'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Жаңа құпиясөз (кемінде 6 таңба)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Жаңа құпиясөзді енгізіңіз"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Жаңа құпиясөзді қайталаңыз
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Құпиясөзді қайта теріңіз"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Болдырмау
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Сақталуда...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Сақтау және кіру</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
