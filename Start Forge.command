#!/bin/bash
# Double-click on macOS (or run ./"Start Forge.command" on Linux) to start Forge.
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 serve.py --open
else echo "Python 3 was not found. Install it from python.org and try again."; read -r -p "Press Enter to close."; fi
