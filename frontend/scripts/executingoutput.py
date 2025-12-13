import json
import time
import sys
import os
import pyautogui
try:
    import keyboard
except ImportError:
    print("Error: 'keyboard' module not found. Please run: pip install keyboard")
    sys.exit(1)

# Fail-safe: Move mouse to upper-left corner to abort
pyautogui.FAILSAFE = True

def load_workflow(file_path):
    """Load the workflow JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {file_path}")
        sys.exit(1)

def get_coordinates(selector):
    """Extract coordinates from selector."""
    if not selector:
        return None
    
    # Try fallback coordinates first as they are most reliable for this task
    if "fallback" in selector and selector["fallback"] and "value" in selector["fallback"]:
        return selector["fallback"]["value"]
    
    # If direct coordinates are provided
    if selector.get("type") == "coordinates" and "value" in selector:
        return selector["value"]
        
    return None

def handle_click(step):
    """Handle CLICK, RIGHT_CLICK, DOUBLE_CLICK actions."""
    coords = get_coordinates(step.get("selector"))
    if not coords:
        print(f"Warning: No coordinates found for step {step['step_id']}")
        return

    x, y = coords['x'], coords['y']
    action = step['action']
    
    print(f"Executing {action} at ({x}, {y})")
    
    if action == "CLICK":
        pyautogui.click(x, y)
    elif action == "RIGHT_CLICK":
        pyautogui.rightClick(x, y)
    elif action == "DOUBLE_CLICK":
        pyautogui.doubleClick(x, y)

def handle_drag(step):
    """Handle DRAG action."""
    coords = get_coordinates(step.get("selector"))
    params = step.get("parameters", {})
    
    if not coords or "end_x" not in params or "end_y" not in params:
        print(f"Warning: Missing coordinates or parameters for DRAG step {step['step_id']}")
        return

    start_x, start_y = coords['x'], coords['y']
    end_x, end_y = params['end_x'], params['end_y']
    
    print(f"Dragging from ({start_x}, {start_y}) to ({end_x}, {end_y})")
    pyautogui.moveTo(start_x, start_y)
    time.sleep(0.2) # Small pause before clicking
    pyautogui.mouseDown()
    time.sleep(0.2) # Small pause after clicking
    pyautogui.moveTo(end_x, end_y, duration=1.0) # Drag with duration
    time.sleep(0.2) # Small pause before releasing
    pyautogui.mouseUp()

def handle_scroll(step):
    """Handle SCROLL action."""
    coords = get_coordinates(step.get("selector"))
    params = step.get("parameters", {})
    
    if coords:
        pyautogui.moveTo(coords['x'], coords['y'])
        
    delta_y = params.get("delta_y", 0)
    print(f"Scrolling by {delta_y}")
    pyautogui.scroll(delta_y)

def handle_keyboard(step):
    """Handle TYPE_TEXT, PRESS_KEY, KEY_COMBINATION actions."""
    action = step['action']
    params = step.get("parameters", {})
    
    if action == "TYPE_TEXT":
        text = params.get("text", "")
        print(f"Typing text: {text}")
        pyautogui.write(text)
        
    elif action == "PRESS_KEY":
        key = params.get("key", "")
        print(f"Pressing key: {key}")
        pyautogui.press(key)
        
    elif action == "KEY_COMBINATION":
        keys = params.get("keys", [])
        # Normalize keys to lowercase to avoid implicit Shift for uppercase letters
        keys = [str(k).lower() for k in keys]
        print(f"Pressing combination: {keys}")
        if keys:
            pyautogui.hotkey(*keys)

def handle_wait(step):
    """Handle WAIT action."""
    params = step.get("parameters", {})
    duration = params.get("duration_seconds", 0)
    print(f"Waiting for {duration} seconds...")
    time.sleep(duration)

def execute_step(step, use_buffer=True):
    """Execute a single workflow step. Returns True if step was a WAIT action."""
    action = step['action']
    
    if action == "WAIT":
        print(f"Step {step['step_id']}: {step['description']}")
        handle_wait(step)
        return True

    # Buffer time to allow UI to load (only if not preceded by a WAIT)
    if use_buffer:
        time.sleep(0.5)
    
    print(f"Step {step['step_id']}: {step['description']}")
    
    if action in ["CLICK", "RIGHT_CLICK", "DOUBLE_CLICK"]:
        handle_click(step)
    elif action == "DRAG":
        handle_drag(step)
    elif action == "SCROLL":
        handle_scroll(step)
    elif action in ["TYPE_TEXT", "PRESS_KEY", "KEY_COMBINATION"]:
        handle_keyboard(step)
    else:
        print(f"Unknown action: {action}")

    # Wait after execution
    wait_time = step.get("wait_after", 0.5)
    time.sleep(wait_time)
    return False

def main():
    # Accept JSON file path as command-line argument
    if len(sys.argv) > 1:
        workflow_path = sys.argv[1]
    else:
        workflow_path = "example.json"
    
    if not os.path.exists(workflow_path):
        print(f"File {workflow_path} not found.")
        return

    workflow = load_workflow(workflow_path)

    # Handle nested workflow format from Nova API
    if "workflow" in workflow:
        workflow = workflow["workflow"]

    # Check and remove last step if it is PRESS_KEY esc
    steps = workflow.get("steps", [])
    if steps:
        last_step = steps[-1]
        if last_step.get("action") == "PRESS_KEY":
            params = last_step.get("parameters", {})
            key = params.get("key", "").lower()
            if key == "esc":
                print(f"Removing last step {last_step['step_id']}: PRESS_KEY esc")
                steps.pop()
    
    print(f"Starting workflow: {workflow.get('name', 'Unnamed')}")
    print("Press Ctrl+C to cancel in terminal, move mouse to upper-left corner, or press ESC to abort.")
    time.sleep(2) # Give user a moment
    
    just_waited = False
    for step in workflow.get("steps", []):
        if keyboard.is_pressed('esc'):
            print("\nESC pressed. Exiting...")
            break
            
        # Pass use_buffer=False if we just waited, otherwise True
        just_waited = execute_step(step, use_buffer=not just_waited)
        
        if keyboard.is_pressed('esc'):
            print("\nESC pressed. Exiting...")
            break
        
    print("Workflow completed.")

if __name__ == "__main__":
    main()
