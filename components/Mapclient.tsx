
'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import type {
  Map as LeafletMap,
  LatLng,
  LatLngExpression,
  LeafletMouseEvent,
  GeoJSON,
} from 'leaflet';

import CategoryDropdown from '../components/dropdown';

type NodeMap = {
  [id: string]: { lat: number; lon: number };
};

type Edge = { from: string; to: string };

type ButtonConfig = {
  label: string;
  path: string;
};

type BuildingInfo = {
  lat: number;
  lon: number;
};

const createResponsiveIcon = (
  className: string,
  size: [number, number],
  anchor: [number, number]
) =>
  L.divIcon({
    html: `<div class="${className}"></div>`,
    className: '',
    iconSize: size,
    iconAnchor: anchor,
  });

const routeMarkerIcon = createResponsiveIcon('route-marker-inner', [50, 50], [25, 50]);
const currentMarkerIcon = createResponsiveIcon('current-marker-inner', [25, 50], [12.5, 50]);

export default function MapClient({ buttons }: { buttons: ButtonConfig[] }) {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLngExpression | null>(null);
  const [nodes, setNodes] = useState<NodeMap | null>(null);
  const [edges, setEdges] = useState<Edge[] | null>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const routeLayerRef = useRef<GeoJSON | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [startCategory, setStartCategory] = useState('');
  const [endCategory, setEndCategory] = useState('');
  const [startBuilding, setStartBuilding] = useState('');
  const [endBuilding, setEndBuilding] = useState('');
  const [startOptions, setStartOptions] = useState<string[]>([]);
  const [endOptions, setEndOptions] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/nodes.json').then((res) => res.json()),
      fetch('/edges.json').then((res) => res.json()),
    ])
      .then(([nodesData, edgesData]) => {
        setNodes(nodesData);
        setEdges(edgesData);
      })
      .catch((err) => {
        console.error('노드/에지 데이터 로딩 실패:', err);
      });
  }, []);

  useEffect(() => {
    if (!startCategory) return;
    fetch('/api/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: startCategory }),
    })
      .then(res => res.json())
      .then(data => setStartOptions(data.buildings || []))
      .catch(() => setStartOptions([]));
  }, [startCategory]);

  useEffect(() => {
    if (!endCategory) return;
    fetch('/api/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: endCategory }),
    })
      .then(res => res.json())
      .then(data => setEndOptions(data.buildings || []))
      .catch(() => setEndOptions([]));
  }, [endCategory]);

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

  const fetchBuildingCoords = async (name: string): Promise<BuildingInfo | null> => {
    try {
      const res = await fetch('/api/buildings/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const runSearch = async () => {
    if (!startBuilding || !endBuilding) return;
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const startInfo = await fetchBuildingCoords(startBuilding);
    const endInfo = await fetchBuildingCoords(endBuilding);

    console.log('startInfo:', startInfo);
    console.log('endInfo:', endInfo);

    if (!startInfo || !endInfo) {
      alert('건물 정보를 불러올 수 없습니다.');
      return;
    }

    const startId = await getNearestNodeId(startInfo.lat, startInfo.lon);
    const endId = await getNearestNodeId(endInfo.lat, endInfo.lon);
    if (!startId || !endId) {
      alert('노드를 찾을 수 없습니다.');
      return;
    }

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startId, goal: endId }),
      });
      const geojson = await res.json();
      if (!geojson || geojson.type !== 'FeatureCollection') {
        alert('경로를 찾을 수 없습니다.');
        return;
      }
      const routeLayer = L.geoJSON(geojson).addTo(map);
      routeLayerRef.current = routeLayer;
    } catch {
      alert('서버 오류');
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !nodes || !edges) return;

    const onClick = async (e: LeafletMouseEvent) => {
      if (markers.length >= 2) {
        markers.forEach((m) => m.remove());
        setMarkers([]);
        setPoints([]);
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }
      }

      const marker = L.marker(e.latlng, { icon: routeMarkerIcon }).addTo(map);
      setMarkers((prev) => [...prev, marker]);
      setPoints((prev) => [...prev, e.latlng]);

      if (points.length === 1) {
        const start = points[0];
        const goal = e.latlng;

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

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [nodes, edges, markers, points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onZoom = () => {
      const zoom = map.getZoom();
      const scale = zoom / 15;
      const elements = document.querySelectorAll('.route-marker-inner, .current-marker-inner');
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

  const handleLocate = () => {
    const map = mapRef.current;
    if (!map) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const position: LatLngExpression = [latitude, longitude];
        map.setView(position, 17);
        setCurrentPos(position);
      },
      (err) => {
        alert('위치 정보를 가져올 수 없습니다.');
        console.error(err);
      }
    );
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
        {currentPos && <Marker position={currentPos} icon={currentMarkerIcon} />}
      </MapContainer>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        {buttons.map(({ label, path }) => (
          <button
            key={path}
            onClick={() => router.push(path)}
            className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-black"
          >
            {label}
          </button>
        ))}
        <button
          onClick={handleLocate}
          className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-black"
        >
          현재 위치
        </button>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-black"
        >
          길찾기
        </button>
        {showSearch && (
          <div className="bg-white border p-3 rounded-md shadow-md text-sm text-black">
            <CategoryDropdown value={startCategory} onChange={setStartCategory} />
            <select
              className="w-full border rounded-md p-2 mb-2"
              value={startBuilding}
              onChange={(e) => setStartBuilding(e.target.value)}
            >
              <option value="">출발지 건물 선택</option>
              {startOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <CategoryDropdown value={endCategory} onChange={setEndCategory} />
            <select
              className="w-full border rounded-md p-2 mb-2"
              value={endBuilding}
              onChange={(e) => setEndBuilding(e.target.value)}
            >
              <option value="">목적지 건물 선택</option>
              {endOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <button
              onClick={runSearch}
              className="w-full bg-blue-600 text-white py-1 rounded-md mt-1"
            >
              경로 찾기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
