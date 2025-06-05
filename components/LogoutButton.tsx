'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/utils/logout'; // 경로는 실제 위치에 맞게 조정

export default function LogoutButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      setLoggedIn(!!token); 
    };

    checkToken();

    window.addEventListener('storage', checkToken);
    window.addEventListener('login', checkToken);

    return () => {
      window.removeEventListener('storage', checkToken);
      window.removeEventListener('login', checkToken);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser(); // 쿠키 + localStorage 삭제
    router.push('/');
  };

  if (loggedIn !== true) return null;

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-md shadow"
    >
      로그아웃
    </button>
  );
}
