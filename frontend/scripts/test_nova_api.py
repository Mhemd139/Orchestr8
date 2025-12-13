"""
Quick test script to verify Nova Pro API connection
"""
import requests
import json
from config import NOVA_API_BASE_URL, NOVA_API_ENDPOINT


def test_nova_api():
    """Test if Nova Pro API is reachable and responding."""
    api_url = f"{NOVA_API_BASE_URL}{NOVA_API_ENDPOINT}"

    print("=" * 60)
    print("Testing Nova Pro API Connection")
    print("=" * 60)
    print(f"API URL: {api_url}")
    print()

    # Sample test payload (minimal recording data)
    test_payload = {
        "metadata": {
            "startTimeSeconds": 1234567890,
            "startTimeFormatted": "2024-01-01T12:00:00Z",
            "totalSteps": 2
        },
        "actions": [
            {
                "step": 1,
                "timestamp": "2024-01-01T12:00:01Z",
                "command": "CLICK",
                "parameters": {"x": 100, "y": 100, "button": "Button.left"},
                "element": {"name": "TestButton", "control_type": "Button", "automation_id": ""}
            },
            {
                "step": 2,
                "timestamp": "2024-01-01T12:00:02Z",
                "command": "TYPE",
                "parameters": {"text": "Hello World"},
                "element": {"name": "TestInput", "control_type": "Edit", "automation_id": ""}
            }
        ]
    }

    try:
        print("Sending test request...")
        response = requests.post(
            api_url,
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        print(f"Status Code: {response.status_code}")
        print()

        if response.status_code == 200:
            print("✓ SUCCESS! Nova Pro API is responding correctly.")
            print()
            print("Response preview:")
            print("-" * 60)
            response_data = response.json()
            print(json.dumps(response_data, indent=2)[:500] + "...")
            print("-" * 60)
            return True
        else:
            print("✗ FAILED! API returned an error.")
            print()
            print("Response:")
            print(response.text[:500])
            return False

    except requests.exceptions.ConnectionError:
        print("✗ CONNECTION ERROR!")
        print()
        print("Cannot connect to Nova Pro API.")
        print(f"Make sure your API is running on {NOVA_API_BASE_URL}")
        print()
        print("To start your Nova Pro API, run:")
        print("  python -m src.api.main")
        return False

    except requests.exceptions.Timeout:
        print("✗ TIMEOUT ERROR!")
        print()
        print("The API did not respond within 30 seconds.")
        return False

    except Exception as e:
        print(f"✗ UNEXPECTED ERROR: {e}")
        return False


if __name__ == "__main__":
    success = test_nova_api()
    print()
    print("=" * 60)

    if success:
        print("Your Nova Pro API is ready to use! 🎉")
        print()
        print("Next steps:")
        print("  1. Start the Flask server: python scripts/server.py")
        print("  2. Start the React app: npm run dev")
        print("  3. Open http://localhost:8080")
    else:
        print("Please fix the API connection before proceeding.")
        print()
        print("Configuration file: scripts/config.py")

    print("=" * 60)
