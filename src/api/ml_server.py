# ml_server.py (최신 안정 버전)

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

# === 설정 ===
app = Flask(__name__)
CORS(app, resources={r"/recommend": {"origins": ["http://localhost:3000"]}})
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

DB_URL = "mysql+pymysql://root:mysql@localhost:3306/petdb"
engine = create_engine(DB_URL)

# === 함수 정의 ===

def preprocess_place_data(df):
    df = df.copy()
    for col in ["indoor", "outdoor", "parking_available"]:
        df[col] = df[col].map({"Y": 1, "N": 0})

    label_cols = ["industry_sub", "city", "pet_size", "pet_extra_charge"]
    for col in label_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

    return df

def get_similar_places(df, target_place_ids, top_n=10):
    feature_cols = [
        "industry_sub", "city", "indoor", "outdoor",
        "parking_available", "pet_size", "pet_extra_charge",
        "latitude", "longitude"
    ]

    place_vectors = df[feature_cols].values
    place_ids = df["place_id"].values

    target_indices = [i for i, pid in enumerate(place_ids) if pid in target_place_ids]
    if not target_indices:
        return []

    target_vector = np.mean(place_vectors[target_indices], axis=0).reshape(1, -1)
    similarities = cosine_similarity(target_vector, place_vectors)[0]

    similar_indices = similarities.argsort()[::-1]
    similar_indices = [i for i in similar_indices if place_ids[i] not in target_place_ids]

    return place_ids[similar_indices][:top_n].tolist()

# === 추천 API ===

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        logger.debug(f"Received request data: {data}")

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        user_id = data.get("userId")
        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        user_id = int(user_id)

        with engine.connect() as conn:
            # 최근 본 장소 조회
            recent_query = """
                SELECT place_id 
                FROM place_view 
                WHERE user_id = %(user_id)s
                ORDER BY viewed_at DESC
                LIMIT 5
            """
            recent_rows_df = pd.read_sql(recent_query, conn, params={"user_id": user_id})
            recent_place_ids = recent_rows_df["place_id"].tolist()
            logger.debug(f"Recent place IDs: {recent_place_ids}")

            if not recent_place_ids:
                return jsonify({"recommendedPlaceIds": []})

            # 전체 장소 데이터 조회
            place_query = """
                SELECT place_id, industry_sub, city, indoor, outdoor, parking_available, 
                       pet_size, pet_extra_charge, latitude, longitude
                FROM places
            """
            df = pd.read_sql(place_query, conn)

            if df.empty:
                return jsonify({"error": "No places found in database"}), 500

            df = preprocess_place_data(df)

            recommended_ids = get_similar_places(df, recent_place_ids, top_n=10)
            logger.debug(f"Recommended place IDs: {recommended_ids}")

            return jsonify({"recommendedPlaceIds": recommended_ids})

    except Exception as e:
        logger.error(f"Error in recommend endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=9001, debug=True)
