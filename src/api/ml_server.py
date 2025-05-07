from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from deep import initialize_workflow, predict_recommendations

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": "*", "methods": ["GET", "POST", "OPTIONS"]}})

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

model = None
user_encoder = None
place_encoder = None

@app.route("/api/ml/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        logger.debug(f"📥 Request data: {data}")

        user_id = data.get("userId")
        if user_id is None:
            return jsonify({"error": "userId is required"}), 400

        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({"error": "Invalid userId format"}), 400

        recommendations = predict_recommendations(
            model, user_id, user_encoder, place_encoder
        )

        return jsonify({
            "success": True,
            "recommendedPlaceIds": [r['place_id'] for r in recommendations],
            "message": "Recommendations loaded successfully"
        })

    except Exception as e:
        logger.error(f"❌ Error in recommendation: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate recommendations"
        }), 500

if __name__ == "__main__":
    try:
        model, user_encoder, place_encoder = initialize_workflow()
        app.run(port=9001, debug=False)
    except Exception as e:
        logger.error(f"🚨 Failed to initialize server: {str(e)}")
        raise
