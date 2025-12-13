"""
Client for communicating with Amazon Nova Pro API
"""
import requests
import json
import os
import time
from datetime import datetime
from config import NOVA_API_BASE_URL, NOVA_API_ENDPOINT, JSONSRC_DIR


def send_to_nova_api(commands_json_path, workflow_name=None):
    """
    Send the recorded commands.json to Nova Pro API and save the generated workflow.

    Args:
        commands_json_path: Path to the commands.json file from recording
        workflow_name: Optional name for the workflow, otherwise auto-generated

    Returns:
        tuple: (success: bool, output_path: str or None, error_message: str or None)
    """
    try:
        # Read the commands.json file
        print(f"Reading recording from: {commands_json_path}")
        with open(commands_json_path, 'r', encoding='utf-8') as f:
            recording_data = json.load(f)

        print(f"Loaded {len(recording_data.get('actions', []))} actions from recording")

        # Prepare the payload for Nova API
        # The API expects the recording data to be sent
        payload = recording_data

        # Make the API request
        api_url = f"{NOVA_API_BASE_URL}{NOVA_API_ENDPOINT}"
        print(f"Sending to Nova Pro API: {api_url}")

        response = requests.post(
            api_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=120  # 2 minute timeout for generation
        )

        if response.status_code != 200:
            error_msg = f"API returned status {response.status_code}: {response.text}"
            print(f"Error: {error_msg}")
            return False, None, error_msg

        # Parse the response
        generated_workflow = response.json()
        print("Successfully received workflow from Nova Pro API")

        # Generate filename
        if not workflow_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            workflow_name = f"workflow_{timestamp}"

        # Ensure .json extension
        if not workflow_name.endswith('.json'):
            workflow_name += '.json'

        # Save to jsonsrc directory
        output_path = os.path.join(JSONSRC_DIR, workflow_name)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(generated_workflow, f, indent=2)

        print(f"Saved generated workflow to: {output_path}")
        return True, output_path, None

    except requests.exceptions.ConnectionError:
        error_msg = "Cannot connect to Nova Pro API. Is it running on http://localhost:8000?"
        print(f"Error: {error_msg}")
        return False, None, error_msg

    except requests.exceptions.Timeout:
        error_msg = "Nova Pro API request timed out"
        print(f"Error: {error_msg}")
        return False, None, error_msg

    except json.JSONDecodeError as e:
        error_msg = f"Invalid JSON in recording file: {e}"
        print(f"Error: {error_msg}")
        return False, None, error_msg

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"Error: {error_msg}")
        return False, None, error_msg


def process_latest_recording(workflow_dir_path, workflow_name=None):
    """
    Process the latest recording from a WorkflowRecorder directory.

    Args:
        workflow_dir_path: Path to the workflow directory (e.g., workflow_19-14-30-45_123_steps)
        workflow_name: Optional name for the workflow

    Returns:
        tuple: (success: bool, output_path: str or None, error_message: str or None)
    """
    commands_json_path = os.path.join(workflow_dir_path, "commands.json")

    if not os.path.exists(commands_json_path):
        error_msg = f"commands.json not found in {workflow_dir_path}"
        print(f"Error: {error_msg}")
        return False, None, error_msg

    # Extract workflow name from directory if not provided
    if not workflow_name:
        dir_name = os.path.basename(workflow_dir_path)
        workflow_name = dir_name.replace('_temp', '')

    return send_to_nova_api(commands_json_path, workflow_name)


if __name__ == "__main__":
    # Test script
    import sys

    if len(sys.argv) < 2:
        print("Usage: python nova_api_client.py <path_to_commands.json> [workflow_name]")
        sys.exit(1)

    commands_path = sys.argv[1]
    workflow_name = sys.argv[2] if len(sys.argv) > 2 else None

    success, output_path, error = send_to_nova_api(commands_path, workflow_name)

    if success:
        print(f"\n✓ Success! Workflow saved to: {output_path}")
        sys.exit(0)
    else:
        print(f"\n✗ Failed: {error}")
        sys.exit(1)
