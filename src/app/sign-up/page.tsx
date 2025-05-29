'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');

  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsIdChecked(false);
    setIdCheckMessage('');
  }, [userId]);

  const checkDuplicateId = () => {
    fetch('/api/sign-up/check-userid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setIsIdChecked(false);
          setIdCheckMessage('이미 사용 중인 아이디입니다.');
        } else {
          setIsIdChecked(true);
          setIdCheckMessage('사용 가능한 아이디입니다.');
        }
      })
      .catch(() => {
        setIsIdChecked(false);
        setIdCheckMessage('오류가 발생했습니다.');
      });
  };

  const handleRegister = () => {
    if (!isIdChecked) {
      alert('아이디 중복 확인을 해주세요.');
      return;
    }
    if (!userId || !password || !name || !phone || !email) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    fetch('/api/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password, name, phone, email }),
    })
      .then(res => {
        if (res.ok) {
          alert('회원가입이 완료되었습니다.');
          router.push('/');
        } else {
          alert('회원가입에 실패했습니다.');
        }
      })
      .catch(() => {
        alert('서버 오류가 발생했습니다.');
      });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="flex flex-col gap-4 w-full max-w-md px-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">회원가입</h1>

        <div className="flex w-full gap-2">
            <input
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-7/12 bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
            onClick={checkDuplicateId}
            className="w-5/12 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
            >
            중복 확인
            </button>
        </div>


        {idCheckMessage && (
          <p className="text-sm text-gray-700">{idCheckMessage}</p>
        )}

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="전화번호 : 010-xxxx-xxxx"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="이메일 : user@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl text-base"
        >
          회원가입
        </button>
      </div>
    </main>
  );
}
