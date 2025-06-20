'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLng, GeoJSON, Map as LeafletMap } from 'leaflet';

type Button = { label: string; path: string };
type BuildingMarker = { name: string; lat: number; lon: number };

const createResponsiveIcon = (className: string, size: [number, number], anchor: [number, number]) =>
  L.divIcon({
    html: `<div class="${className}"></div>`,
    className: '',
    iconSize: size,
    iconAnchor: anchor,
  });

const routeMarkerIcon = createResponsiveIcon('route-marker-inner', [50, 50], [25, 50]);

export default function MapTimetable({ buttons = [] }: { buttons?: Button[] }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<LatLng[]>([]);
  const [buildingMarkers, setBuildingMarkers] = useState<BuildingMarker[]>([]);
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(null);
  const routeLayerRef = useRef<GeoJSON | null>(null);
  const [isButtonClick, setIsButtonClick] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch('/api/map-timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('API 응답:', data);
        setBuildingMarkers(data.buildings || []);
      })
      .catch(err => {
        console.error('건물 마커 불러오기 실패:', err);
      });
  }, []);

  const getNearestNodeId = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const res = await fetch('/api/nearest-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.nearest_id;
    } catch {
      return null;
    }
  };

  const handleMarkerClick = async (lat: number, lon: number, name: string) => {
    if (isButtonClick) return;
    const map = mapRef.current;
    if (!map) return;

    setSelectedBuildingName(name);

    if (selectedPoints.length >= 2) {
      setSelectedPoints([]);
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      setDistance(null);
      setEstimatedTime(null);
    }

    const point = L.latLng(lat, lon);
    setSelectedPoints(prev => [...prev, point]);

    if (selectedPoints.length === 1) {
      const start = selectedPoints[0];
      const goal = point;

      const startId = await getNearestNodeId(start.lat, start.lng);
      const goalId = await getNearestNodeId(goal.lat, goal.lng);
      if (!startId || !goalId) {
        alert('연결된 노드를 찾을 수 없습니다.');
        return;
      }

      try {
        const res = await fetch('/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: startId, goal: goalId }),
        });

        const result = await res.json();
        if (!result.geojson || result.geojson.type !== 'FeatureCollection') {
          alert('경로를 찾을 수 없습니다.');
          return;
        }

        const routeLayer = L.geoJSON(result.geojson).addTo(map);
        routeLayerRef.current = routeLayer;

        setDistance(result.distance || 0);
        setEstimatedTime(result.estimated_time || 0);

        map.setView(start, map.getZoom());
      } catch (err) {
        console.error('경로 요청 실패:', err);
      }
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onZoom = () => {
      const zoom = map.getZoom();
      const scale = zoom / 16;
      const elements = document.querySelectorAll(
        '.timetable-marker-inner, .timetable-marker-selected, .route-marker-inner'
      );
      elements.forEach((el) => {
        (el as HTMLElement).style.setProperty('--scale', `${scale}`);
      });
    };

    map.on('zoomend', onZoom);
    onZoom();

    return () => {
      map.off('zoomend', onZoom);
    };
  }, []);

  function MapInit({ onReady }: { onReady: (map: LeafletMap) => void }) {
    const map = useMap();
    useEffect(() => {
      onReady(map);
    }, [map, onReady]);
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      {buttons.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] space-x-2">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsButtonClick(true);
                window.location.href = btn.path;
                setTimeout(() => setIsButtonClick(false), 300);
              }}
              className="bg-white px-3 py-1 rounded shadow text-sm font-medium text-gray-800"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {distance != null && estimatedTime != null && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded shadow text-sm text-black">
          <div>총 거리: {Math.ceil(distance)} m</div>
          <div>예상 시간: {Math.ceil(estimatedTime)}분</div>
        </div>
      )}

      <MapContainer center={[35.1744, 126.9094]} zoom={16} className="w-full h-full z-0">
        <MapInit onReady={(map) => (mapRef.current = map)} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {buildingMarkers
          .filter(b => typeof b.lat === 'number' && typeof b.lon === 'number')
          .map((b, idx) => (
            <Marker
              key={`${b.name}-${idx}`}
              position={[b.lat, b.lon]}
              icon={createResponsiveIcon(
                b.name === selectedBuildingName ? 'timetable-marker-selected' : 'timetable-marker-inner',
                [32, 64],
                [16, 64]
              )}
              eventHandlers={{
                click: () => handleMarkerClick(b.lat, b.lon, b.name),
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
