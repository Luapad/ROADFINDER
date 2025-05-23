import xml.etree.ElementTree as ET
import json

# 1. OSM 파일 로딩 (같은 폴더에 "roadfinder.osm" 있어야 함)
tree = ET.parse("roadfinder.osm")
root = tree.getroot()

# 2. 전체 노드 저장
all_nodes = {}
for node in root.findall("node"):
    nid = node.get("id")
    lat = float(node.get("lat"))
    lon = float(node.get("lon"))
    tags = {tag.get("k"): tag.get("v") for tag in node.findall("tag")}
    name = tags.get("name", "")
    ntype = tags.get("type", "")
    all_nodes[nid] = {
        "name": name,
        "type": ntype,
        "lat": lat,
        "lon": lon
    }

# 3. 엣지 추출 (양방향 처리 포함)
edges = []
used_node_ids = set()

for way in root.findall("way"):
    nds = [nd.get("ref") for nd in way.findall("nd")]
    tags = {tag.get("k"): tag.get("v") for tag in way.findall("tag")}
    h_type = tags.get("highway", tags.get("type", "unknown"))
    oneway = tags.get("oneway", "no")  # 태그가 없으면 양방향으로 간주

    for i in range(len(nds) - 1):
        from_id, to_id = nds[i], nds[i + 1]
        if from_id in all_nodes and to_id in all_nodes:
            # 순방향
            edges.append({
                "from": from_id,
                "to": to_id,
                "type": h_type
            })
            # 역방향 (단, 일방통행이 아닌 경우)
            if oneway == "no":
                edges.append({
                    "from": to_id,
                    "to": from_id,
                    "type": h_type
                })
            used_node_ids.update([from_id, to_id])

# 4. 실제 사용된 노드만 남기기
nodes = {nid: all_nodes[nid] for nid in used_node_ids}

# 5. 파일 저장
with open("nodes.json", "w", encoding="utf-8") as f:
    json.dump(nodes, f, indent=2, ensure_ascii=False)

with open("edges.json", "w", encoding="utf-8") as f:
    json.dump(edges, f, indent=2, ensure_ascii=False)

print(f"nodes.json에 저장된 노드 수: {len(nodes)}개")
print(f"edges.json에 저장된 엣지 수: {len(edges)}개")
