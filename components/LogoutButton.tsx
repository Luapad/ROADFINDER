'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); 
  const [mounted, setMounted] = useState(false); 

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
  localStorage.removeItem('timetable');
  window.location.href = '/'; // ✅ 완전 새로고침하면서 홈으로
};




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
