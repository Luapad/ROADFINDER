'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      alert('로그인이 필요합니다.');
      router.push('/');
    }
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-6">
      <main className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => router.push('/timetable')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md"
        >
          시간표 보기
        </button>
        <button
          onClick={() => router.push('/timetable-map')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md"
        >
          지도 보기
        </button>
      </main>
    </div>
  );
}
