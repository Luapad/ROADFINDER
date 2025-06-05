'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // 자동 로그인 상태 추가

  const handleLogin = async () => {
    if (!id || !password) {
      alert('아이디와 비밀번호를 입력하세요.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, password, remember: rememberMe }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', id);
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false'); 

        router.push('/dashboard');
      } else {
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="flex flex-col gap-4 w-full max-w-md px-4">
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

        {/* 자동 로그인 + 회원가입 한 줄 배치 */}
<div className="w-full flex justify-between items-center text-sm text-gray-700">
  <label className="flex items-center space-x-1">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
    />
    <span>자동 로그인</span>
  </label>

  <span
    onClick={() => router.push('/sign-up')}
    className="text-gray-600 hover:underline cursor-pointer"
  >
    회원가입
  </span>
</div>

<button
  onClick={handleLogin}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-base"
>
  로그인
</button>


        <button
          onClick={() => router.push('/map-nonmember')}
          className="w-full bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl text-base"
        >
          지도 및 길찾기
        </button>
      </div>
    </main>
  );
}
