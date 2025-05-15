'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import L, {
  LatLng,
  LatLngExpression,
  LeafletMouseEvent,
  GeoJSON,
  Map as LeafletMap,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ 기본 마커 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconRetinaUrl: undefined,
});

type NodeMap = {
  [id: string]: { lat: number; lon: number };
};

type Edge = { from: string; to: string };

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

export default function MapClient() {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLngExpression | null>(null);
  const [nodes, setNodes] = useState<NodeMap | null>(null);
  const [edges, setEdges] = useState<Edge[] | null>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const routeLayerRef = useRef<GeoJSON | null>(null);

  // 지도 클릭 시 경로 처리
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
        }
      }

      const marker = L.marker(e.latlng).addTo(map);
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

  // 노드/에지 데이터 불러오기
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

  // 현재 위치 이동
  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();

    const map = mapRef.current;
    if (!map) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const position: LatLngExpression = [latitude, longitude];
        map.setView(position, 17);
        setCurrentPos(position);
      },
      () => alert('위치를 가져올 수 없습니다.')
    );
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[35.1744, 126.9094]}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef} // ✅ TS에러 없이 map 인스턴스 참조
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
          attribution="&copy; OpenStreetMap contributors"
        />
        {currentPos && <Marker position={currentPos} />}
      </MapContainer>

      {/* 버튼: 오른쪽 상단 */}
      <div className="absolute top-4 right-4 flex flex-row gap-2 z-[1000]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/');
          }}
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
