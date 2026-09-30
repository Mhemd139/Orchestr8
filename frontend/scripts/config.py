# Configuration for the Orchestr8 recorder/executor bridge
import os

# API Configuration
NOVA_API_BASE_URL = "http://localhost:8000"
NOVA_API_ENDPOINT = "/generate/friend-format"

# Paths Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
JSONSRC_DIR = os.path.join(PROJECT_ROOT, "jsonsrc")
WORKFLOW_RECORDER_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "WorkflowRecorder")

# Ensure directories exist
os.makedirs(JSONSRC_DIR, exist_ok=True)
os.makedirs(WORKFLOW_RECORDER_DIR, exist_ok=True)

# Auto-execution configuration
AUTO_EXECUTE_AFTER_GENERATION = False  # Set to True to auto-execute after workflow generation
EXECUTION_DELAY_SECONDS = 3  # Countdown before auto-execution starts
