#!/bin/bash

PORT=3000
PID=$(lsof -ti :"$PORT" 2>/dev/null)

if [ -n "$PID" ]; then
  echo "Stopping prelegal frontend (PID $PID on port $PORT)..."
  kill -9 $PID
  echo "Done."
else
  echo "No process found on port $PORT."
fi
