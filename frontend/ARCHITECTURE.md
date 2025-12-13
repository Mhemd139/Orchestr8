# Shadow Worker - System Architecture

## 🏗️ Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Shadow Worker System                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React Frontend │◄────►│  Flask Backend   │◄────►│  Nova Pro API   │
│   (Port 8080)    │      │   (Port 5000)    │      │   (Port 8000)   │
└──────────────────┘      └──────────────────┘      └─────────────────┘
         │                         │                          │
         │                         │                          │
    [User UI]              [Python Scripts]          [AI Generation]
         │                         │                          │
         ▼                         ▼                          ▼
  ┌─────────────┐         ┌──────────────┐          ┌──────────────┐
  │ HomePage.tsx│         │ generate.py  │          │ Amazon Bedrock│
  │ Components  │         │ server.py    │          │ Nova Pro Model│
  └─────────────┘         │ nova_api_*.py│          └──────────────┘
                          │ executing*.py│
                          └──────────────┘
```

---

## 📊 Data Flow Diagram

### Phase 1: Recording

```
User Actions → generate.py → commands.json
     │              │               │
     │              │               └─ Stored in:
     │              │                  Desktop/WorkflowRecorder/
     │              │
     │              └─ Captures:
     │                 • Mouse clicks (x, y)
     │                 • Keyboard input
     │                 • UI element info
     │                 • Timestamps
     │
     └─ User performs:
        • Clicks
        • Types
        • Scrolls
        • Drags
```

### Phase 2: AI Generation

```
commands.json → nova_api_client.py → Nova Pro API → Generated Workflow
     │                  │                   │                │
     │                  │                   │                └─ Optimized JSON
     │                  │                   │                   with actions
     │                  │                   │
     │                  │                   └─ Amazon Bedrock
     │                  │                      processes recording
     │                  │
     │                  └─ HTTP POST request
     │                     with recording data
     │
     └─ Raw recording data
        from user actions
```

### Phase 3: Storage

```
Generated Workflow → jsonsrc/ folder → Available for Execution
         │                  │                     │
         │                  │                     └─ Shows in
         │                  │                        dropdown list
         │                  │
         │                  └─ Stored as:
         │                     workflow_*.json
         │
         └─ Structured format:
            • Step-by-step actions
            • Selectors (coordinates/UI)
            • Wait times
            • Descriptions
```

### Phase 4: Execution

```
User Selects → executingoutput.py → System Automation
     │                  │                    │
     │                  │                    └─ Performs:
     │                  │                       • Clicks
     │                  │                       • Types
     │                  │                       • Scrolls
     │                  │                       • Waits
     │                  │
     │                  └─ Uses:
     │                     • pyautogui
     │                     • keyboard
     │                     • Coordinates
     │
     └─ workflow_*.json
        from jsonsrc/
```

---

## 🔄 Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ HomePage.tsx                                               │ │
│  │  • Start/Stop Recording button                            │ │
│  │  • Workflow dropdown                                      │ │
│  │  • Execute button                                         │ │
│  │  • Status indicators (Recording/Processing/Executing)     │ │
│  │  • Event logs (real-time)                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP API Calls
                            │ (fetch requests)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Flask Backend                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ server.py - REST API Endpoints                            │ │
│  │  • POST /start          → Start recording                 │ │
│  │  • POST /stop           → Stop recording                  │ │
│  │  • GET  /status         → Get recording status            │ │
│  │  • GET  /events         → Get recording events            │ │
│  │  • GET  /list-workflows → List available workflows        │ │
│  │  • POST /execute/start  → Start execution                 │ │
│  │  • POST /execute/stop   → Stop execution                  │ │
│  │  • GET  /execute/status → Get execution status            │ │
│  │  • GET  /execute/events → Get execution events            │ │
│  └────────────────────────────────────────────────────────────┘ │
└───┬───────────────────────┬────────────────────────┬────────────┘
    │                       │                        │
    │ Subprocess            │ HTTP POST              │ Subprocess
    │                       │                        │
    ▼                       ▼                        ▼
┌──────────┐      ┌────────────────┐      ┌─────────────────┐
│generate.py│      │nova_api_client │      │executingoutput.py│
│          │      │     .py        │      │                 │
│ Records  │      │                │      │   Executes      │
│ Actions  │      │ Sends to API   │      │   Workflow      │
└──────────┘      └────────────────┘      └─────────────────┘
     │                     │                        │
     │                     │                        │
     ▼                     ▼                        ▼
┌──────────┐      ┌────────────────┐      ┌─────────────────┐
│commands  │      │ Nova Pro API   │      │  pyautogui      │
│.json     │      │ localhost:8000 │      │  keyboard       │
└──────────┘      └────────────────┘      └─────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Generated     │
                  │  Workflow JSON │
                  │  → jsonsrc/    │
                  └────────────────┘
```

---

## 🗂️ File Structure & Purpose

```
shadow-assistant-console/
│
├── 📁 scripts/                    [Backend Python Scripts]
│   ├── server.py                  Main Flask API server
│   ├── generate.py                Records user actions
│   ├── nova_api_client.py         Communicates with Nova API
│   ├── executingoutput.py         Executes workflows
│   ├── config.py                  Configuration settings
│   └── test_nova_api.py           API connection test
│
├── 📁 src/                        [Frontend React App]
│   ├── pages/
│   │   └── HomePage.tsx           Main UI page
│   ├── components/
│   │   ├── common/                Reusable components
│   │   └── ui/                    shadcn-ui components
│   ├── hooks/
│   │   └── useBridge.ts           Frontend-backend bridge
│   └── types/
│       ├── bridge.ts              Type definitions
│       └── workflows.ts           Workflow types
│
├── 📁 jsonsrc/                    [Generated Workflows]
│   └── workflow_*.json            AI-generated workflows
│
├── 📄 requirements.txt            Python dependencies
├── 📄 package.json                Node.js dependencies
├── 📄 config.py                   System configuration
│
├── 📖 README.md                   Project overview
├── 📖 SETUP_GUIDE.md              Detailed setup instructions
├── 📖 QUICKSTART.md               Fast setup guide
└── 📖 ARCHITECTURE.md             This file
```

---

## 🔌 API Endpoints

### Recording Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/start` | Start recording user actions |
| POST | `/stop` | Stop recording and trigger Nova API |
| GET | `/status` | Get recording status & Nova processing |
| GET | `/events` | Get recording event log |

### Execution Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/list-workflows` | List available workflow files |
| POST | `/execute/start` | Start executing a workflow |
| POST | `/execute/stop` | Stop executing workflow |
| GET | `/execute/status` | Get execution status |
| GET | `/execute/events` | Get execution event log |

---

## 🎯 Key Integration Points

### 1. Recording → Nova API

**File**: `nova_api_client.py`

```python
# Reads: Desktop/WorkflowRecorder/workflow_*/commands.json
# Sends to: http://localhost:8000/generate/friend-format
# Saves to: jsonsrc/workflow_*.json
```

### 2. Frontend → Backend

**File**: `HomePage.tsx`

```typescript
// Polls every 1 second:
fetch('http://localhost:5000/status')
fetch('http://localhost:5000/events')
fetch('http://localhost:5000/execute/status')
```

### 3. Backend → Recording Script

**File**: `server.py`

```python
# Spawns subprocess:
subprocess.Popen(['python', '-u', 'generate.py'])
# Reads output in real-time
# Captures "Final Folder:" path
# Triggers Nova API processing
```

---

## 🚦 State Management

### Recording States

```
IDLE → RECORDING → PROCESSING_NOVA → READY
  │         │              │             │
  │         │              │             └─ Workflow ready
  │         │              │                for execution
  │         │              │
  │         │              └─ Sending to API
  │         │                 Generating workflow
  │         │
  │         └─ Capturing actions
  │            Press ESC to stop
  │
  └─ No active recording
```

### Execution States

```
IDLE → EXECUTING → COMPLETED
  │         │           │
  │         │           └─ Workflow finished
  │         │
  │         └─ Running automation
  │            Press ESC to stop
  │
  └─ No active execution
```

---

## 🔐 Configuration Flow

```
config.py
    │
    ├─► NOVA_API_BASE_URL ──────────► nova_api_client.py
    ├─► NOVA_API_ENDPOINT ──────────► nova_api_client.py
    ├─► JSONSRC_DIR ────────────────► server.py, nova_api_client.py
    ├─► WORKFLOW_RECORDER_DIR ──────► generate.py
    └─► AUTO_EXECUTE_AFTER_GEN ─────► server.py (auto_execute_workflow)
```

---

## 🎬 Complete Workflow Sequence

```
1. User clicks "Teach new workflow" button
   └─► POST /start

2. Flask server starts generate.py subprocess
   └─► Records to: Desktop/WorkflowRecorder/workflow_*/

3. User presses ESC to stop
   └─► generate.py saves commands.json

4. Flask server detects "Final Folder:" in output
   └─► Spawns process_with_nova_api() thread

5. nova_api_client.py sends commands.json to Nova API
   └─► POST http://localhost:8000/generate/friend-format

6. Nova Pro API processes and returns optimized workflow
   └─► Saved to: jsonsrc/workflow_*.json

7. Frontend polls /status and sees new workflow
   └─► Updates dropdown list

8. User selects workflow and clicks "Start Execute"
   └─► POST /execute/start

9. Flask server starts executingoutput.py with workflow JSON
   └─► Automation runs (clicks, types, etc.)

10. Workflow completes or user presses ESC
    └─► Execution stops
```

---

## 🧩 Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn-ui**: Component library

### Backend
- **Flask**: Web server
- **pynput**: Input recording
- **pyautogui**: Automation
- **pywinauto**: Windows UI inspection
- **keyboard**: Hotkey detection

### AI Integration
- **Amazon Bedrock**: Cloud AI service
- **Nova Pro**: LLM for workflow generation

---

## 🎯 Future Enhancement Points

- Add workflow editing UI
- Support for conditional logic
- Variable extraction from recordings
- Multi-screen support
- Cloud workflow storage
- Workflow sharing/templates
- Error recovery mechanisms
- Screenshot-based selectors

---

**This architecture enables end-to-end workflow automation powered by AI! 🚀**
