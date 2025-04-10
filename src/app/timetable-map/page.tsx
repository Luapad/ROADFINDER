'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false, // 클라이언트에서만 렌더링
});

export default function TimetableMapPage() {
  return <MapClient />;
}
