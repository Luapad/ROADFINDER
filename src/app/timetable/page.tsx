'use client';

import { useState } from 'react';

const weekdays = ['월', '화', '수', '목', '금'];

type Weekday = typeof weekdays[number];

type PeriodData = {
  subject: string;
  building: string;
  start: string;
  end: string;
  color: string;
};

const timetable: Record<Weekday, { start: string; end: string }[]> = {
  월: Array.from({ length: 9 }, (_, i) => ({ start: `${9 + i}:00`, end: `${10 + i}:00` })),
  수: Array.from({ length: 9 }, (_, i) => ({ start: `${9 + i}:00`, end: `${10 + i}:00` })),
  금: Array.from({ length: 9 }, (_, i) => ({ start: `${9 + i}:00`, end: `${10 + i}:00` })),
  화: Array.from({ length: 6 }, (_, i) => ({ start: `${9 + Math.floor(i * 1.5)}:${i % 2 ? '30' : '00'}`, end: `${10 + Math.floor(i * 1.5)}:${i % 2 ? '00' : '30'}` })),
  목: Array.from({ length: 6 }, (_, i) => ({ start: `${9 + Math.floor(i * 1.5)}:${i % 2 ? '30' : '00'}`, end: `${10 + Math.floor(i * 1.5)}:${i % 2 ? '00' : '30'}` })),
};

const initialEntries: Record<Weekday, Record<number, PeriodData>> = {
  월: {}, 화: {}, 수: {}, 목: {}, 금: {}
};

export default function TimetablePage() {
  const [subject, setSubject] = useState('');
  const [building, setBuilding] = useState('');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<Weekday, number[]>>({ 월: [], 화: [], 수: [], 목: [], 금: [] });
  const [entries, setEntries] = useState(initialEntries);

  const toggleDay = (day: Weekday) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const togglePeriod = (day: Weekday, period: number) => {
    setSelectedPeriods(prev => ({
      ...prev,
      [day]: prev[day].includes(period)
        ? prev[day].filter(p => p !== period)
        : [...prev[day], period]
    }));
  };

  const handleAdd = () => {
    if (!subject || !building || selectedDays.length === 0) return;

    const newEntries = { ...entries };
    const color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 80%)`;

    selectedDays.forEach(day => {
      selectedPeriods[day].forEach(p => {
        const { start, end } = timetable[day][p];
        newEntries[day][p] = { subject, building, start, end, color };
      });
    });

    setEntries(newEntries);
    setSubject('');
    setBuilding('');
    setSelectedDays([]);
    setSelectedPeriods({ 월: [], 화: [], 수: [], 목: [], 금: [] });
  };

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">시간표 입력</h2>

      <input
        type="text"
        placeholder="과목명"
        className="w-full border rounded-md p-2 mb-2"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="건물명"
        className="w-full border rounded-md p-2 mb-4"
        value={building}
        onChange={e => setBuilding(e.target.value)}
      />

      <div className="flex gap-2 mb-4 justify-center">
        {weekdays.map(day => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-4 py-1 rounded-full border ${selectedDays.includes(day) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {selectedDays.map(day => (
        <div key={day} className="mb-4">
          <h4 className="mb-2 text-center font-semibold">{day}요일 교시 선택</h4>
          <div className="flex gap-1 justify-center">
            {timetable[day].map((_, i) => (
              <button
                key={i}
                onClick={() => togglePeriod(day, i)}
                className={`px-3 py-1 rounded border ${selectedPeriods[day].includes(i) ? 'bg-green-400 text-white' : 'bg-white text-black'}`}
              >
                {i + 1}교시
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full bg-blue-600 text-white py-2 rounded-md mb-4"
      >
        시간표에 추가
      </button>

      <div className="overflow-auto">
        <table className="table-fixed border-collapse w-full">
          <thead>
            <tr>
              <th className="border bg-gray-100 w-16">시간</th>
              {weekdays.map(day => <th key={day} className="border bg-gray-800 text-white w-20">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 9 }, (_, i) => (
              <tr key={i}>
                <td className="border text-center p-2">{9 + i}:00</td>
                {weekdays.map(day => (
                  <td key={day} className="border h-12 text-xs text-center" style={{ backgroundColor: entries[day][i]?.color || 'transparent' }}>
                    {entries[day][i] && (
                      <div>
                        <strong>{entries[day][i].subject}</strong><br />
                        {entries[day][i].building}<br />
                        {entries[day][i].start}~{entries[day][i].end}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
