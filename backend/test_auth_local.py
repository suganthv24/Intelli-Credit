import requests
import json

def test_signup():
    url = "http://127.0.0.1:8000/auth/signup"
    payload = {
        "name": "Test User",
        "email": "test2@example.com",
        "organization": "Test Bank",
        "role": "Credit Analyst",
        "password": "testingpassword123"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_signup()
