// app/api/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: '로그아웃 완료' });

  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0, // 즉시 만료
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
  });

  return response;
}
