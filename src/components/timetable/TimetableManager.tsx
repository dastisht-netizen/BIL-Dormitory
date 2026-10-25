import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen
} from 'lucide-react';
import { SchoolClass, Subject, TimetableEntry } from '../../types';
import { storage } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const TimetableManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-7a');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const daysOfWeek = [
    { num: 1, name: 'Дүйсенбі' },
    { num: 2, name: 'Сейсенбі' },
    { num: 3, name: 'Сәрсенбі' },
    { num: 4, name: 'Бейсенбі' },
    { num: 5, name: 'Жұма' },
  ];

  const periods = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    setClasses(storage.getClasses());
    setSubjects(storage.getSubjects());
    setTimetables(storage.getTimetables());
  }, []);

  const classTimetable = timetables.filter((t) => t.classId === selectedClassId);

  const getSubjectForSlot = (day: number, period: number): string => {
    const entry = classTimetable.find((t) => t.dayOfWeek === day && t.periodNumber === period);
    return entry ? entry.subjectId : '';
  };

  const handleSlotChange = (day: number, period: number, subjectId: string) => {
    let updated = [...timetables];
    const existingIndex = updated.findIndex(
      (t) => t.classId === selectedClassId && t.dayOfWeek === day && t.periodNumber === period
    );

    if (subjectId === '') {
      if (existingIndex >= 0) updated.splice(existingIndex, 1);
    } else {
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], subjectId };
      } else {
        updated.push({
          id: `tt-${selectedClassId}-${day}-${period}-${Date.now()}`,
          classId: selectedClassId,
          dayOfWeek: day,
          periodNumber: period,
          subjectId,
        });
      }
    }
    setTimetables(updated);
  };

  const handleSaveTimetable = () => {
    const classEntries = timetables.filter((t) => t.classId === selectedClassId);
    storage.saveTimetables(classEntries, selectedClassId, currentUser.id, currentUser.name);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#138A62]">
            <CalendarDays className="w-4 h-4" />
            <span>Сабақ кестесін басқару</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#075C42] mt-1">
            Сыныптардың апталық оқу кестесі
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Кешкі өзіндік дайындықта келесі күннің пәндері осы кестеге сай автоматты анықталады
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t.filterClass}</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F8FAF9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#138A62] text-[#24342D]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} сыныбы
                </option>
              ))}
            </select>
          </div>

          <div className="pt-5">
            <button
              onClick={handleSaveTimetable}
              className="px-6 py-2.5 rounded-xl bg-[#075C42] text-white text-xs font-bold hover:bg-[#054531] shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FFE9A8]" />
              <span>{t.saveChanges}</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-[#138A62]/30 flex items-center gap-2 text-xs font-bold text-[#075C42] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#138A62]" />
          <span>{selectedClass?.name} сыныбының сабақ кестесі сәтті сақталды!</span>
        </div>
      )}

      {/* Grid Timetable Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8FAF9]">
              <th className="py-3 px-3 font-extrabold text-[#24342D] w-20 text-center">Сабақ №</th>
              {daysOfWeek.map((day) => (
                <th key={day.num} className="py-3 px-3 font-extrabold text-[#24342D] min-w-[170px]">
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {periods.map((period) => (
              <tr key={period} className="hover:bg-[#F8FAF9]/80 transition">
                <td className="py-3 px-3 text-center font-extrabold text-gray-500 bg-gray-50/50">
                  {period}-сабақ
                </td>
                {daysOfWeek.map((day) => {
                  const subjectId = getSubjectForSlot(day.num, period);
                  return (
                    <td key={day.num} className="py-2 px-2">
                      <select
                        value={subjectId}
                        onChange={(e) => handleSlotChange(day.num, period, e.target.value)}
                        className={`w-full text-xs font-semibold px-2.5 py-2 rounded-xl border transition ${
                          subjectId
                            ? 'bg-[#E6F4EA]/80 border-[#138A62]/40 text-[#075C42] font-bold'
                            : 'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        <option value="">— Сабақ жоқ —</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id} className="bg-white text-gray-900">
                            {s.nameKk} ({s.code})
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
