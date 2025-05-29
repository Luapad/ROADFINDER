import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://34.47.125.86:8080/api/timetable'; // 실제 백엔드 주소로 교체

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId 필요' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}?userId=${userId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: '서버 요청 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('▶ 백엔드로 보낼 body:', JSON.stringify(body, null, 2)); 
  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: '서버 요청 실패' }, { status: 500 });
  }
}
