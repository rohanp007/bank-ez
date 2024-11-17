from flask import Flask, request, jsonify
import joblib
import pandas as pd
import traceback

app = Flask(__name__)

import jwt

SECRET_KEY = "arkrxp"

@app.before_request
def authenticate():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        decoded = jwt.decode(token.split()[1], SECRET_KEY, algorithms=["HS256"])
        print("Decoded JWT:", decoded)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

# Path to the trained model
MODEL_PATH = r'C:\Users\rohan_gs\bank-ez\python-service\ml\fraud_detection.pkl'

# Load the trained model
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except FileNotFoundError:
    print(f"Error: Model file not found at {MODEL_PATH}. Please train the model first.")
    model = None

# Define the expected features based on the training dataset
EXPECTED_FEATURES = ['amount', 'hour_of_day', 'day_of_week', 'transaction_type_encoded', 'is_high_amount']

@app.route('/predict-fraud', methods=['POST'])
def predict_fraud():
    """
    Predict if a transaction is fraudulent.
    """
    try:
        if model is None:
            return jsonify({"error": "Model not loaded. Ensure the model file exists."}), 500

        # Parse transaction data from the request
        transaction = request.json
        if not transaction:
            return jsonify({"error": "No transaction data provided."}), 400

        # Create a DataFrame from the transaction
        df = pd.DataFrame([transaction])

        # Ensure all expected features are present
        missing_features = [feature for feature in EXPECTED_FEATURES if feature not in df.columns]
        if missing_features:
            return jsonify({"error": f"Missing features: {missing_features}"}), 400

        # Predict probabilities
        fraud_probability = model.predict_proba(df[EXPECTED_FEATURES])[:, 1][0]  # Probability of fraud (class 1)

        # Set a threshold for fraud detection
        threshold = 0.4
        is_fraud = bool(fraud_probability > threshold)

        return jsonify({
            "is_fraud": is_fraud,
            "fraud_probability": fraud_probability,
            "reason": "Predicted as fraud" if is_fraud else "Transaction is normal"
        })

    except Exception as e:
        print("Error during prediction:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)