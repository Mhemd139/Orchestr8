import os
import subprocess
import threading
import time
import queue
import glob
from flask import Flask, jsonify, request
from flask_cors import CORS
from pynput import keyboard
from nova_api_client import process_latest_recording
from config import WORKFLOW_RECORDER_DIR, AUTO_EXECUTE_AFTER_GENERATION, EXECUTION_DELAY_SECONDS

app = Flask(__name__)
CORS(app)

# Global state for recording
process = None
events_queue = []
is_running = False
stop_requested = False
latest_workflow_dir = None  # Track the latest recording directory

# Global state for execution
exec_process = None
exec_events_queue = []
is_executing = False
exec_stop_requested = False

# Global state for Nova API processing
is_processing_nova = False
nova_processing_status = ""
latest_generated_workflow = None

def read_output(proc, event_queue, is_running_flag_name):
    """Reads stdout from the process and appends to the specified event queue."""
    global is_running, is_executing, latest_workflow_dir
    for line in iter(proc.stdout.readline, ''):
        if line:
            clean_line = line.strip()
            print(f"[Script Output] {clean_line}")
            event_queue.append({
                "timestamp": time.strftime("%H:%M:%S"),
                "message": clean_line
            })

            # Capture the final folder path from generate.py output
            if is_running_flag_name == 'recording' and "Final Folder:" in clean_line:
                folder_path = clean_line.split("Final Folder:")[-1].strip()
                latest_workflow_dir = folder_path
                print(f"[Server] Captured workflow directory: {latest_workflow_dir}")

    proc.stdout.close()

    # Update the appropriate flag
    if is_running_flag_name == 'recording':
        is_running = False
        # After recording stops, process with Nova API
        if latest_workflow_dir:
            threading.Thread(target=process_with_nova_api, daemon=True).start()
    elif is_running_flag_name == 'execution':
        is_executing = False
    print(f"Process finished reading output ({is_running_flag_name}).")


def process_with_nova_api():
    """Process the latest recording with Nova API in a background thread."""
    global is_processing_nova, nova_processing_status, latest_generated_workflow, latest_workflow_dir

    try:
        is_processing_nova = True
        nova_processing_status = "Sending recording to Nova Pro API..."
        print("[Nova API] Starting processing...")

        # Add event to the queue
        events_queue.append({
            "timestamp": time.strftime("%H:%M:%S"),
            "message": "📤 Sending recording to Nova Pro API for workflow generation..."
        })

        # Process with Nova API
        success, output_path, error = process_latest_recording(latest_workflow_dir)

        if success:
            nova_processing_status = "Workflow generated successfully!"
            latest_generated_workflow = os.path.basename(output_path)
            events_queue.append({
                "timestamp": time.strftime("%H:%M:%S"),
                "message": f"✓ Workflow generated: {latest_generated_workflow}"
            })
            print(f"[Nova API] Success! Generated: {latest_generated_workflow}")

            # Auto-execute if configured
            if AUTO_EXECUTE_AFTER_GENERATION:
                events_queue.append({
                    "timestamp": time.strftime("%H:%M:%S"),
                    "message": f"⏳ Auto-execution will start in {EXECUTION_DELAY_SECONDS} seconds..."
                })
                time.sleep(EXECUTION_DELAY_SECONDS)

                # Trigger auto-execution
                threading.Thread(target=auto_execute_workflow, args=(latest_generated_workflow,), daemon=True).start()
        else:
            nova_processing_status = f"Error: {error}"
            events_queue.append({
                "timestamp": time.strftime("%H:%M:%S"),
                "message": f"✗ Nova API Error: {error}"
            })
            print(f"[Nova API] Error: {error}")

    except Exception as e:
        nova_processing_status = f"Exception: {str(e)}"
        events_queue.append({
            "timestamp": time.strftime("%H:%M:%S"),
            "message": f"✗ Exception: {str(e)}"
        })
        print(f"[Nova API] Exception: {e}")
    finally:
        is_processing_nova = False


def auto_execute_workflow(workflow_filename):
    """Auto-execute a workflow after generation."""
    global exec_process, is_executing, exec_events_queue

    if is_executing:
        print("[Auto-Execute] Already executing, skipping...")
        return

    try:
        print(f"[Auto-Execute] Starting execution of {workflow_filename}")

        # Reset state
        exec_events_queue = []

        # Build path to JSON file
        project_root = os.path.dirname(os.path.dirname(__file__))
        json_path = os.path.join(project_root, 'jsonsrc', workflow_filename)

        if not os.path.exists(json_path):
            print(f"[Auto-Execute] Workflow file not found: {json_path}")
            return

        # Path to executingoutput.py
        script_path = os.path.join(os.path.dirname(__file__), 'executingoutput.py')

        # Start the process
        exec_process = subprocess.Popen(
            ['python', '-u', script_path, json_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=os.path.dirname(__file__)
        )

        is_executing = True

        # Start thread to read output
        thread = threading.Thread(target=read_output, args=(exec_process, exec_events_queue, 'execution'))
        thread.daemon = True
        thread.start()

        print(f"[Auto-Execute] Started execution of {workflow_filename}")
    except Exception as e:
        print(f"[Auto-Execute] Error: {e}")


@app.route('/start', methods=['POST'])
def start_recording():
    global process, is_running, events_queue, stop_requested
    
    if is_running:
        return jsonify({"status": "error", "message": "Already running"}), 400

    try:
        # Reset state
        events_queue = []
        stop_requested = False
        
        # Path to generate.py - assuming it's in the same directory as server.py
        script_path = os.path.join(os.path.dirname(__file__), 'generate.py')
        
        # Start the process with unbuffered output (-u)
        process = subprocess.Popen(
            ['python', '-u', script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=os.path.dirname(__file__) # Run in scripts dir
        )
        
        is_running = True
        
        # Start thread to read output
        thread = threading.Thread(target=read_output, args=(process, events_queue, 'recording'))
        thread.daemon = True
        thread.start()
        
        return jsonify({"status": "success", "message": "Recording started"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop_recording():
    global stop_requested
    
    if not is_running:
        return jsonify({"status": "error", "message": "Not running"}), 400
        
    try:
        # Simulate ESC key press to gracefully stop the script
        keyboard_controller = keyboard.Controller()
        keyboard_controller.press(keyboard.Key.esc)
        keyboard_controller.release(keyboard.Key.esc)
        stop_requested = True
        return jsonify({"status": "success", "message": "Stop signal sent"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    global is_running, is_processing_nova
    # Check if process is actually still alive
    if process and process.poll() is not None:
        is_running = False

    return jsonify({
        "running": is_running,
        "events_count": len(events_queue),
        "processing_nova": is_processing_nova,
        "nova_status": nova_processing_status,
        "latest_workflow": latest_generated_workflow
    })

@app.route('/events', methods=['GET'])
def get_events():
    return jsonify({
        "events": events_queue
    })

# ===== EXECUTION ENDPOINTS =====

@app.route('/list-workflows', methods=['GET'])
def list_workflows():
    """List all JSON files in the jsonsrc folder."""
    try:
        # Get the project root (parent of scripts folder)
        project_root = os.path.dirname(os.path.dirname(__file__))
        jsonsrc_path = os.path.join(project_root, 'jsonsrc')
        
        if not os.path.exists(jsonsrc_path):
            os.makedirs(jsonsrc_path)
            return jsonify({"workflows": []})
        
        # Get all JSON files
        json_files = [f for f in os.listdir(jsonsrc_path) if f.endswith('.json')]
        
        return jsonify({"workflows": json_files})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/execute/start', methods=['POST'])
def start_execution():
    global exec_process, is_executing, exec_events_queue, exec_stop_requested
    
    if is_executing:
        return jsonify({"status": "error", "message": "Already executing"}), 400
    
    try:
        data = request.json
        workflow_file = data.get('workflow_file')
        
        if not workflow_file:
            return jsonify({"status": "error", "message": "No workflow file specified"}), 400
        
        # Reset state
        exec_events_queue = []
        exec_stop_requested = False
        
        # Build path to JSON file
        project_root = os.path.dirname(os.path.dirname(__file__))
        json_path = os.path.join(project_root, 'jsonsrc', workflow_file)
        
        if not os.path.exists(json_path):
            return jsonify({"status": "error", "message": f"Workflow file not found: {workflow_file}"}), 404
        
        # Path to executingoutput.py
        script_path = os.path.join(os.path.dirname(__file__), 'executingoutput.py')
        
        # Start the process with unbuffered output (-u) and pass JSON file path
        exec_process = subprocess.Popen(
            ['python', '-u', script_path, json_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=os.path.dirname(__file__)
        )
        
        is_executing = True
        
        # Start thread to read output
        thread = threading.Thread(target=read_output, args=(exec_process, exec_events_queue, 'execution'))
        thread.daemon = True
        thread.start()
        
        return jsonify({"status": "success", "message": f"Execution started for {workflow_file}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/execute/stop', methods=['POST'])
def stop_execution():
    global exec_stop_requested
    
    if not is_executing:
        return jsonify({"status": "error", "message": "Not executing"}), 400
        
    try:
        # Simulate ESC key press to gracefully stop the script
        keyboard_controller = keyboard.Controller()
        keyboard_controller.press(keyboard.Key.esc)
        keyboard_controller.release(keyboard.Key.esc)
        exec_stop_requested = True
        return jsonify({"status": "success", "message": "Stop signal sent"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/execute/status', methods=['GET'])
def get_execution_status():
    global is_executing
    # Check if process is actually still alive
    if exec_process and exec_process.poll() is not None:
        is_executing = False
        
    return jsonify({
        "running": is_executing,
        "events_count": len(exec_events_queue)
    })

@app.route('/execute/events', methods=['GET'])
def get_execution_events():
    return jsonify({
        "events": exec_events_queue
    })

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(port=5000, debug=True)

