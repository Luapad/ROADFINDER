'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // ✅ null로 초기화
  const [mounted, setMounted] = useState(false); // ✅ 렌더링 준비 상태

  useEffect(() => {
    const checkLogin = () => {
      const status = localStorage.getItem('isLoggedIn') === 'true';
      setLoggedIn(status);
    };

    setMounted(true);
    checkLogin();

    window.addEventListener('storage', checkLogin);
    window.addEventListener('login', checkLogin);

    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('login', checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setLoggedIn(false);
    router.push('/');
  };

  // ✅ 로그인 상태가 확인되기 전까지는 렌더링하지 않음
  if (!mounted || loggedIn !== true) return null;

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-md shadow"
    >
      로그아웃
    </button>
  );
}
