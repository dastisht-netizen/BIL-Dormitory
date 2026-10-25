import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  FileSpreadsheet,
  FileText,
  Users,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ALL_MEAL_PERIODS, MealPeriod, SchoolClass, Student, WeekendMealRecord } from '../../types';
import { storage } from '../../db/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToExcel, exportToPdfReport } from '../../utils/exportUtils';

export const CafeteriaDashboard: React.FC = () => {
  const { t, getMealName } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<MealPeriod | 'all'>('all');
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -3 : 4);
    const thurs = new Date(d.setDate(diff));
    return thurs.toISOString().split('T')[0];
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [mealsData, setMealsData] = useState<WeekendMealRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setClasses(storage.getClasses());
    setStudents(storage.getStudents().filter((s) => s.status === 'active'));
    setMealsData(storage.getWeekendMeals().filter((m) => m.weekStartDate === weekStartDate));
  }, [weekStartDate]);

  // Compute counts for each meal period
  const getMealPortionCount = (meal: MealPeriod, classId = 'all'): number => {
    return mealsData.filter((m) => {
      if (classId !== 'all' && m.classId !== classId) return false;
      return !!m.meals[meal];
    }).length;
  };

  // Filtered student list for cafeteria verification
  const studentRows = students
    .filter((st) => selectedClassId === 'all' || st.classId === selectedClassId)
    .filter((st) => st.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      const record = mealsData.find((m) => m.studentId === st.id);
      return {
        student: st,
        className: cls?.name || '',
        meals: record?.meals || ({} as Record<MealPeriod, boolean>),
      };
    })
    .filter((item) => {
      if (selectedMeal === 'all') return true;
      return !!item.meals[selectedMeal];
    });

  const handleExportExcel = () => {
    const exportRows = studentRows.map(({ student, className, meals }) => {
      const row: Record<string, any> = {
        'Оқушы ID': student.id,
        'Аты-жөні': student.fullName,
        'Сынып': className,
      };
      ALL_MEAL_PERIODS.forEach((p) => {
        row[getMealName(p)] = meals[p] ? '1' : '0';
      });
      return row;
    });

    exportToExcel(
      [{ sheetName: 'Cafeteria_Meals', data: exportRows }],
      `Cafeteria_Portions_${weekStartDate}`
    );
  };

  const handleExportPdf = () => {
    const headers = ['Оқушы', 'Сынып', 'Жұм Кеш', 'Сен Таң', 'Сен Түс', 'Сен Кеш', 'Жек Таң', 'Жек Түс', 'Жек Кеш', 'Дүй Таң'];
    const rows = studentRows.map(({ student, className, meals }) => [
      student.fullName,
      className,
      meals.friday_dinner ? 'Иә' : '—',
      meals.saturday_breakfast ? 'Иә' : '—',
      meals.saturday_lunch ? 'Иә' : '—',
      meals.saturday_dinner ? 'Иә' : '—',
      meals.sunday_breakfast ? 'Иә' : '—',
      meals.sunday_lunch ? 'Иә' : '—',
      meals.sunday_dinner ? 'Иә' : '—',
      meals.monday_breakfast ? 'Иә' : '—',
    ]);

    exportToPdfReport({
      title: 'Асхана: Демалыс күндеріне ас порцияларының тізімдемесі',
      subtitle: `Апта күні: ${weekStartDate} | Барлық тіркелген оқушылар саны: ${studentRows.length}`,
      headers,
      rows,
      fileName: `Cafeteria_Report_${weekStartDate}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Асхана қызметінің панелі</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Демалыс күнгі тағам тапсырысы мен порциялар
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Асханаға нақты қанша тамақ дайындау қажеттігін сыныптар бойынша есептеу
          </p>
        </div>

        {/* Filter controls */}
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
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Апта күні</label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-4">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel жүктеу</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span>PDF жүктеу</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Meal Periods Summary Cards */}
      <div>
        <h3 className="text-sm font-extrabold text-[#24342D] mb-3">
          8 Мезгіл бойынша дайындалатын порциялар саны
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {ALL_MEAL_PERIODS.map((meal) => {
            const count = getMealPortionCount(meal, selectedClassId);
            const isSelected = selectedMeal === meal;
            return (
              <button
                key={meal}
                onClick={() => setSelectedMeal(isSelected ? 'all' : meal)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#075C42] text-white border-[#075C42] shadow-md scale-102'
                    : 'bg-white text-[#24342D] border-gray-100 hover:border-gray-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {getMealName(meal)}
                  </span>
                  <UtensilsCrossed className={`w-4 h-4 ${isSelected ? 'text-[#FFE9A8]' : 'text-purple-600'}`} />
                </div>
                <div className={`text-2xl font-black mt-2 ${isSelected ? 'text-[#FFE9A8]' : 'text-[#075C42]'}`}>
                  {count} <span className="text-xs font-semibold">порция</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Student List View */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#24342D]">
              Тамақтануға жазылған оқушылар тізімі ({studentRows.length})
            </h3>
            {selectedMeal !== 'all' && (
              <span className="text-xs text-purple-700 font-semibold block mt-0.5">
                Сүзгі: {getMealName(selectedMeal)}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] w-56 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F8FAF9]">
                <th className="py-3 px-3 font-extrabold text-[#24342D]">Оқушы</th>
                <th className="py-3 px-2 font-bold text-gray-500 text-center">Сынып</th>
                {ALL_MEAL_PERIODS.map((p) => (
                  <th key={p} className="py-3 px-2 font-bold text-center text-[10px] text-gray-600">
                    {getMealName(p).split(' ')[0]} <br />
                    {getMealName(p).split(' ')[1]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentRows.map(({ student, className, meals }) => (
                <tr key={student.id} className="hover:bg-[#F8FAF9]/80 transition">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#24342D] block">{student.fullName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{student.id}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-gray-500">
                    {className}
                  </td>
                  {ALL_MEAL_PERIODS.map((p) => (
                    <td key={p} className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-lg text-center leading-6 font-bold text-xs ${
                          meals[p] ? 'bg-[#E6F4EA] text-[#075C42]' : 'bg-gray-100 text-gray-300'
                        }`}
                      >
                        {meals[p] ? '✓' : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
