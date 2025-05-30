// app/map-timetable/page.tsx
'use client';

import dynamic from 'next/dynamic';

const MapTimetable = dynamic(() => import('../../../components/map-timetable'), {
  ssr: false,
});

export default function MapTimetablePage() {
  return <MapTimetable />;
}
