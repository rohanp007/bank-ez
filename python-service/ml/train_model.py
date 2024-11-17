from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pandas as pd
import joblib


# Load dataset
df = pd.read_csv(r'C:\Users\rohan_gs\bank-ez\python-service\utils\processed_transactions.csv')

# Prepare features (X) and target (y)
features = ['amount', 'hour_of_day', 'day_of_week', 'transaction_type_encoded', 'is_high_amount']
X = df[features]  # Features
y = df['is_fraud']                # Target

# Split into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),       # Scale features
    ('smote', SMOTE(random_state=42)),  # Apply SMOTE to balance classes
    ('model', RandomForestClassifier(random_state=42))  # Train Random Forest
])

# Train the pipeline
pipeline.fit(X_train, y_train)

joblib.dump(pipeline, 'fraud_detection.pkl')
print("Pipeline saved to fraud_detection.pkl")


# Make predictions
y_pred = pipeline.predict(X_test)

# Evaluate the model
print("Classification Report:")
print(classification_report(y_test, y_pred))