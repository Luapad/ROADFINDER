import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('요청 바디:', body); // 입력값 확인

    const response = await fetch('http://34.47.125.86:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('백엔드 응답 상태:', response.status);

    const data = await response.json();

    const res = NextResponse.json(data, { status: response.status });
    console.log('응답 바디:', data);

    if (response.ok && data.accessToken) {
      res.cookies.set('access_token', data.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600, // 1시간
      });

      if (data.refreshToken) {
        res.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30, // 30일
        });
      }
    }

    return res;
  } catch (error) {
    console.error('API /api/login 에러:', error);
    return NextResponse.json({ message: '중계 서버 오류' }, { status: 500 });
  }
}
