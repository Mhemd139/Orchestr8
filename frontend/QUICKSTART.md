# Shadow Worker - Quick Start Guide 🚀

## ⚡ Ultra-Fast Setup (5 Minutes)

### Step 1: Install Dependencies (One-Time Setup)

```bash
# Install Python packages
pip install -r requirements.txt

# Install Node.js packages
npm install

# Create workflow storage
mkdir jsonsrc
```

---

## 🎮 Running Shadow Worker

### You Need 3 Things Running:

#### 1️⃣ Your Amazon Nova Pro API

```bash
cd C:\Dev\bedrock-workflow-generator
python -m src.api.main
```

Should start on: `http://localhost:8000` ✓

#### 2️⃣ Shadow Worker Backend

**Option A: Using batch file (easiest)**
```bash
# Double-click: START_BACKEND.bat
```

**Option B: Using command line**
```bash
python scripts/server.py
```

Should start on: `http://localhost:5000` ✓

#### 3️⃣ Shadow Worker Frontend

**Option A: Using batch file (easiest)**
```bash
# Double-click: START_FRONTEND.bat
```

**Option B: Using command line**
```bash
npm run dev
```

Should start on: `http://localhost:8080` ✓

---

## ✅ Test Your Setup

Before recording your first workflow:

```bash
python scripts/test_nova_api.py
```

This verifies your Nova Pro API is connected and working.

---

## 🎯 Record Your First Workflow

1. Open `http://localhost:8080` in your browser
2. Click **"Teach new workflow"**
3. Perform your actions (click, type, etc.)
4. Press **ESC** to stop recording
5. Watch the magic happen:
   - Recording is sent to Nova Pro API
   - Workflow is generated automatically
   - Shows up in the dropdown for execution

---

## 🏃 Execute a Workflow

1. Select a workflow from the dropdown
2. Click **"Start Execute"**
3. Sit back and watch it run!

---

## 🛑 Stop Anytime

- **During Recording**: Press **ESC**
- **During Execution**: Press **ESC** or click **"Force Stop Execute"**

---

## 🔧 Configuration (Optional)

Edit `scripts/config.py` to customize:

```python
# Auto-execute workflows after generation
AUTO_EXECUTE_AFTER_GENERATION = True  # Set to True

# Delay before auto-execution
EXECUTION_DELAY_SECONDS = 3  # Wait 3 seconds
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Cannot connect to backend server"** | Make sure `python scripts/server.py` is running |
| **"Cannot connect to Nova Pro API"** | Run `python scripts/test_nova_api.py` to test |
| **"No workflows available"** | Record a workflow first! |
| **Recording not working** | Run terminal as Administrator |

---

## 📖 Need More Help?

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed documentation
- **[README.md](README.md)** - Full project overview
- **[scripts/config.py](scripts/config.py)** - All configuration options

---

## 🎉 That's It!

You're ready to automate! The complete flow:

```
Click "Teach" → Do Actions → Press ESC → AI Generates → Execute → Repeat ♾️
```

**Happy Automating! 🤖**
