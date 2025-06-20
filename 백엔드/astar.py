# astar.py
import math
import json
import heapq
from collections import defaultdict

# -----------------------------
# 데이터 로드 및 그래프 구성 함수
# -----------------------------
def load_data():
    # nodes.json과 edges.json 불러오기
    with open("nodes.json", encoding="utf-8") as f:
        nodes = json.load(f)
    with open("edges.json", encoding="utf-8") as f:
        edges = json.load(f)

    # 엣지 타입별 계수 및 고정 페널티 설정
    TYPE_ALPHA = {
        "road": 1.0,
        "buildpass": 1.05,  # 거리 10%만큼 불리하게
        "securepass": 5.0
    }

    TYPE_BETA = {
        "road": 0.0,
        "buildpass": 0.0,  # 고정 페널티 추가
        "securepass": 0.0
    }

    # 그래프 초기화
    graph = defaultdict(list)

    # 엣지를 순회하며 그래프 구성
    for edge in edges:
        from_id = edge["from"]
        to_id = edge["to"]
        etype = edge.get("type", "road")  # type이 없으면 기본값 'road'

        if from_id in nodes and to_id in nodes:
            lat1, lon1 = nodes[from_id]["lat"], nodes[from_id]["lon"]
            lat2, lon2 = nodes[to_id]["lat"], nodes[to_id]["lon"]
            dist = math.hypot(lat2 - lat1, lon2 - lon1)

            # 타입에 따른 가중치 계산
            alpha = TYPE_ALPHA.get(etype, 1.0)
            beta = TYPE_BETA.get(etype, 0.0)
            weight = dist * alpha + beta

            # 양방향 그래프
            graph[from_id].append((to_id, weight))
            graph[to_id].append((from_id, weight))

    return nodes, graph

# -----------------------------
# 유클리디안 휴리스틱 함수
# -----------------------------
def heuristic(n1, n2, nodes):
    lat1, lon1 = nodes[n1]["lat"], nodes[n1]["lon"]
    lat2, lon2 = nodes[n2]["lat"], nodes[n2]["lon"]
    return math.hypot(lat2 - lat1, lon2 - lon1)

# -----------------------------
# A* 알고리즘 구현
# -----------------------------
def astar(start, goal, nodes, graph):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal, nodes)}

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            # 경로 재구성
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()

            total_distance = 0
            for i in range(len(path) - 1):
                total_distance += heuristic(path[i], path[i+1], nodes)
            return path, total_distance * 111000

        for neighbor, cost in graph[current]:
            tentative_g = g_score[current] + cost
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal, nodes)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None, None  # 경로를 못 찾은 경우

# -----------------------------
# 테스트 실행
# -----------------------------
if __name__ == "__main__":
    nodes, graph = load_data()

    node_ids = list(nodes.keys())
    start = node_ids[0]
    goal = node_ids[10]

    print(f"Start: {start}, Goal: {goal}")

    path = astar(start, goal, nodes, graph)

    if path:
        print("경로:", " → ".join(path))
    else:
        print("경로를 찾을 수 없습니다.")

