# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ 추가
from astar import astar, nodes

app = Flask(__name__)
CORS(app)  # ← CORS 허용 추가

@app.route("/route", methods=["POST"])
def route():
    data = request.get_json()
    start = data.get("start")
    goal = data.get("goal")

    if start not in nodes or goal not in nodes:
        return jsonify({"error": "Invalid node ID"}), 400

    path = astar(start, goal)
    if not path:
        return jsonify({"error": "No path found"}), 404

    # GeoJSON 형식으로 응답
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
