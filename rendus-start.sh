#!/bin/bash

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Rendus AI...${NC}"

# Check if already running
if [ -f .next_pid ] && ps -p $(cat .next_pid) > /dev/null 2>&1; then
  echo -e "${YELLOW}Next.js is already running (PID $(cat .next_pid))${NC}"
else
  # Check if port 3000 is in use
  if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${RED}Port 3000 is already in use. Killing existing process...${NC}"
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 1
  fi

  echo "Starting Next.js dev server..."
  npm run dev -- -H 0.0.0.0 > next.log 2>&1 &
  NEXT_PID=$!
  echo $NEXT_PID > .next_pid
  echo -e "${GREEN}Next.js started (PID $NEXT_PID)${NC}"
fi

# Check if Inngest already running
if [ -f .inngest_pid ] && ps -p $(cat .inngest_pid) > /dev/null 2>&1; then
  echo -e "${YELLOW}Inngest is already running (PID $(cat .inngest_pid))${NC}"
else
  # Check if port 8288 is in use (Inngest default port)
  if lsof -i :8288 > /dev/null 2>&1; then
    echo -e "${RED}Port 8288 is already in use. Killing existing process...${NC}"
    lsof -ti :8288 | xargs kill -9 2>/dev/null
    sleep 1
  fi

  echo "Starting Inngest dev server..."
  # Use npm exec to ensure correct path resolution
  npm exec inngest-cli dev -- -u http://localhost:3000/api/inngest > inngest.log 2>&1 &
  INNGEST_PID=$!
  echo $INNGEST_PID > .inngest_pid
  
  # Wait a moment and verify it started
  sleep 2
  if ps -p $INNGEST_PID > /dev/null 2>&1; then
    echo -e "${GREEN}Inngest started (PID $INNGEST_PID)${NC}"
  else
    echo -e "${RED}Inngest failed to start! Check inngest.log${NC}"
    cat inngest.log
  fi
fi

echo ""
echo -e "${GREEN}✓ Rendus AI is running${NC}"
echo "  Next.js:  http://localhost:3000"
echo "  Inngest:  http://localhost:8288"
echo ""
echo "Logs: next.log, inngest.log"
echo "Stop with: ./rendus-stop.sh"
