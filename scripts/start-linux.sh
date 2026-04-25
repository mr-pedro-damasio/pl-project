#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."
docker compose up --build -d
echo "Prelegal is running at http://localhost:8000"
