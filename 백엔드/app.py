# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import json
import pymysql
from astar import astar, load_data

app = Flask(__name__)
CORS(app)


# DB 연결 설정
db = pymysql.connect(
    host='localhost',
    user='root',
    password='1234',
    database='roadfinderdb',
    cursorclass=pymysql.cursors.DictCursor
)

@app.route('/api/buildings/by-category', methods=['POST'])
def get_buildings_by_category():
    try:
        data = request.get_json()
        print("받은 JSON 데이터:", data, flush=True)

        if not data:
            print(" JSON이 없음 ", flush=True)
            return jsonify({'error': '요청이 잘못됨'}), 400

        category = data.get('category')
        print(" category 값:", category, flush=True)

        if not category:
            print(" category 없음",flush=True)
            return jsonify({'error': '카테고리가 없습니다.'}), 400

        with db.cursor() as cursor:
            cursor.execute(
                "SELECT BuildingName FROM buildings WHERE Category = %s",
                (category,)
            )
            results = cursor.fetchall()
            print(" SQL 결과:", results ,flush=True)

            building_names = [row['BuildingName'] for row in results]
            print("건물이름", building_names, flush=True)

        return jsonify({ 'buildings': building_names })

    except Exception as e:
        print("서버 내부 오류", e, flush=True)
        return jsonify({'error': '건물 목록을 불러올 수 없습니다.'}), 500


@app.route('/api/buildings/detail', methods=['POST'])
def get_building_detail():
    try:
        data = request.get_json()
        print("받은 JSON 데이터:", data, flush=True)

        if not data:
            print("JSON 없음", flush=True)
            return jsonify({'error': '요청이 잘못됨'}), 400

        building_name = data.get('name')
        print("건물 이름:", building_name, flush=True)

        if not building_name:
            print("건물 이름 없음", flush=True)
            return jsonify({'error': '건물 이름이 없습니다.'}), 400

        with db.cursor() as cursor:
            cursor.execute(
                """
         	SELECT BuildingName,Latitude,Longitude
                FROM buildings
                WHERE BuildingName = %s
                """,
                (building_name,)
            )
            result = cursor.fetchone()
            print("건물 상세 정보 (Category 제외):", result, flush=True)

        if not result:
            return jsonify({'error': '해당 건물을 찾을 수 없습니다.'}), 404

        response = {
            'name': result['BuildingName'],
            'lat': result['Latitude'],
            'lon': result['Longitude']
        }

        return jsonify(response)

    except Exception as e:
        print("서버 내부 오류:", e, flush=True)
        return jsonify({'error': '건물 정보를 불러올 수 없습니다.'}), 500



def find_nearest_connected_node(lat, lon, nodes, edges):
    connected_ids = set()
    for edge in edges:
        connected_ids.add(edge['from'])
        connected_ids.add(edge['to'])

    min_dist = float('inf')
    nearest_id = None

    for id, node in nodes.items():
        if id not in connected_ids:
            continue

        dx = node['lat'] - lat
        dy = node['lon'] - lon
        dist = math.hypot(dx, dy)

        if dist < min_dist:
            min_dist = dist
            nearest_id = id

    return nearest_id

@app.route("/nearest-node", methods=["POST"])
def nearest_node():
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "Missing lat/lon"}), 400

    with open("nodes.json", encoding="utf-8") as f:
        nodes = json.load(f)
    with open("edges.json", encoding="utf-8") as f:
        edges = json.load(f)

    nearest_id = find_nearest_connected_node(lat, lon, nodes, edges)
    nearest_id = str(nearest_id)

    if nearest_id is None:
        return jsonify({"error": "No connected node found"}), 404

    return jsonify({"nearest_id": nearest_id})

@app.route("/route", methods=["POST"])
def route():
    data = request.get_json()
    start = data.get("start")
    goal = data.get("goal")

    nodes, graph = load_data()

    if start not in nodes or goal not in nodes:
        return jsonify({"error": "Invalid node ID"}), 400

    path = astar(start, goal, nodes, graph)
    if not path:
        return jsonify({"error": "No path found"}), 404

    features = []
    for i in range(len(path) - 1):
        n1 = nodes[path[i]]
        n2 = nodes[path[i + 1]]
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [n1["lon"], n1["lat"]],
                    [n2["lon"], n2["lat"]]
                ]
            },
            "properties": {
                "from": path[i],
                "to": path[i + 1]
            }
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    return jsonify(geojson)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
