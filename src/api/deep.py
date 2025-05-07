import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sqlalchemy import create_engine
import logging

logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정
DB_URL = "mysql+pymysql://root:mysql@localhost:3306/petdb"
engine = create_engine(DB_URL)

# 모델 하이퍼파라미터
class ModelConfig:
    EMBEDDING_DIM = 32
    LEARNING_RATE = 0.001
    BATCH_SIZE = 64
    EPOCHS = 10
    USER_EMBEDDING_DIM = 32
    PLACE_EMBEDDING_DIM = 32

def load_interaction_data():
    """상호작용 데이터 로드"""
    query = """
        SELECT v.user_id, v.place_id, 
               CASE 
                   WHEN v.time_spent > 3 THEN 1
                   ELSE 0
               END as interaction
        FROM place_view v
    """
    try:
        with engine.connect() as conn:
            df = pd.read_sql(query, conn)
            logger.debug(f"Loaded interaction data: {len(df)} rows")
            logger.debug(f"Unique users: {df['user_id'].nunique()}")
            logger.debug(f"Unique places: {df['place_id'].nunique()}")
            return df
    except Exception as e:
        logger.error(f"Error loading interaction data: {str(e)}")
        raise

def preprocess_data(df):
    """데이터 전처리"""
    user_encoder = LabelEncoder()
    place_encoder = LabelEncoder()

    # Encode user IDs
    user_ids = df['user_id'].unique()
    user_encoder.fit(user_ids)
    df['user_id_encoded'] = user_encoder.transform(df['user_id'])

    # Encode place IDs
    place_ids = df['place_id'].unique()
    place_encoder.fit(place_ids)
    df['place_id_encoded'] = place_encoder.transform(df['place_id'])

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    return train_df, test_df, user_encoder, place_encoder

class DeepRecommendationModel(tf.keras.Model):
    def __init__(self, num_users, num_places, config):
        super(DeepRecommendationModel, self).__init__()
        self.user_embedding = tf.keras.layers.Embedding(num_users, config.USER_EMBEDDING_DIM, name='user_embedding')
        self.place_embedding = tf.keras.layers.Embedding(num_places, config.PLACE_EMBEDDING_DIM, name='place_embedding')
        self.dense1 = tf.keras.layers.Dense(64, activation='relu')
        self.dense2 = tf.keras.layers.Dense(32, activation='relu')
        self.output_layer = tf.keras.layers.Dense(1, activation='sigmoid')

    def call(self, inputs):
        user_inputs, place_inputs = inputs
        user_embed = self.user_embedding(user_inputs)
        place_embed = self.place_embedding(place_inputs)
        x = tf.concat([user_embed, place_embed], axis=-1)
        x = self.dense1(x)
        x = self.dense2(x)
        return self.output_layer(x)

def train_model(train_df, test_df, config):
    # Add 1 to handle 0-based indexing
    num_users = train_df['user_id_encoded'].max() + 1
    num_places = train_df['place_id_encoded'].max() + 1
    model = DeepRecommendationModel(num_users, num_places, config)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=config.LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    train_dataset = tf.data.Dataset.from_tensor_slices(
        ((train_df['user_id_encoded'].values, train_df['place_id_encoded'].values),
         train_df['interaction'].values)
    ).batch(config.BATCH_SIZE)

    test_dataset = tf.data.Dataset.from_tensor_slices(
        ((test_df['user_id_encoded'].values, test_df['place_id_encoded'].values),
         test_df['interaction'].values)
    ).batch(config.BATCH_SIZE)

    history = model.fit(
        train_dataset,
        epochs=config.EPOCHS,
        validation_data=test_dataset,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss', patience=3, restore_best_weights=True
            )
        ]
    )

    return model, history

def predict_recommendations(model, user_id, user_encoder, place_encoder, top_n=10):
    # Get user's visited places to determine their preferred city
    user_query = f"""
        SELECT p.city
        FROM place_view v
        JOIN places p ON v.place_id = p.place_id
        WHERE v.user_id = {user_id}
        GROUP BY p.city
        ORDER BY COUNT(*) DESC
        LIMIT 1
    """
    with engine.connect() as conn:
        preferred_city = pd.read_sql(user_query, conn).iloc[0]['city']

    query = """
        SELECT place_id, place_name, industry_sub, city, indoor, outdoor, 
               pet_size, pet_extra_charge, latitude, longitude
        FROM places
    """
    with engine.connect() as conn:
        places_df = pd.read_sql(query, conn)

    if user_id not in user_encoder.classes_.tolist():
        logger.warning(f"⚠️ Unseen user_id: {user_id}")
        return []

    user_encoded = user_encoder.transform([user_id])[0]

    predictions = []
    for place_id in places_df['place_id']:
        if place_id not in place_encoder.classes_.tolist():
            continue
        place_encoded = place_encoder.transform([place_id])[0]
        user_input = np.array([[user_encoded]])
        place_input = np.array([[place_encoded]])
        pred = model.predict([user_input, place_input], verbose=0)[0][0]
        
        # Get place's city
        place_city = places_df[places_df['place_id'] == place_id].iloc[0]['city']
        
        # Apply city-based weighting (1.5x weight for same city)
        city_weight = 1.5 if place_city == preferred_city else 1.0
        weighted_pred = pred * city_weight
        
        predictions.append((place_id, weighted_pred))

    recommendations = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]

    recommended_places = []
    for place_id, score in recommendations:
        place_info = places_df[places_df['place_id'] == place_id].iloc[0]
        recommended_places.append({
            'place_id': place_id,
            'place_name': place_info['place_name'],
            'score': float(score),
            'industry_sub': place_info['industry_sub'],
            'city': place_info['city'],
            'indoor': place_info['indoor'],
            'outdoor': place_info['outdoor'],
            'pet_size': place_info['pet_size'],
            'pet_extra_charge': place_info['pet_extra_charge'],
            'latitude': place_info['latitude'],
            'longitude': place_info['longitude']
        })

    return recommended_places

def initialize_workflow():
    try:
        df = load_interaction_data()
        train_df, test_df, user_encoder, place_encoder = preprocess_data(df)
        model, history = train_model(train_df, test_df, ModelConfig)
        return model, user_encoder, place_encoder
    except Exception as e:
        logger.error(f"Error initializing workflow: {str(e)}")
        raise
