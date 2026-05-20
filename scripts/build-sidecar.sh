#!/bin/bash
# 🌌 Aether Sidecar Builder

set -e

TRIPLE=$(rustc -Vv | grep host: | cut -d ' ' -f 2)
BIN_NAME="aether-engine-$TRIPLE"
TARGET_DIR="src-tauri/bin"

echo "Building sidecar for $TRIPLE..."

# Ensure target directory exists
mkdir -p "$TARGET_DIR"

# Build using PyInstaller
# --onefile: single executable
# --distpath: where to put the output
# --name: the filename
python3 -m PyInstaller --onefile \
    --name "$BIN_NAME" \
    --distpath "$TARGET_DIR" \
    --clean \
    --hidden-import=fastapi \
    --hidden-import=uvicorn \
    --hidden-import=httpx \
    --hidden-import=psutil \
    --hidden-import=rich \
    agent/aether_agent.py

echo "✅ Sidecar built: $TARGET_DIR/$BIN_NAME"
