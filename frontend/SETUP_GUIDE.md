# Shadow Worker - Complete Setup Guide

## 🎯 Overview

Shadow Worker is an AI-powered workflow automation system that:
1. **Records** your computer interactions (clicks, typing, etc.)
2. **Sends** the recording to Amazon Nova Pro API for intelligent workflow generation
3. **Executes** the generated workflow automatically or on-demand

---

## 📋 Prerequisites

- **Windows OS** (required for pywinauto and keyboard automation)
- **Node.js & npm** (for the frontend)
- **Python 3.8+** (for the backend)
- **Amazon Nova Pro API** running on `localhost:8000`

---

## 🚀 Installation Steps

### Step 1: Install Python Dependencies

Open a terminal in the project directory and run:

```bash
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- Flask-CORS (API communication)
- pynput (input recording)
- pyautogui (automation execution)
- keyboard (hotkey detection)
- pywinauto (Windows UI automation)
- requests (API client)

### Step 2: Install Node.js Dependencies

```bash
npm install
```

### Step 3: Create Required Folders

The system will auto-create these, but you can create them manually:

```bash
mkdir jsonsrc
```

- `jsonsrc/` - Stores generated workflow JSON files from Nova Pro API
- `Desktop/WorkflowRecorder/` - Auto-created for recording data

### Step 4: Configure Your Setup (Optional)

Edit [scripts/config.py](scripts/config.py) to customize:

```python
# API Configuration
NOVA_API_BASE_URL = "http://localhost:8000"  # Your Nova Pro API
NOVA_API_ENDPOINT = "/generate/friend-format"

# Auto-execution configuration
AUTO_EXECUTE_AFTER_GENERATION = False  # Set to True for auto-run
EXECUTION_DELAY_SECONDS = 3  # Countdown before auto-execution
```

---

## 🎮 Running the System

You need **3 terminals** running simultaneously:

### Terminal 1: Amazon Nova Pro API (Your Backend)

```bash
# Navigate to your Nova Pro API directory
cd C:\Dev\bedrock-workflow-generator
python -m src.api.main
```

This should start on `http://localhost:8000`

### Terminal 2: Shadow Worker Backend (Flask Server)

```bash
# In the shadow-assistant-console directory
cd shadow-assistant-console
python scripts/server.py
```

This starts the Flask server on `http://localhost:5000`

### Terminal 3: Shadow Worker Frontend (React App)

```bash
# In the shadow-assistant-console directory
npm run dev
```

This starts the React app on `http://localhost:8080`

---

## 💡 How to Use

### 1️⃣ Record a Workflow

1. Open the web interface at `http://localhost:8080`
2. Click **"Teach new workflow"** button
3. Perform your actions (clicks, typing, etc.) on your computer
4. Press **ESC** to stop recording
5. The system automatically:
   - Saves the recording to `Desktop/WorkflowRecorder/`
   - Sends it to Nova Pro API
   - Saves the generated workflow to `jsonsrc/`
   - Shows workflow generation status in the UI

### 2️⃣ Execute a Workflow

**Option A: Manual Execution**
1. Select a workflow from the dropdown
2. Click **"Start Execute"**
3. The workflow runs automatically

**Option B: Auto-Execution (if enabled in config.py)**
- After recording stops, the workflow executes automatically after 3 seconds

### 3️⃣ Stop Anytime

- During recording: Press **ESC**
- During execution: Press **ESC** or click **"Force Stop Execute"**

---

## 🔍 System Flow Diagram

```
┌─────────────────┐
│  1. User clicks │
│ "Teach workflow"│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  2. generate.py starts  │
│  Recording: Mouse,      │
│  Keyboard, UI elements  │
└────────┬────────────────┘
         │ (Press ESC)
         ▼
┌─────────────────────────┐
│ 3. Saves commands.json  │
│ to WorkflowRecorder/    │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. server.py detects     │
│ recording finished       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. nova_api_client.py    │
│ sends commands.json to   │
│ Nova Pro API             │
│ (localhost:8000)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Nova Pro generates    │
│ optimized workflow JSON  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. Saves workflow to     │
│ jsonsrc/workflow_*.json  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 8. User selects workflow │
│ and clicks Execute       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 9. executingoutput.py    │
│ runs the workflow        │
│ (automating actions)     │
└──────────────────────────┘
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [scripts/generate.py](scripts/generate.py) | Records user actions to JSON |
| [scripts/server.py](scripts/server.py) | Flask backend API server |
| [scripts/nova_api_client.py](scripts/nova_api_client.py) | Communicates with Nova Pro API |
| [scripts/executingoutput.py](scripts/executingoutput.py) | Executes generated workflows |
| [scripts/config.py](scripts/config.py) | Configuration settings |
| [src/pages/HomePage.tsx](src/pages/HomePage.tsx) | Main UI for record/execute |
| `jsonsrc/` | Stores generated workflow files |

---

## 🐛 Troubleshooting

### "Cannot connect to backend server"
- Make sure `python scripts/server.py` is running
- Check if port 5000 is available

### "Cannot connect to Nova Pro API"
- Verify your Nova Pro API is running on `localhost:8000`
- Test with: `curl http://localhost:8000/generate/friend-format`
- Check [scripts/config.py](scripts/config.py) for correct URL

### "No workflows available"
- Recording must complete successfully first
- Check `jsonsrc/` folder for generated JSON files
- Check backend logs for Nova API errors

### Recording not working
- Run terminal as Administrator (Windows UAC may block input recording)
- Check if Python packages are installed: `pip list`

### Execution fails
- Ensure screen coordinates haven't changed
- Generated workflow may need manual adjustment
- Check execution logs in the UI

---

## ⚙️ Advanced Configuration

### Change Nova Pro API Endpoint

Edit [scripts/config.py](scripts/config.py):

```python
NOVA_API_BASE_URL = "http://your-server:port"
NOVA_API_ENDPOINT = "/your-endpoint"
```

### Enable Auto-Execution

Edit [scripts/config.py](scripts/config.py):

```python
AUTO_EXECUTE_AFTER_GENERATION = True
EXECUTION_DELAY_SECONDS = 5  # Wait 5 seconds before executing
```

### Change Recording Location

Edit [scripts/config.py](scripts/config.py):

```python
WORKFLOW_RECORDER_DIR = "C:/YourPath/Recordings"
```

---

## 🎉 You're All Set!

Your Shadow Worker system is now connected end-to-end:
- ✅ Records interactions
- ✅ Sends to Nova Pro API
- ✅ Generates optimized workflows
- ✅ Executes automatically or on-demand

Happy automating! 🚀
