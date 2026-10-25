import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ALL_MEAL_PERIODS, MealPeriod, SchoolClass, Student, WeekendMealRecord } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const WeekendMealGrid: React.FC = () => {
  const { currentUser, isAdmin, isCafeteria } = useAuth();
  const { t, getMealName } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    // Current week Thursday
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -3 : 4);
    const thurs = new Date(d.setDate(diff));
    return thurs.toISOString().split('T')[0];
  });

  const [mealSelections, setMealSelections] = useState<Record<string, Record<MealPeriod, boolean>>>({});
  const [inspectModal, setInspectModal] = useState<{ meal: MealPeriod; students: Student[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const allClasses = storage.getClasses();
    setClasses(allClasses);
  }, []);

  useEffect(() => {
    const allStudents = storage.getStudents().filter((s) => s.status === 'active');
    const filteredStudents = selectedClassId === 'all'
      ? allStudents
      : allStudents.filter((s) => s.classId === selectedClassId);
    setStudents(filteredStudents);

    // Load meals for this week
    const existing = storage.getWeekendMeals().filter((m) => m.weekStartDate === weekStartDate);
    const map: Record<string, Record<MealPeriod, boolean>> = {};

    filteredStudents.forEach((st) => {
      const rec = existing.find((r) => r.studentId === st.id);
      map[st.id] = {
        friday_dinner: rec ? !!rec.meals.friday_dinner : false,
        saturday_breakfast: rec ? !!rec.meals.saturday_breakfast : false,
        saturday_lunch: rec ? !!rec.meals.saturday_lunch : false,
        saturday_dinner: rec ? !!rec.meals.saturday_dinner : false,
        sunday_breakfast: rec ? !!rec.meals.sunday_breakfast : false,
        sunday_lunch: rec ? !!rec.meals.sunday_lunch : false,
        sunday_dinner: rec ? !!rec.meals.sunday_dinner : false,
        monday_breakfast: rec ? !!rec.meals.monday_breakfast : false,
      };
    });

    setMealSelections(map);
  }, [selectedClassId, weekStartDate]);

  const toggleMeal = (studentId: string, meal: MealPeriod) => {
    const updated = {
      ...mealSelections,
      [studentId]: {
        ...(mealSelections[studentId] || {}),
        [meal]: !mealSelections[studentId]?.[meal],
      },
    };
    setMealSelections(updated);
  };

  const toggleAllForStudent = (studentId: string, value: boolean) => {
    const meals: Record<MealPeriod, boolean> = {} as any;
    ALL_MEAL_PERIODS.forEach((m) => {
      meals[m] = value;
    });
    setMealSelections((prev) => ({ ...prev, [studentId]: meals }));
  };

  const handleSelectAllInView = () => {
    const updated: Record<string, Record<MealPeriod, boolean>> = {};
    students.forEach((st) => {
      updated[st.id] = {} as any;
      ALL_MEAL_PERIODS.forEach((m) => {
        updated[st.id][m] = true;
      });
    });
    setMealSelections(updated);
  };

  const handleClearAllInView = () => {
    const updated: Record<string, Record<MealPeriod, boolean>> = {};
    students.forEach((st) => {
      updated[st.id] = {} as any;
      ALL_MEAL_PERIODS.forEach((m) => {
        updated[st.id][m] = false;
      });
    });
    setMealSelections(updated);
  };

  const handleSaveMeals = () => {
    const recordsToSave: WeekendMealRecord[] = students.map((st) => ({
      id: `meal-${st.id}-${weekStartDate}`,
      studentId: st.id,
      classId: st.classId,
      weekStartDate,
      meals: mealSelections[st.id] || ({} as any),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
      isFinalized: true,
    }));

    storage.bulkSaveWeekendMeals(recordsToSave, currentUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Compute Meal Column Totals
  const getMealTotal = (meal: MealPeriod) => {
    return students.filter((st) => mealSelections[st.id]?.[meal]).length;
  };

  // Open modal showing student names who signed up for this specific meal
  const handleOpenMealInspect = (meal: MealPeriod) => {
    const registered = students.filter((st) => mealSelections[st.id]?.[meal]);
    setInspectModal({ meal, students: registered });
  };

  // Export handlers
  const handleExportExcel = () => {
    const data = students.map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      const row: Record<string, any> = {
        'Оқушы ID': st.id,
        'Аты-жөні': st.fullName,
        'Сынып': cls?.name || '',
      };
      ALL_MEAL_PERIODS.forEach((m) => {
        row[getMealName(m)] = mealSelections[st.id]?.[m] ? '+' : '-';
      });
      return row;
    });

    exportToExcel(
      [{ sheetName: `Meals_${weekStartDate}`, data }],
      `Arys_BIL_Weekend_Meals_${weekStartDate}`
    );
  };

  const handleExportPdf = () => {
    const headers = ['Оқушы', 'Сынып', 'Жұм Кеш', 'Сен Таң', 'Сен Түс', 'Сен Кеш', 'Жек Таң', 'Жек Түс', 'Жек Кеш', 'Дүй Таң'];
    const rows = students.map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      const m = mealSelections[st.id] || {};
      return [
        st.fullName,
        cls?.name || '',
        m.friday_dinner ? '+' : '—',
        m.saturday_breakfast ? '+' : '—',
        m.saturday_lunch ? '+' : '—',
        m.saturday_dinner ? '+' : '—',
        m.sunday_breakfast ? '+' : '—',
        m.sunday_lunch ? '+' : '—',
        m.sunday_dinner ? '+' : '—',
        m.monday_breakfast ? '+' : '—',
      ];
    });

    exportToPdfReport({
      title: 'Демалыс күнгі тамақтану ведомосі (Weekend Meals)',
      subtitle: `Бейсенбілік растау аптасы: ${weekStartDate} | Оқушы саны: ${students.length}`,
      headers,
      rows,
      fileName: `Arys_BIL_Meals_${weekStartDate}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <UtensilsCrossed className="w-4 h-4" />
            <span>{t.thursdayNotice}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Демалыс күнгі 8-мезгіл тамақтану тізімі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Жұма кешкі астан дүйсенбі таңғы асқа дейінгі нақты тамақтану тапсырысы
          </p>
        </div>

        {/* Filter controls & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterClass}</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            >
              <option value="all">{t.filterAllClasses}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} сыныбы
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Апта күні (Бейсенбі)</label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5"
              title="Excel жүктеу"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5"
              title="PDF жүктеу"
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Toolbar */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAllInView}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E6F4EA] text-[#075C42] hover:bg-[#cbe6d4] transition"
          >
            {t.selectAll}
          </button>
          <button
            onClick={handleClearAllInView}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            {t.clearAll}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-[#075C42] flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Тізім сәтті сақталды!
            </span>
          )}
          <button
            onClick={handleSaveMeals}
            className="px-6 py-2 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-[#FFE9A8]" />
            <span>Тізімді бекіту және сақтау</span>
          </button>
        </div>
      </div>

      {/* 8-Meals Matrix Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8FAF9]">
              <th className="py-3 px-3 font-extrabold text-[#24342D] min-w-[180px]">Оқушының аты-жөні</th>
              <th className="py-3 px-2 font-bold text-gray-500 text-center w-16">Сынып</th>
              <th className="py-3 px-2 font-bold text-gray-500 text-center w-24">Барлығы</th>
              {ALL_MEAL_PERIODS.map((meal) => (
                <th key={meal} className="py-3 px-2 font-bold text-center min-w-[90px]">
                  <div className="text-[11px] text-[#24342D] leading-tight">{getMealName(meal)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((st) => {
              const cls = classes.find((c) => c.id === st.classId);
              const m = mealSelections[st.id] || ({} as any);
              const totalForStudent = ALL_MEAL_PERIODS.filter((p) => m[p]).length;

              return (
                <tr key={st.id} className="hover:bg-[#F8FAF9]/80 transition">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#24342D] block">{st.fullName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{st.id}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-gray-500">
                    {cls?.name}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleAllForStudent(st.id, true)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#E6F4EA] text-[#075C42] font-bold hover:bg-[#cdecd8]"
                        title="Барлығын белгілеу"
                      >
                        +
                      </button>
                      <span className="text-[11px] font-bold text-gray-700 w-5">
                        {totalForStudent}
                      </span>
                      <button
                        onClick={() => toggleAllForStudent(st.id, false)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                        title="Тазарту"
                      >
                        -
                      </button>
                    </div>
                  </td>

                  {ALL_MEAL_PERIODS.map((meal) => {
                    const isChecked = !!m[meal];
                    return (
                      <td key={meal} className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => toggleMeal(st.id, meal)}
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center mx-auto transition-all ${
                            isChecked
                              ? 'bg-[#138A62] text-white shadow-xs scale-105'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Clickable Total Footer Row */}
          <tfoot>
            <tr className="border-t-2 border-[#075C42] bg-[#E6F4EA]/70 font-extrabold text-[#075C42]">
              <td className="py-3 px-3">
                ЖАЛПЫ ПОРЦИЯЛАР САНЫ
              </td>
              <td className="py-3 px-2 text-center">—</td>
              <td className="py-3 px-2 text-center">—</td>
              {ALL_MEAL_PERIODS.map((meal) => {
                const total = getMealTotal(meal);
                return (
                  <td key={meal} className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleOpenMealInspect(meal)}
                      className="px-2.5 py-1 rounded-xl bg-white text-[#075C42] border border-[#138A62] font-extrabold hover:bg-[#FFE9A8] transition shadow-xs block mx-auto cursor-pointer"
                      title="Осы асты ішетін оқушылар тізімін көру"
                    >
                      {total} порция
                    </button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Inspect Meal Student Names Modal */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#075C42]">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#24342D]">
                    {getMealName(inspectModal.meal)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Тіркелген оқушылар саны: {inspectModal.students.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto flex-1 divide-y divide-gray-100">
              {inspectModal.students.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">
                  Бұл мезгілге ешбір оқушы жазылмаған
                </p>
              ) : (
                inspectModal.students.map((st, idx) => {
                  const cls = classes.find((c) => c.id === st.classId);
                  return (
                    <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-gray-400 font-mono text-[11px]">{idx + 1}.</span>
                        <div>
                          <span className="font-bold text-[#24342D] block">{st.fullName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{st.id}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
                        {cls?.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setInspectModal(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
