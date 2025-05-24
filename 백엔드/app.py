# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import json
from astar import astar, load_data

app = Flask(__name__)
CORS(app)

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