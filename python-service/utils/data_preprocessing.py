import pandas as pd

def preprocess_transactions(input_csv, output_csv):
    # Load raw data
    df = pd.read_csv(input_csv)

    # Ensure timestamp is correctly parsed
    df['timestamp'] = pd.to_datetime(df['timestamp'])  # Convert to datetime
    df['hour_of_day'] = df['timestamp'].dt.hour       # Extract hour of day
    df['day_of_week'] = df['timestamp'].dt.dayofweek # Extract day of week
    df = df.drop(columns=['timestamp'])              # Drop raw timestamp
    # Feature engineering
    df['is_high_amount'] = df['amount'].apply(lambda x: 1 if x > 10000 else 0)
    df['transaction_type_encoded'] = df['transaction_type'].astype('category').cat.codes

    # Drop unnecessary columns
    df = df.drop(columns=['transaction_uuid', 'timestamp', 'transaction_type'], errors='ignore')

    # Save processed data
    df.to_csv(output_csv, index=False)
    print(f"Processed data saved to {output_csv}")