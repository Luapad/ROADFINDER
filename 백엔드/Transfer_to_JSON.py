import xml.etree.ElementTree as ET
import json

# 1. OSM 파일 로딩 (같은 폴더에 "roadfinder.osm" 있어야 함)
tree = ET.parse("roadfinder.osm")
root = tree.getroot()

# 2. 전체 노드 저장: 모든 <node> 요소를 미리 수집
all_nodes = {}
for node in root.findall("node"):
    nid = node.get("id")  # 노드 ID (문자열 형태)
    lat = float(node.get("lat"))  # 위도
    lon = float(node.get("lon"))  # 경도
    tags = {tag.get("k"): tag.get("v") for tag in node.findall("tag")}  # 모든 태그를 딕셔너리로 저장
    name = tags.get("name", "")  # name 태그 있으면 저장
    ntype = tags.get("type", "")  # type 태그 있으면 저장
    all_nodes[nid] = {
        "name": name,
        "type": ntype,
        "lat": lat,
        "lon": lon
    }

# 3. 엣지 추출: highway 태그가 있는 way만 edge로 저장
edges = []
used_node_ids = set()

for way in root.findall("way"):
    tags = {tag.get("k"): tag.get("v") for tag in way.findall("tag")}  # <tag> 요소를 딕셔너리로 변환

    # [수정된 부분] highway가 없으면 해당 way는 edge로 간주하지 않음
    if "highway" not in tags:
        continue  # 길이 아님 → 무시

    h_type = tags["highway"]  # highway 종류 (residential, footway 등)
    oneway = tags.get("oneway", "no")  # 기본값은 양방향 (oneway=no로 간주)

    nds = [nd.get("ref") for nd in way.findall("nd")]  # way 안의 노드 id 목록

    for i in range(len(nds) - 1):
        from_id, to_id = nds[i], nds[i + 1]  # 두 노드 쌍으로 edge 구성
        if from_id in all_nodes and to_id in all_nodes:  # 노드가 실제로 존재할 때만 edge 추가
            # 순방향 edge 추가
            edges.append({
                "from": from_id,
                "to": to_id,
                "type": h_type
            })
            # 역방향 edge 추가 (단, 일방통행이 아닐 경우만)
            if oneway == "no":
                edges.append({
                    "from": to_id,
                    "to": from_id,
                    "type": h_type
                })
            # 사용된 노드 ID 기록
            used_node_ids.update([from_id, to_id])

# 4. 실제 사용된 노드만 남기기
nodes = {str(nid): all_nodes[nid] for nid in used_node_ids}

# 5. 파일 저장: JSON으로 저장 (들여쓰기 + 한글 유니코드 유지)
with open("nodes.json", "w", encoding="utf-8") as f:
    json.dump(nodes, f, indent=2, ensure_ascii=False)

with open("edges.json", "w", encoding="utf-8") as f:
    json.dump(edges, f, indent=2, ensure_ascii=False)

# 6. 콘솔 출력: 생성된 노드/엣지 수 확인용
print(f"nodes.json에 저장된 노드 수: {len(nodes)}개")
print(f"edges.json에 저장된 엣지 수: {len(edges)}개")
