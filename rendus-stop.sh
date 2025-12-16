#!/bin/bash

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Rendus AI...${NC}"

# Function to kill process and its children
kill_tree() {
  local pid=$1
  # Kill child processes first
  for child in $(pgrep -P $pid 2>/dev/null); do
    kill_tree $child
  done
  kill $pid 2>/dev/null
}

# Stop Next.js dev server
if [ -f .next_pid ]; then
  PID=$(cat .next_pid)
  if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping Next.js dev server (PID $PID)..."
    kill_tree $PID
    echo -e "${GREEN}Next.js stopped.${NC}"
  else
    echo "Next.js (PID $PID) was not running."
  fi
  rm -f .next_pid
else
  echo "No .next_pid file found."
fi

# Also kill any remaining Next.js processes on port 3000
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Cleaning up remaining processes on port 3000..."
  lsof -ti :3000 | xargs kill -9 2>/dev/null
fi

# Stop Inngest dev server
if [ -f .inngest_pid ]; then
  PID=$(cat .inngest_pid)
  if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping Inngest dev server (PID $PID)..."
    kill_tree $PID
    echo -e "${GREEN}Inngest stopped.${NC}"
  else
    echo "Inngest (PID $PID) was not running."
  fi
  rm -f .inngest_pid
else
  echo "No .inngest_pid file found."
fi

# Also kill any remaining Inngest processes on port 8288
if lsof -i :8288 > /dev/null 2>&1; then
  echo "Cleaning up remaining processes on port 8288..."
  lsof -ti :8288 | xargs kill -9 2>/dev/null
fi

# Kill any orphaned node processes related to rendus (be careful here)
# Only uncomment if you want aggressive cleanup:
# pkill -f "next dev" 2>/dev/null
# pkill -f "inngest" 2>/dev/null

echo ""
echo -e "${GREEN}✓ Rendus AI stopped${NC}"
