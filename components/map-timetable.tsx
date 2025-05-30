'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLng, LatLngExpression, LeafletMouseEvent, GeoJSON, Map as LeafletMap } from 'leaflet';

import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

(delete (L.Icon.Default.prototype as any)._getIconUrl);
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});


type BuildingMarker = {
  name: string;
  lat: number;
  lon: number;
};

const routeMarkerIcon = L.divIcon({
  html: `<div class="route-marker-inner"></div>`,
  className: '',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

export default function MapTimetable() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<LatLng[]>([]);
  const routeLayerRef = useRef<GeoJSON | null>(null);
  const [buildingMarkers, setBuildingMarkers] = useState<BuildingMarker[]>([]);

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
        setBuildingMarkers(data.buildings || []);})
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

  const handleMarkerClick = async (lat: number, lon: number) => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedPoints.length >= 2) {
      markers.forEach(m => m.remove());
      setMarkers([]);
      setSelectedPoints([]);
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    }

    const point = L.latLng(lat, lon);
    const marker = L.marker(point, { icon: routeMarkerIcon }).addTo(map);
    setMarkers(prev => [...prev, marker]);
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

        const geojson = await res.json();
        if (!geojson || geojson.type !== 'FeatureCollection') {
          alert('경로를 찾을 수 없습니다.');
          return;
        }

        const routeLayer = L.geoJSON(geojson).addTo(map);
        routeLayerRef.current = routeLayer;
      } catch (err) {
        console.error('경로 요청 실패:', err);
      }
    }
  };

  function MapInit({ onReady }: { onReady: (map: LeafletMap) => void }) {
    const map = useMap();
    useEffect(() => {
      onReady(map);
    }, [map, onReady]);
    return null;
  }

  return (
    <div className="relative w-full h-screen">
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
      eventHandlers={{
        click: () => handleMarkerClick(b.lat, b.lon),
      }}
    />
))}

      </MapContainer>
    </div>
  );
}
