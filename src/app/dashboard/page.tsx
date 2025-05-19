'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '../../../components/LogoutButton'; // ✅ 로그아웃 버튼 import

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
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      {/* ✅ 우측 상단 고정 로그아웃 버튼 */}
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>

      {/* 이미지 버튼 3개 */}
      <div className="grid grid-cols-1 gap-8">
        <div
          onClick={() => router.push('/timetable')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img
            src="/timetable.png"
            alt="시간표 입력"
            className="w-32 h-32 object-contain"
          />
          <span className="mt-3 font-semibold text-sm text-gray-700">시간표 입력</span>
        </div>

        <div
          onClick={() => alert('강의실 위치 기능은 준비 중입니다.')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img
            src="/location.png"
            alt="강의실 위치"
            className="w-32 h-32 object-contain"
          />
          <span className="mt-3 font-semibold text-sm text-gray-700">강의실 위치</span>
        </div>

        <div
          onClick={() => router.push('/timetable-map')}
          className="flex flex-col items-center cursor-pointer"
        >
          <img
            src="/map.png"
            alt="지도 및 길찾기"
            className="w-32 h-32 object-contain"
          />
          <span className="mt-3 font-semibold text-sm text-gray-700">지도 및 길찾기</span>
        </div>
      </div>
    </div>
  );
}
