from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# DB 연결 설정
DB_URL = "mysql+pymysql://root:mysql@localhost:3306/petdb"
engine = create_engine(DB_URL)


# 🔄 전처리 함수
def preprocess_place_data(df):
    df = df.copy()

    # Y/N → 1/0 변환
    for col in ["indoor", "outdoor", "parking_available"]:
        df[col] = df[col].map({"Y": 1, "N": 0})

    # Label Encoding
    label_cols = ["industry_sub", "city", "pet_size", "pet_extra_charge"]
    for col in label_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

    return df


# 🎯 유사도 계산 함수
def get_similar_places(df, target_place_ids, top_n=10):
    feature_cols = [
        "industry_sub", "city", "indoor", "outdoor",
        "parking_available", "pet_size", "pet_extra_charge",
        "latitude", "longitude"
    ]

    place_vectors = df[feature_cols].values
    place_ids = df["place_id"].values

    # 대상 장소 평균 벡터 계산
    target_indices = [i for i, pid in enumerate(place_ids) if pid in target_place_ids]
    if not target_indices:
        return []

    target_vector = np.mean(place_vectors[target_indices], axis=0).reshape(1, -1)
    similarities = cosine_similarity(target_vector, place_vectors)[0]

    # 유사도 순 정렬
    similar_indices = similarities.argsort()[::-1]
    similar_indices = [i for i in similar_indices if place_ids[i] not in target_place_ids]

    return place_ids[similar_indices][:top_n].tolist()


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    with engine.connect() as conn:
        # 최근 본 장소 조회
        recent_query = text("""
            SELECT place_id 
            FROM place_view 
            WHERE user_id = :user_id 
            ORDER BY viewed_at DESC 
            LIMIT 5
        """)
        recent_rows = conn.execute(recent_query, {"user_id": int(user_id)}).fetchall()
        recent_place_ids = [row.place_id for row in recent_rows]

        if not recent_place_ids:
            return jsonify({"recommendedPlaceIds": []})

        # 전체 장소 데이터 불러오기
        place_query = text("""
            SELECT place_id, industry_sub, city, indoor, outdoor, parking_available, 
                   pet_size, pet_extra_charge, latitude, longitude
            FROM place
        """)
        df = pd.read_sql(place_query, conn)
        df = preprocess_place_data(df)

        # 유사 장소 추천
        recommended_ids = get_similar_places(df, recent_place_ids, top_n=10)

        return jsonify({"recommendedPlaceIds": recommended_ids})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
