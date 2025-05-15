# astar.py
import math
import json
import heapq
from collections import defaultdict

# 파일 경로
NODES_PATH = "nodes.json"
EDGES_PATH = "edges.json"

# 데이터 불러오기
with open(NODES_PATH, encoding="utf-8") as f:
    nodes = json.load(f)

with open(EDGES_PATH, encoding="utf-8") as f:
    edges = json.load(f)

# 그래프 구성 (양방향)
graph = defaultdict(list)
for edge in edges:
    from_id = edge["from"]
    to_id = edge["to"]
    if from_id in nodes and to_id in nodes:
        lat1, lon1 = nodes[from_id]["lat"], nodes[from_id]["lon"]
        lat2, lon2 = nodes[to_id]["lat"], nodes[to_id]["lon"]
        dist = math.hypot(lat2 - lat1, lon2 - lon1)
        graph[from_id].append((to_id, dist))
        graph[to_id].append((from_id, dist))

# 휴리스틱 함수: 유클리디안 거리
def heuristic(n1, n2):
    lat1, lon1 = nodes[n1]["lat"], nodes[n1]["lon"]
    lat2, lon2 = nodes[n2]["lat"], nodes[n2]["lon"]
    return math.hypot(lat2 - lat1, lon2 - lon1)

# A* 알고리즘 함수
def astar(start, goal):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            path.reverse()
            return path

        for neighbor, cost in graph[current]:
            tentative_g = g_score[current] + cost
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None  # 실패 시

if __name__ == "__main__":
    node_ids = list(nodes.keys())
    start = node_ids[0]
    goal = node_ids[10]
    print(f"Start: {start}, Goal: {goal}")
    path = astar(start, goal)
    if path:
        print("경로:", " → ".join(path))
    else:
        print("경로를 찾을 수 없습니다.")