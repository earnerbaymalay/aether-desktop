#!/bin/bash
# 🌌 Aether Workstation Launcher

echo "🚀 Starting Aether Workstation..."

# 1. Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "[*] Installing Node.js dependencies..."
    npm install
fi

if [ ! -d "venv" ]; then
    echo "[*] Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

# 2. Ensure Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "[*] Starting Ollama..."
    ollama serve &
    sleep 5
fi

# 2.5 Ensure OpenClaw bridge is running
if ! pgrep -x "openclaw" > /dev/null; then
    echo "[*] Starting OpenClaw bridge..."
    if command -v openclaw &>/dev/null; then
        openclaw gateway --port 18789 --force &
        sleep 2
    else
        echo "[!] openclaw not found in PATH. Skipping bridge..."
    fi
fi

# 2.6 Start Aether Core API
echo "[*] Starting Aether Core API..."
python3 api_server.py &
API_PID=$!

# 3. Launch Tauri App with Wakelock
echo "[*] Launching UI (Caffeine/Caffeinate Active)..."
if command -v caffeinate &>/dev/null; then
    caffeinate -i npm run tauri:dev
else
    npm run tauri:dev
fi

# Cleanup
kill $API_PID
