import os
import time
import json
from datetime import datetime, timezone
from pynput import mouse, keyboard
# --- NEW: Import pywinauto ---
import pywinauto
from pywinauto import Desktop
from pywinauto.uia_element_info import UIAElementInfo

# --- Global state variables ---
mouse_press_time = 0
mouse_press_pos = (0, 0)
key_buffer = []
last_key_time = 0
action_counter = 0
action_log_list = []  # We will build the log in this list

# --- Hotkey / Key State Management ---
current_keys = set()
MODIFIER_KEYS = {
    keyboard.Key.ctrl, keyboard.Key.ctrl_l, keyboard.Key.ctrl_r,
    keyboard.Key.shift, keyboard.Key.shift_l, keyboard.Key.shift_r,
    keyboard.Key.alt, keyboard.Key.alt_l, keyboard.Key.alt_r,
    keyboard.Key.cmd, keyboard.Key.cmd_l, keyboard.Key.cmd_r
}

# --- Directory and Log Setup ---
try:
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
except Exception as e:
    print(f"Could not find Desktop, using current directory. Error: {e}")
    desktop_path = os.getcwd()

main_workflow_dir = os.path.join(desktop_path, "WorkflowRecorder")

if not os.path.exists(main_workflow_dir):
    try:
        os.makedirs(main_workflow_dir)
        print(f"Created main directory at: {main_workflow_dir}")
    except Exception as e:
        print(f"Error creating main directory: {e}. Using current folder.")
        main_workflow_dir = os.getcwd()

start_time_seconds = int(time.time())
start_time_folder_str = time.strftime("%d-%H-%M-%S", time.localtime(start_time_seconds))
start_time_iso_log = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

temp_dir_name = f"workflow_{start_time_folder_str}_temp"
temp_dir_path = os.path.join(main_workflow_dir, temp_dir_name)

os.makedirs(temp_dir_path)
# --- REMOVED: No 'screenshots' directory is created ---
log_file_path = os.path.join(temp_dir_path, "commands.json")


# --- Function Definitions ---

def get_iso_timestamp():
    """Helper function to get the current time in the required ISO format."""
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


# --- NEW: Helper function to extract element info ---
def get_element_info(element: UIAElementInfo):
    """Safely extracts key information from a UIAElementInfo object."""
    if not element:
        return {"name": "Unknown", "control_type": "Unknown", "automation_id": ""}
    try:
        return {
            "name": element.name,
            "control_type": element.control_type,
            "automation_id": element.automation_id,
        }
    except Exception:
        return {"name": "Unknown", "control_type": "Error", "automation_id": ""}


# --- NEW: Helper function to get element from (x, y) coords ---
def get_element_from_point(x, y):
    """Gets the UIA element info at a specific screen coordinate."""
    try:
        # This is the core pywinauto inspection
        element_wrapper = Desktop(backend="uia").from_point(x, y)
        return get_element_info(element_wrapper.element_info)
    except Exception as e:
        print(f"Error getting element at ({x},{y}): {e}")
        return {"name": "Error", "control_type": "Exception", "automation_id": ""}


# --- NEW: Helper function to get the currently focused element ---
def get_focused_element_info():
    """Gets the UIA element info for the currently focused element."""
    try:
        # This is much faster than a screen-wide search
        focused_element = UIAElementInfo.get_focused_element()
        return get_element_info(focused_element)
    except Exception as e:
        print(f"Error getting focused element: {e}")
        return {"name": "Error", "control_type": "Exception", "automation_id": ""}


# --- MODIFIED: log_action no longer takes screenshots ---
def log_action(command, params={}, element={}):
    """Appends a structured action object to the global log list."""
    global action_counter
    action_counter += 1  # Increment step counter

    action_data = {
        "step": action_counter,
        "timestamp": get_iso_timestamp(),
        "command": command,
        "parameters": params,
        "element": element  # Add the new element info
    }
    action_log_list.append(action_data)
    print(f"LOG: {action_data}")


# --- MODIFIED: flush_key_buffer logs the focused element ---
def flush_key_buffer():
    """Writes any pending keystrokes to the log as a single TYPE command."""
    global key_buffer, last_key_time
    if key_buffer:
        # Get info on the element that has focus (e.g., the text box)
        element_info = get_focused_element_info()

        typed_string = "".join(key_buffer)
        typed_string_sanitized = typed_string.replace("\n", "\\n").replace("\r", "\\r")

        log_params = {"text": typed_string_sanitized}
        log_action("TYPE", params=log_params, element=element_info)

        key_buffer = []
    last_key_time = time.time()


# --- MODIFIED: on_click logs element info, not screenshots ---
def on_click(x, y, button, pressed):
    """Called when the mouse is clicked (pressed or released)."""
    global mouse_press_time, mouse_press_pos

    if (time.time() - last_key_time) > 0.5:
        flush_key_buffer()

    if pressed:
        mouse_press_time = time.time()
        mouse_press_pos = (x, y)
    else:
        # Get info on the element being clicked
        element_info = get_element_from_point(x, y)

        distance_sq = (x - mouse_press_pos[0]) ** 2 + (y - mouse_press_pos[1]) ** 2

        if distance_sq > 15 ** 2:
            log_params = {
                "start_x": mouse_press_pos[0],
                "start_y": mouse_press_pos[1],
                "end_x": x,
                "end_y": y
            }
            log_action("DRAG", params=log_params, element=element_info)
        else:
            log_params = {"x": x, "y": y, "button": str(button)}
            log_action("CLICK", params=log_params, element=element_info)


# --- MODIFIED: on_scroll logs the element being scrolled over ---
def on_scroll(x, y, dx, dy):
    """Called when the mouse wheel is scrolled."""
    flush_key_buffer()

    # Get info on the element being scrolled
    element_info = get_element_from_point(x, y)
    log_params = {"x": x, "y": y, "delta_x": dx, "delta_y": dy}
    log_action("SCROLL", params=log_params, element=element_info)


# --- MODIFIED: on_press logs the focused element ---
def on_press(key):
    """Called when a keyboard key is pressed."""
    global last_key_time, key_buffer, current_keys

    current_keys.add(key)

    is_char = hasattr(key, 'char')
    is_modifier = key in MODIFIER_KEYS
    other_mods = {k for k in current_keys if k in MODIFIER_KEYS and k not in {
        keyboard.Key.shift, keyboard.Key.shift_l, keyboard.Key.shift_r
    }}

    if is_char:
        if other_mods:
            flush_key_buffer()
            element_info = get_focused_element_info()  # Get focused element
            key_list = [str(k) for k in current_keys]
            log_params = {"keys": sorted(key_list)}
            log_action("HOTKEY", params=log_params, element=element_info)
        else:
            if (time.time() - last_key_time) > 1.0 and key_buffer:
                flush_key_buffer()
            last_key_time = time.time()
            key_buffer.append(key.char)

    elif is_modifier:
        pass

    else:
        flush_key_buffer()
        element_info = get_focused_element_info()  # Get focused element
        if other_mods:
            key_list = [str(k) for k in current_keys]
            log_params = {"keys": sorted(key_list)}
            log_action("HOTKEY", params=log_params, element=element_info)
        else:
            log_params = {"key": str(key)}
            log_action("PRESS", params=log_params, element=element_info)


def on_release(key):
    """Called when a keyboard key is released."""
    global action_counter, temp_dir_path, main_workflow_dir, start_time_seconds, start_time_folder_str, start_time_iso_log, action_log_list, log_file_path, current_keys

    try:
        current_keys.remove(key)
    except KeyError:
        pass

    if key == keyboard.Key.esc:
        print("\n--- Recording stopped. ---")
        flush_key_buffer()
        # Add a final STOP event, with no element
        log_action("STOP", params={}, element={"name": "N/A", "control_type": "N/A", "automation_id": "N/A"})

        # --- Finalize and write the JSON file ---
        final_json_data = {
            "metadata": {
                "startTimeSeconds": start_time_seconds,
                "startTimeFormatted": start_time_iso_log,
                "totalSteps": action_counter
            },
            "actions": action_log_list
        }
        try:
            with open(log_file_path, 'w', encoding='utf-8') as f:
                json.dump(final_json_data, f, indent=4)
            print(f"Successfully saved JSON log to {log_file_path}")
        except Exception as e:
            print(f"Error writing JSON file: {e}")

        # --- Rename the folder ---
        final_dir_name = f"workflow_{start_time_folder_str}_{action_counter}_steps"
        final_dir_path = os.path.join(main_workflow_dir, final_dir_name)

        try:
            os.rename(temp_dir_path, final_dir_path)
            print(f"Workflow saved successfully!")
            print(f"Total Steps: {action_counter}")
            print(f"Final Folder: {final_dir_path}")
        except OSError as e:
            print(f"Error renaming directory: {e}")
            print(f"Data is still saved in: {temp_dir_path}")

        # Stop listeners
        mouse_listener.stop()
        return False  # This stops the keyboard listener


# --- Main Execution ---
print(f"Recording workflow with pywinauto (NO IMAGES)...")
print(f"This script works on Windows only.")
print(f"Saving data to temporary folder: {temp_dir_path}")
print("Press 'Esc' to stop.")

mouse_listener = mouse.Listener(on_click=on_click, on_scroll=on_scroll)
keyboard_listener = keyboard.Listener(on_press=on_press, on_release=on_release)

keyboard_listener.start()
mouse_listener.start()

keyboard_listener.join()
mouse_listener.join()