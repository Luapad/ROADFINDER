'use client'; 

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false, // ✅ 클라이언트 전용 컴포넌트
});

export default function MapPage() {
  return <MapClient />;
}
