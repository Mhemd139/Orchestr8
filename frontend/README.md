# Shadow Worker 🤖

> **Teach your PC once, let it work for you forever.**

An AI-powered workflow automation system that records your computer interactions, generates optimized workflows using Amazon Nova Pro, and executes them automatically.

---

## 🌟 Features

- **🎥 Smart Recording**: Captures mouse clicks, keyboard input, and UI element interactions
- **🧠 AI-Powered Generation**: Uses Amazon Nova Pro to create optimized workflow automation
- **⚡ Auto-Execution**: Workflows execute automatically or on-demand
- **🎯 Intelligent Selectors**: Records UI elements for reliable automation
- **📊 Real-time Monitoring**: Live event logs and status indicators
- **🔄 Complete Integration**: End-to-end system from recording to execution

---

## 🚀 Quick Start

### Prerequisites

- Windows OS (required)
- Node.js & npm
- Python 3.8+
- Amazon Nova Pro API running on `localhost:8000`

### Installation

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Node.js dependencies
npm install

# 3. Create workflow storage folder
mkdir jsonsrc
```

### Running the System

**You need 3 terminals running:**

```bash
# Terminal 1: Start your Nova Pro API
cd C:\Dev\bedrock-workflow-generator
python -m src.api.main

# Terminal 2: Start Shadow Worker backend
cd shadow-assistant-console
python scripts/server.py

# Terminal 3: Start Shadow Worker frontend
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## 📖 How It Works

1. **Record**: Click "Teach new workflow" and perform actions on your computer
2. **Generate**: Press ESC to stop - the recording is automatically sent to Nova Pro API
3. **Execute**: Select the generated workflow and click "Start Execute"

### Complete Workflow

```
Recording → commands.json → Nova Pro API → Optimized Workflow → Execution
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed documentation.

---

## 🧪 Test Your Setup

Before recording, verify your Nova Pro API connection:

```bash
python scripts/test_nova_api.py
```

This will test if your API is responding correctly.

---

## 🛠️ Configuration

Edit [scripts/config.py](scripts/config.py):

```python
# Nova Pro API settings
NOVA_API_BASE_URL = "http://localhost:8000"
NOVA_API_ENDPOINT = "/generate/friend-format"

# Auto-execution (set to True to auto-run after generation)
AUTO_EXECUTE_AFTER_GENERATION = False
EXECUTION_DELAY_SECONDS = 3
```

---

## 📁 Project Structure

```
shadow-assistant-console/
├── scripts/
│   ├── server.py              # Flask backend API
│   ├── generate.py            # Records user actions
│   ├── nova_api_client.py     # Nova Pro API integration
│   ├── executingoutput.py     # Executes workflows
│   ├── config.py              # Configuration settings
│   └── test_nova_api.py       # API connection test
├── src/
│   ├── pages/
│   │   └── HomePage.tsx       # Main UI
│   ├── components/            # React components
│   └── types/                 # TypeScript types
├── jsonsrc/                   # Generated workflows
├── requirements.txt           # Python dependencies
├── package.json              # Node.js dependencies
├── SETUP_GUIDE.md            # Detailed setup guide
└── README.md                 # This file
```

---

## 🔧 Technologies

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components

### Backend
- Flask (Python web server)
- pynput (input recording)
- pyautogui (automation)
- pywinauto (Windows UI automation)
- Amazon Nova Pro (AI workflow generation)

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[scripts/config.py](scripts/config.py)** - Configuration options
- **[requirements.txt](requirements.txt)** - Python dependencies

---

## 🐛 Troubleshooting

### "Cannot connect to backend server"
```bash
# Make sure Flask server is running
python scripts/server.py
```

### "Cannot connect to Nova Pro API"
```bash
# Test your API connection
python scripts/test_nova_api.py

# Check if your Nova Pro API is running
curl http://localhost:8000/generate/friend-format
```

### Recording not working
- Run terminal as Administrator (Windows UAC may block recording)
- Verify Python packages: `pip list`

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting.

---

## 🎯 Usage Examples

### Record a workflow
1. Click "Teach new workflow"
2. Perform your actions
3. Press ESC to stop
4. Wait for Nova Pro to generate the workflow

### Execute a workflow
1. Select workflow from dropdown
2. Click "Start Execute"
3. Watch it run automatically!

### Enable auto-execution
Edit [scripts/config.py](scripts/config.py):
```python
AUTO_EXECUTE_AFTER_GENERATION = True
```

---

## 🤝 Contributing

This project integrates with Amazon Nova Pro API for intelligent workflow generation. Make sure your API endpoint matches the configuration in [scripts/config.py](scripts/config.py).

---

## 📄 License

This project was built with Lovable.

Original Lovable Project: https://lovable.dev/projects/de0f591d-9373-497f-8dee-a4d8c5e9005b

---

## 🎉 Get Started Now!

```bash
# Quick start
pip install -r requirements.txt
npm install
python scripts/test_nova_api.py  # Test your API
python scripts/server.py          # Start backend
npm run dev                       # Start frontend
```

**Happy Automating! 🚀**
