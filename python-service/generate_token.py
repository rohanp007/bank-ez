import jwt
from datetime import datetime, timedelta

# Secret key for signing the token
SECRET_KEY = "arkrxp"  # Replace with a secure key or use an environment variable

def generate_token(user_id):
    """
    Generate a JWT token for a user with an expiration time.
    """
    payload = {
        "user_id": user_id,                       # Unique identifier for the user
        "exp": datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

# Generate a token for testing
if __name__ == "__main__":
    token = generate_token(user_id=123)  # Replace 123 with the actual user ID
    print("Generated JWT Token:")
    print(token)
