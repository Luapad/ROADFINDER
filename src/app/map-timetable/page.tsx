'use client';

import dynamic from 'next/dynamic';

const MapTimetable = dynamic(() => import('../../../components/map-timetable'), {ssr: false,});

export default function MapTimetablePage() {
  return <MapTimetable buttons={[{ label: '홈', path: '/dashboard' }]}/>;
}
