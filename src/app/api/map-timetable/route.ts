import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch('http://34.47.125.86:8080/api/map-timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('/api/map-timetable route error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
