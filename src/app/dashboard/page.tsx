'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '../../../components/LogoutButton';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const tryAutoLogin = async () => {
      const remember = localStorage.getItem('rememberMe');
      if (remember !== 'true') {
        // 자동 로그인 체크 안 했으면 로그인 페이지로 이동
        router.push('/');
        return;
      }

      // 자동 로그인 체크한 경우만 리프레시 시도
      const res = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        // 리프레시 실패 → 로그인 페이지로 이동
        router.push('/');
      }
    };

    tryAutoLogin();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div
          onClick={() => router.push('/timetable')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img src="/timetable.png" alt="시간표" className="w-32 h-32 object-contain" />
          <span className="mt-3 font-semibold text-sm text-gray-700">시간표</span>
        </div>

        <div
          onClick={() => router.push('/map-timetable')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img src="/location.png" alt="강의실 위치" className="w-32 h-32 object-contain" />
          <span className="mt-3 font-semibold text-sm text-gray-700">강의실 위치</span>
        </div>

        <div
          onClick={() => router.push('/map-member')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img src="/map.png" alt="지도 및 길찾기" className="w-32 h-32 object-contain" />
          <span className="mt-3 font-semibold text-sm text-gray-700">지도 및 길찾기</span>
        </div>
      </div>
    </div>
  );
}
