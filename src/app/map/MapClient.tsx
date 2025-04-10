'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import type { Map as LeafletMap, LatLngExpression } from 'leaflet';

function MapInit({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

export default function MapClient() {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });
  }, []);

  const handleLocate = () => {
    const map = mapRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const position: LatLngExpression = [latitude, longitude];
          map.setView(position, 16);
          setCurrentPos(position);
        },
        (err) => {
          alert('위치 정보를 가져올 수 없습니다.');
          console.error(err);
        }
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer center={[35.1744, 126.9094]} zoom={15} className="w-full h-full z-0">
        <MapInit onReady={(map) => (mapRef.current = map)} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {currentPos && <Marker position={currentPos} />}
      </MapContainer>

      <div className="absolute top-4 right-4 flex flex-row gap-2 z-[1000]">
        <button
          onClick={() => router.push('/')}
          className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-black"
        >
          홈
        </button>
        <button
          onClick={handleLocate}
          className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-black"
        >
          현재 위치
        </button>
      </div>
    </div>
  );
}
