# app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import math
import jwt
import sys
import datetime
import json
import pymysql
from astar import astar, load_data

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)


# DB 연결 설정
db = pymysql.connect(
    host='localhost',
    user='root',
    password='1234',
    database='roadfinderdb',
    cursorclass=pymysql.cursors.DictCursor
)

SECRET_KEY = 'my-super-secret-key-123!'





@app.route('/api/map-timetable', methods=['POST'])
def map_timetable():
    data = request.get_json()
    user_id = data.get('userId')

    print(' 요청 받은 userId:', user_id)

    if not user_id:
        return jsonify({'error': 'userId 누락'}), 400

    try:
        with db.cursor() as cursor:
            # 1. 시간표에서 건물 이름 추출
            cursor.execute("""
                SELECT DISTINCT BuildingName
                FROM timetable
                WHERE UserID = %s
            """, (user_id,))
            building_names = [row['BuildingName'] for row in cursor.fetchall()]
            print(' 추출된 건물:', building_names)

            if not building_names:
                return jsonify({'buildings': []})

            # 2. 좌표 조회
            placeholders = ','.join(['%s'] * len(building_names))
            sql = f"""
                SELECT BuildingName, Latitude AS lat, Longitude AS lon
                FROM buildings
                WHERE BuildingName IN ({placeholders})
            """
            print(' 쿼리:', sql)
            print(' 파라미터:', building_names)

            cursor.execute(sql, building_names)
            rows = cursor.fetchall()

            # 3. name 필드로 포맷 변환
            formatted = [
                {'name': row['BuildingName'], 'lat': row['lat'], 'lon': row['lon']}
                for row in rows
            ]

            print(' 응답:', formatted)
            return jsonify({'buildings': formatted})

    except Exception as e:
        print(' 오류 발생:', e)
        return jsonify({'error': '서버 오류'}), 500



@app.route('/api/timetable', methods=['POST'])
def save_timetable():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        entries_by_day = data.get('entries')  # 리스트 형태로 예상

        if not user_id or entries_by_day is None:
            return jsonify({'error': 'userId 또는 entries 누락'}), 400

        with db.cursor() as cursor:
            # 기존 시간표 삭제 (덮어쓰기 방식)
            cursor.execute("DELETE FROM timetable WHERE UserID = %s", (user_id,))

            # 새로 insert
            for day, entries in entries_by_day.items():
                for entry in entries: 
                    cursor.execute("""
                        INSERT INTO timetable (UserID, LectureName, BuildingName, day, start_time, end_time)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        user_id,
                        entry.get('subject'),
                        entry.get('building'),
                        day,
                        entry.get('start'),
                        entry.get('end')
                    ))

            db.commit()

        return jsonify({'message': '저장 성공'}), 200

    except Exception as e:
        print("시간표 저장 중 에러:", e, flush=True)
        return jsonify({'error': '저장 실패'}), 500


@app.route('/api/timetable', methods=['GET'])
def load_timetable():
    try:
        user_id = request.args.get('userId')

        if not user_id:
            return jsonify({'error': 'userId 누락'}), 400

        with db.cursor() as cursor:
            cursor.execute("SELECT LectureName, BuildingName, day, start_time, end_time FROM timetable WHERE UserID = %s", (user_id,))
            results = cursor.fetchall()

        # 프론트 요구 형식에 맞게 변환
        entries = {}
        for row in results:
            day = row['day']
            entry = {
                'start': str(row['start_time']),
                'end': str(row['end_time']),
                'subject': row['LectureName'],
                'building': row['BuildingName']
            }
            if day not in entries:
                entries[day] = []
            entries[day].append(entry)

        return jsonify({'entries': entries}), 200

    except Exception as e:
        print("시간표 불러오기 중 에러:", e, flush=True)
        return jsonify({'error': '불러오기 실패'}), 500


def check_password(stored_hash, password):
    return bcrypt.check_password_hash(stored_hash, password)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        password = data.get('password')

        if not user_id or not password:
            return jsonify({'message': '아이디와 비밀번호를 입력해주세요.'}), 400

        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM `user` WHERE UserID = %s", (user_id,))
            user = cursor.fetchone()

        if not user or not check_password(user['Password'], password):
            return jsonify({'message': '아이디 또는 비밀번호가 일치하지 않습니다.'}), 401

        # 액세스 토큰 생성 (만료 기간이 없는 토큰)
        access_payload = {
            'UserID': user['UserID'],
            'UserName': user['UserName'],
            # 'exp' 필드를 제거하여 만료 기간이 없게 만듦
        }
        access_token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')

        # 액세스 토큰을 응답 본문에 포함시켜 전달
        return jsonify({
            'message': '로그인 성공',
            'success': True,
            'access_token': access_token
        })

    except Exception as e:
        print("로그인 중 에러:", e, flush=True)
        return jsonify({'message': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/sign-up', methods=['POST'])
def sign_up():
    try:
        data = request.get_json()

        user_id = data.get('userId')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email')

        # 입력값 유효성 확인
        if not all([user_id, password, name, phone, email]):
            return jsonify({'error': '모든 필드를 입력해야 합니다.'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        with db.cursor() as cursor:

            # 새 사용자 INSERT
            cursor.execute("""
                INSERT INTO `user`  (UserID, Password, UserName, PhoneNumber, email)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, hashed_password, name, phone, email))

            db.commit()

        return jsonify({'message': '회원가입 완료'}), 201

    except Exception as e:
        print("회원가입 중 에러:", e, flush=True)
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500





@app.route('/api/check-userid', methods=['POST'])
def check_userid():
    try:
        data = request.get_json()
        user_id = data.get('userId')

        if not user_id:
            return jsonify({'error': 'userId가 없습니다.'}), 400

        with db.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS count FROM `user` WHERE UserID = %s", (user_id,))
            result = cursor.fetchone()

        exists = result['count'] > 0
        return jsonify({'exists': exists})

    except Exception as e:
        print("아이디 중복 확인 중 에러:", e, flush=True)
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500




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

    path, total_distance = astar(start, goal, nodes, graph)
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
    estimated_time = total_distance / 1.3
    return jsonify({
        "geojson": geojson,
        "distance": total_distance,
        "estimated_time": estimated_time})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
