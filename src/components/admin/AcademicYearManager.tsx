import React, { useState, useEffect } from 'react';
import {
  Archive,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Users,
  GraduationCap,
  History,
  AlertCircle
} from 'lucide-react';
import { AcademicYear } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AcademicYearManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [newYearName, setNewYearName] = useState('2027–2028');
  const [newStartDate, setNewStartDate] = useState('2027-09-01');
  const [newEndDate, setNewEndDate] = useState('2028-05-25');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    setYears(storage.getAcademicYears());
  }, []);

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      name: newYearName,
      isCurrent: true,
      startDate: newStartDate,
      endDate: newEndDate,
      archived: false,
      quarters: [
        { id: `q1-${Date.now()}`, name: 'I Тоқсан', startDate: `${newStartDate}`, endDate: `${newStartDate.slice(0, 4)}-10-31` },
        { id: `q2-${Date.now()}`, name: 'II Тоқсан', startDate: `${newStartDate.slice(0, 4)}-11-10`, endDate: `${newStartDate.slice(0, 4)}-12-30` },
        { id: `q3-${Date.now()}`, name: 'III Тоқсан', startDate: `${newEndDate.slice(0, 4)}-01-08`, endDate: `${newEndDate.slice(0, 4)}-03-20` },
        { id: `q4-${Date.now()}`, name: 'IV Тоқсан', startDate: `${newEndDate.slice(0, 4)}-04-01`, endDate: `${newEndDate}` },
      ],
    };

    storage.createAcademicYear(newYear, currentUser.id, currentUser.name);
    setYears(storage.getAcademicYears());
    setShowNewModal(false);
    setActionNotice(`Жаңа оқу жылы сәтті ашылды: ${newYearName}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePromoteStudents = () => {
    const res = storage.promoteStudents(currentUser.id, currentUser.name);
    setShowPromoteModal(false);
    setActionNotice(
      `Сәтті! ${res.promoted} оқушы келесі сыныпқа көшірілді, ${res.graduated} 11-сынып оқушысы түлектер мұрағатына ауыстырылды.`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const students = storage.getStudents();
  const activeCount = students.filter((s) => s.status === 'active').length;
  const graduatedCount = students.filter((s) => s.status === 'graduated').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <Archive className="w-4 h-4" />
            <span>Оқу жылын жоспарлау және мұрағат</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Академиялық оқу жылдары мен оқушыларды көшіру
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Мектептің өткен жылдардағы тарихы сақталып, оқушылар жаңа оқу жылына ресми ауыстырылады
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromoteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-700" />
            <span>{t.promoteStudents}</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFE9A8]" />
            <span>{t.createNewYear}</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center gap-2 text-xs font-bold text-[#075C42] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Ағымдағы оқу жылы</span>
            <Calendar className="w-4 h-4 text-[#075C42]" />
          </div>
          <div className="text-2xl font-extrabold text-[#075C42] mt-2">
            {years.find((y) => y.isCurrent)?.name || '2026–2027'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Белсенді кезең</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Белсенді оқушылар саны</span>
            <Users className="w-4 h-4 text-[#138A62]" />
          </div>
          <div className="text-2xl font-extrabold text-[#138A62] mt-2">{activeCount} оқушы</div>
          <span className="text-[11px] text-gray-400 mt-1 block">7–11 сыныптар аралығында</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Түлектер мұрағаты</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{graduatedCount} түлек</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Тарихта сақталған оқушылар</span>
        </div>
      </div>

      {/* Academic Years List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
        <h3 className="font-extrabold text-base text-[#24342D]">
          Тіркелген оқу жылдары мен кезеңдер
        </h3>

        <div className="space-y-3">
          {years.map((year) => (
            <div
              key={year.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                year.isCurrent
                  ? 'border-[#075C42] bg-[#E6F4EA]/40'
                  : 'border-gray-100 bg-gray-50/60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-[#24342D]">{year.name}</h4>
                  {year.isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#075C42] text-white text-[11px] font-bold">
                      {t.currentYear}
                    </span>
                  )}
                  {year.archived && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[11px] font-bold">
                      Мұрағатталған
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Мерзімі: {year.startDate} — {year.endDate}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {year.quarters.map((q) => (
                    <span key={q.id} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-gray-200 font-semibold text-gray-700">
                      {q.name} ({q.startDate.slice(5)} / {q.endDate.slice(5)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  {year.isCurrent ? 'Қазір қолданыста' : 'Тарихи жазбалар қолжетімді'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Academic Year Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-lg text-[#24342D] pb-3 border-b border-gray-100">
              {t.createNewYear}
            </h3>

            <form onSubmit={handleCreateYear} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Оқу жылы атауы</label>
                <input
                  type="text"
                  required
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  placeholder="2027–2028"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Басталу күні</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Аяқталу күні</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
                >
                  Ашу және сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote Students Confirmation Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#24342D]">
                  {t.promoteStudents}
                </h3>
                <p className="text-xs text-gray-500">
                  Жылдық ауыстыру рәсімі
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 space-y-3">
              <p className="font-medium text-[#24342D]">
                {t.confirmPromotion}
              </p>
              <div className="p-3 rounded-xl bg-[#FFF8E7] border border-[#FFE9A8] text-[#24342D] space-y-1 font-semibold">
                <div>• 7-сыныптар → 8-сыныпқа ауысады</div>
                <div>• 8-сыныптар → 9-сыныпқа ауысады</div>
                <div>• 10-сыныптар → 11-сыныпқа ауысады</div>
                <div>• 11-сыныптар → Түлектер мұрағатына өткізіледі</div>
              </div>
              <p className="text-[11px] text-gray-400">
                Оқушылардың бірегей ID нөмірлері мен бұрынғы тарихы толық сақталады.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Болдырмау
              </button>
              <button
                onClick={handlePromoteStudents}
                className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm"
              >
                Иә, сыныптарды ауыстыру
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
