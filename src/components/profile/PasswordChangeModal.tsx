import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../db/storage';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleGenerateBilPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `BIL#${randomNum}`;
    setNewPassword(generated);
    setConfirmPassword(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate current password
    if (currentUser.password && currentPasswordInput.trim() !== currentUser.password.trim()) {
      setError('Қазіргі құпиясөз қате енгізілді. Қайталап тексеріңіз.');
      return;
    }

    // Validate new password length
    if (newPassword.trim().length < 6) {
      setError('Жаңа құпиясөз кемінде 6 таңбадан тұруы қажет (мысалы, BIL#8492).');
      return;
    }

    // Validate confirmation
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('Жаңа құпиясөз бен растау құпиясөзі сәйкес келмейді!');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      try {
        updateCurrentUserProfile({
          password: newPassword.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || currentUser.email,
        });

        // Add audit log
        storage.addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'UPDATE_PASSWORD',
          entityType: 'user',
          entityId: currentUser.id,
          previousValue: '***',
          newValue: '***',
          timestamp: new Date().toISOString(),
          details: `«${currentUser.name}» өз құпиясөзін сәтті жаңартты`,
        });

        setIsSaving(false);
        setSuccess('Құпиясөзіңіз сәтті өзгертілді! Келесі жолы жаңа құпиясөзбен кіресіз.');
        if (onSuccess) {
          onSuccess('Құпиясөз сәтті өзгертілді!');
        }

        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        setIsSaving(false);
        setError('Құпиясөзді сақтау кезінде қате орын алды.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 text-left text-slate-900 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4338CA] flex items-center justify-center font-black shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Құпиясөзді өзгерту / Профиль
            </h3>
            <p className="text-xs text-gray-500">
              {currentUser.name} • ЖСН (Логин): <span className="font-mono font-bold text-slate-800">{currentUser.iin || 'ЖСН көрсетілмеген'}</span>
            </p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-indigo-900">Жеке қауіпсіздік ережесі:</p>
            <p className="text-indigo-800 text-[11px] mt-0.5">
              Жатақхана меңгерушісі берген уақытша құпиясөзді жеке, тек өзіңіз білетін құпиясөзге ауыстыру ұсынылады.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Қазіргі құпиясөз <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Қазіргі уақытша құпиясөзді енгізіңіз"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Жаңа құпиясөз <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateBilPassword}
                className="text-[11px] font-bold text-[#4338CA] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>BIL# үлгісімен жасау</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Кемінде 6 таңба (мысалы, BIL#7821 немесе жеке құпиясөз)"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Жаңа құпиясөзді қайталаңыз <span className="text-rose-500">*</span>
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Жаңа құпиясөзді растаңыз"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent font-mono"
            />
          </div>

          {/* Optional Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Телефон нөмірі (міндетті емес)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 701 000 0000"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                />
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Электрондық пошта (міндетті емес)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@bil-arys.edu.kz"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 transition"
            >
              Болдырмау
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Сақталуда...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Құпиясөзді сақтау</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
