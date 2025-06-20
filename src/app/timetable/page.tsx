'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryDropdown from '../../../components/dropdown';

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
  월: [], 화: [], 수: [], 목: [], 금: [],
};

const initialPeriods: Record<Weekday, number[]> = {
  월: [], 화: [], 수: [], 목: [], 금: [],
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function TimetablePage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [buildingOptions, setBuildingOptions] = useState<string[]>([]);
  const [building, setBuilding] = useState('');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState(initialPeriods);
  const [entries, setEntries] = useState(initialEntries);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({});

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  useEffect(() => {
    fetch(`/api/timetable?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.entries) {
          const filledEntries: typeof entries = { 월: [], 화: [], 수: [], 목: [], 금: [] };
          const colors: Record<string, string> = {};

          (Object.entries(data.entries) as [Weekday, PeriodData[]][]).forEach(([day, list]) => {
            filledEntries[day] = list.map(entry => {
              if (!colors[entry.subject]) {
                colors[entry.subject] = entry.color || `hsl(${Math.floor(Math.random() * 360)}, 80%, 85%)`;
              }
              return {
                ...entry,
                color: colors[entry.subject],
              };
            });
          });

          setEntries(filledEntries);
          setSubjectColors(colors);
        }
      })
      .catch(() => setEntries(initialEntries));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    fetch('/api/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory }),
    })
      .then(res => res.json())
      .then(data => setBuildingOptions(data.buildings || []))
      .catch(() => setBuildingOptions([]));
  }, [selectedCategory]);

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
        : [...prev[day], period],
    }));
  };

  const handleAdd = () => {
    if (!subject || !building || selectedDays.length === 0) return;

    const newColor = subjectColors[subject] || `hsl(${Math.floor(Math.random() * 360)}, 80%, 85%)`;
    if (!subjectColors[subject]) {
      setSubjectColors(prev => ({ ...prev, [subject]: newColor }));
    }

    const newEntries = { ...entries };

    selectedDays.forEach(day => {
      const indices = selectedPeriods[day];
      if (indices.length === 0) return;

      const sorted = indices.sort((a, b) => a - b);
      const start = timetable[day][sorted[0]].start;
      const end = timetable[day][sorted[sorted.length - 1]].end;

      if (!newEntries[day]) newEntries[day] = [];
      newEntries[day].push({ subject, building, start, end, color: newColor });
    });

    setEntries(newEntries);
    setSubject('');
    setBuilding('');
    setSelectedCategory('');
    setSelectedDays([]);
    setSelectedPeriods(initialPeriods);
    setBuildingOptions([]);
  };

  const handleSave = async () => {
    await fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, entries }),
    });

    alert('시간표가 저장되었습니다.');
  };

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
  });

  return (
    <main className="p-4 w-full max-w-md mx-auto pb-[80px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">시간표 입력</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md font-medium"
        >
          홈
        </button>
      </div>

      <input
        type="text"
        placeholder="과목명"
        className="w-full border rounded-md p-2 mb-2 text-gray-900 placeholder-gray-600"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />

      <CategoryDropdown value={selectedCategory} onChange={setSelectedCategory} />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">건물명</label>
        <select
          value={building}
          onChange={e => setBuilding(e.target.value)}
          className="w-full border rounded-md p-2 mb-4 text-gray-900 bg-white"
        >
          <option value="">선택하세요</option>
          {buildingOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {weekdays.map(day => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`w-full py-2 rounded-md border font-medium text-sm ${
              selectedDays.includes(day)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800'
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

      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white py-2 rounded-md mb-4 font-semibold"
      >
        시간표 저장
      </button>

      <p className={`text-red-600 text-sm font-medium mb-4 text-center transition-opacity duration-200 ${
        Object.values(entries).some(dayList => dayList.length > 0) ? 'opacity-100' : 'opacity-0'
      }`}>
        ※시간표 변경 후 꼭 저장해주세요.※
      </p>

      <div className="w-full overflow-hidden ml-[-4.165%]">
        <table className="border-collapse w-full text-gray-800 text-[10px] table-fixed">
          <thead>
            <tr>
              <th className="w-[8%] bg-white p-0 m-0 border-none invisible"></th>
              {weekdays.map(day => (
                <th key={day} className="bg-gray-800 text-white w-[18.4%] text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              const hour = slot.split(':')[0];
              const minute = slot.split(':')[1];

              return (
                <tr key={slot}>
                  <td className="relative align-top h-[32px] w-[8%] pl-1">
                    {minute === '00' && (
                      <span className="absolute top-1 right-1 text-[10px] text-gray-600">{hour}</span>
                    )}
                  </td>
                  {weekdays.map(day => {
                    const dayEntries = entries[day] ?? [];
                    const entry = dayEntries.find(e => timeToMinutes(e.start) === timeToMinutes(slot));

                    if (entry) {
                      const span = (timeToMinutes(entry.end) - timeToMinutes(entry.start)) / 30;

                      const handleDelete = () => {
                        const confirmDelete = window.confirm(`${entry.subject} 강의을 삭제하시겠습니까?\n시간표 변경 후 꼭 저장해주세요!`);
                        if (!confirmDelete) return;

                        setEntries(prev => {
                          const updated = { ...prev };
                          (Object.keys(prev) as Weekday[]).forEach(d => {
                            updated[d] = updated[d].filter(e => e.subject !== entry.subject);
                          });
                          return updated;
                        });
                      };

                      return (
                        <td
                          key={day + slot}
                          rowSpan={span}
                          className="border align-top px-0.5 py-[2px] cursor-pointer h-[32px] w-[18.4%]"
                          style={{ backgroundColor: entry.color }}
                          onClick={handleDelete}
                        >
                          <div className="text-gray-900 font-medium text-[10px] leading-snug break-words max-w-full whitespace-pre-line">
                            <strong>{entry.subject}</strong><br />
                            {entry.building}
                          </div>
                        </td>
                      );
                    }

                    const isCovered = dayEntries.some(e =>
                      timeToMinutes(e.start) < timeToMinutes(slot) &&
                      timeToMinutes(e.end) > timeToMinutes(slot)
                    );

                    return isCovered ? null : (
                      <td key={day + slot} className="border h-[32px] w-[18.4%]"></td>
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
