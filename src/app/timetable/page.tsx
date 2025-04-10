'use client';

import { useState } from 'react';

const weekdays = ['월', '화', '수', '목', '금'] as const;
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
  화: [
    { start: '09:00', end: '10:30' },
    { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' },
    { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' },
    { start: '16:30', end: '18:00' },
  ],
  목: [
    { start: '09:00', end: '10:30' },
    { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' },
    { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' },
    { start: '16:30', end: '18:00' },
  ],
};

const initialEntries: Record<Weekday, PeriodData[]> = {
  월: [], 화: [], 수: [], 목: [], 금: []
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function TimetablePage() {
  const [subject, setSubject] = useState('');
  const [building, setBuilding] = useState('');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<Weekday, number[]>>({
    월: [], 화: [], 수: [], 목: [], 금: []
  });
  const [entries, setEntries] = useState(initialEntries);

  const toggleDay = (day: Weekday) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
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

    const color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 85%)`;
    const newEntries = { ...entries };

    selectedDays.forEach(day => {
      const indices = selectedPeriods[day];
      if (indices.length === 0) return;

      const sorted = indices.sort((a, b) => a - b);
      const start = timetable[day][sorted[0]].start;
      const end = timetable[day][sorted[sorted.length - 1]].end;

      newEntries[day].push({ subject, building, start, end, color });
    });

    setEntries(newEntries);
    setSubject('');
    setBuilding('');
    setSelectedDays([]);
    setSelectedPeriods({ 월: [], 화: [], 수: [], 목: [], 금: [] });
  };

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
  });

  return (
    <main className="p-4 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900">시간표 입력</h2>

      <input
        type="text"
        placeholder="과목명"
        className="w-full border rounded-md p-2 mb-2 text-gray-900 placeholder-gray-600"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="건물명"
        className="w-full border rounded-md p-2 mb-4 text-gray-900 placeholder-gray-600"
        value={building}
        onChange={e => setBuilding(e.target.value)}
      />

      <div className="flex gap-2 mb-4 justify-center">
        {weekdays.map(day => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-4 py-1 rounded-full border font-medium ${
              selectedDays.includes(day)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-black'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {selectedDays.map(day => (
        <div key={day} className="mb-4">
          <h4 className="mb-2 text-center font-semibold text-gray-800">{day}요일 교시 선택</h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {timetable[day].map((_, i) => (
              <button
                key={i}
                onClick={() => togglePeriod(day, i)}
                className={`px-4 py-1 rounded-full border font-medium ${
                  selectedPeriods[day].includes(i)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-black'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full bg-blue-600 text-white py-2 rounded-md mb-4 font-semibold"
      >
        강의 추가
      </button>

      <div className="w-full">
        <table className="table-fixed border-collapse w-full text-gray-800 text-xs">
          <thead>
            <tr>
              <th className="border bg-gray-100 w-[40px]"></th>
              {weekdays.map(day => (
                <th key={day} className="border bg-gray-800 text-white w-[65px]">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => {
              const hour = slot.split(':')[0];
              const minute = slot.split(':')[1];
              return (
                <tr key={slot}>
                  <td className="border relative align-top h-8">
                    {minute === '00' && (
                      <span className="absolute top-1 right-1 text-[10px] text-gray-600">{hour}</span>
                    )}
                  </td>
                  {weekdays.map(day => {
                    const entry = entries[day].find(e => timeToMinutes(e.start) === timeToMinutes(slot));
                    if (entry) {
                      const span = (timeToMinutes(entry.end) - timeToMinutes(entry.start)) / 30;
                      return (
                        <td
                          key={day + slot}
                          rowSpan={span}
                          className="border text-center align-top px-1"
                          style={{ backgroundColor: entry.color }}
                        >
                          <div className="text-gray-900 font-medium text-[10px] leading-tight">
                            <strong>{entry.subject}</strong><br />
                            {entry.building}<br />
                            {entry.start}~{entry.end}
                          </div>
                        </td>
                      );
                    }

                    const isCovered = entries[day].some(e =>
                      timeToMinutes(e.start) < timeToMinutes(slot) &&
                      timeToMinutes(e.end) > timeToMinutes(slot)
                    );
                    return isCovered ? null : (
                      <td key={day + slot} className="border h-8"></td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
