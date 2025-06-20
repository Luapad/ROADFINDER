'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('../../../components/map'), { ssr: false });

export default function Page() {
  return <MapClient buttons={[{ label: '홈', path: '/dashboard' }]} />;
}
