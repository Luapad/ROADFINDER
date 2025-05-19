'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (id && password) {
      localStorage.setItem('isLoggedIn', 'true');
      window.dispatchEvent(new Event('login'));
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      {/* 전체 form 컨테이너 */}
      <div className="flex flex-col gap-4 w-full max-w-md px-4">
        {/* 앱 아이콘 - 버튼과 입력창 폭과 통일 */}

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          로드파인더
        </h1>

        <img
          src="/roadfinder.png"
          alt="로드파인더 아이콘"
          className="w-full h-auto object-contain rounded-4xl"
        />        

        <input
          type="text"
          placeholder="아이디"
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-base"
        >
          로그인
        </button>

        <button
          onClick={() => router.push('/map')}
          className="w-full bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl text-base"
        >
          지도 및 길찾기
        </button>
      </div>
    </main>
  );
}
