// app/map-timetable/page.tsx
import dynamic from 'next/dynamic';

const MapTimetable = dynamic(() => import('../../..//components/map-timetable'), {
  ssr: false, // ❗ 서버에서 렌더링 안 하게 설정
});

export default function MapTimetablePage() {
  return <MapTimetable />;
}
