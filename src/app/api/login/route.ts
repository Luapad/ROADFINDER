import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('요청 바디:', body);

    const response = await fetch('http://34.47.125.86:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('백엔드 응답 상태:', response.status);
    const data = await response.json();
    console.log('응답 바디:', data);

    // 쿠키 설정 제거 → 그대로 프론트에 응답 전달
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API /api/login 에러:', error);
    return NextResponse.json({ message: '중계 서버 오류' }, { status: 500 });
  }
}
