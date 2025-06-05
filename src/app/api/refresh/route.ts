// src/app/api/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: '리프레시 토큰 없음' }, { status: 401 });
  }

  try {
    const response = await fetch('http://34.47.125.86:8080/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }), // 백엔드가 이렇게 받도록 맞춰야 함
    });

    const data = await response.json();

    if (!response.ok || !data.accessToken) {
      return NextResponse.json({ message: '리프레시 실패' }, { status: 401 });
    }

    const res = NextResponse.json({ message: 'access_token 갱신 완료' });

    res.cookies.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600, // 1시간
    });

    return res;
  } catch (error) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
