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

type NodeMap = {
  [id: string]: { lat: number; lon: number };
};

type Edge = { from: string; to: string };

type ButtonConfig = {
  label: string;
  path: string;
};

// 마커 생성 함수: anchor만 사용, offset 없음
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

function findNearestConnectedNode(
  lat: number,
  lon: number,
  nodes: NodeMap,
  edges: Edge[]
): string | null {
  const connectedIds = new Set<string>();
  for (const edge of edges) {
    connectedIds.add(edge.from);
    connectedIds.add(edge.to);
  }

  let minDist = Infinity;
  let nearestId: string | null = null;

  for (const [id, node] of Object.entries(nodes)) {
    if (!connectedIds.has(id)) continue;

    const dx = node.lat - lat;
    const dy = node.lon - lon;
    const dist = Math.hypot(dx, dy);

    if (dist < minDist) {
      minDist = dist;
      nearestId = id;
    }
  }

  return nearestId;
}

function MapInit({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export default function MapClient({ buttons }: { buttons: ButtonConfig[] }) {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLngExpression | null>(null);
  const [nodes, setNodes] = useState<NodeMap | null>(null);
  const [edges, setEdges] = useState<Edge[] | null>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const routeLayerRef = useRef<GeoJSON | null>(null);

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

        const startId = findNearestConnectedNode(start.lat, start.lng, nodes, edges);
        const goalId = findNearestConnectedNode(goal.lat, goal.lng, nodes, edges);

        if (!startId || !goalId) {
          alert('연결된 노드를 찾을 수 없습니다.');
          return;
        }

        try {
          const res = await fetch('http://34.47.125.86:8080/route', {
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

      <div className="absolute top-4 right-4 flex flex-row gap-2 z-[1000]">
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
      </div>
    </div>
  );
}
