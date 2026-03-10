import requests

def test_flow():
    base_url = "http://127.0.0.1:8000/auth"
    
    # 1. Signup
    signup_payload = {
        "name": "Integration Test",
        "email": "integration@test.com",
        "organization": "Test Org",
        "role": "Analyst",
        "password": "Password123!"
    }
    print("Signing up...")
    res = requests.post(f"{base_url}/signup", json=signup_payload)
    print(res.status_code, res.text)
    
    # 2. Login
    login_payload = {
        "email": "integration@test.com",
        "password": "Password123!"
    }
    print("\nLogging in...")
    res2 = requests.post(f"{base_url}/login", json=login_payload)
    print(res2.status_code, res2.text)

if __name__ == "__main__":
    test_flow()
