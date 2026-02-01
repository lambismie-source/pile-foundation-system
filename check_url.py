import requests

url = 'http://154.12.99.54:8888'
try:
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print("Headers:")
    for k, v in response.headers.items():
        print(f"{k}: {v}")
    print("\nContent:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
