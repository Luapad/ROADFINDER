'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  if (!loggedIn) return null;

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow"
    >
      로그아웃
    </button>
  );
}
