#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

echo -e "${GREEN}==== Web FPGA Simulator Setup Script ====${NC}"

# Check if Node.js is installed
if ! command_exists node; then
  echo -e "${YELLOW}Node.js is not installed. Installing Node.js...${NC}"
  
  # Detect the operating system
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command_exists brew; then
      echo "Installing Node.js using Homebrew..."
      brew install node
    else
      echo -e "${RED}Homebrew is not installed. Please install Node.js manually from https://nodejs.org/${NC}"
      exit 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command_exists apt; then
      echo "Installing Node.js using apt..."
      sudo apt update
      sudo apt install -y nodejs npm
    elif command_exists dnf; then
      echo "Installing Node.js using dnf..."
      sudo dnf install -y nodejs
    elif command_exists yum; then
      echo "Installing Node.js using yum..."
      sudo yum install -y nodejs
    else
      echo -e "${RED}Could not determine package manager. Please install Node.js manually from https://nodejs.org/${NC}"
      exit 1
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo -e "${RED}Please install Node.js manually from https://nodejs.org/${NC}"
    echo "Alternatively, if you have winget, run: winget install OpenJS.NodeJS"
    exit 1
  else
    echo -e "${RED}Unsupported operating system. Please install Node.js manually from https://nodejs.org/${NC}"
    exit 1
  fi
else
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}Node.js is already installed (${NODE_VERSION})${NC}"
fi

# Navigate to project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/Code/Frontend"

# Check if the Frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}Frontend directory not found at $FRONTEND_DIR${NC}"
  exit 1
fi

# Navigate to the Frontend directory
echo -e "${GREEN}Navigating to Frontend directory...${NC}"
cd "$FRONTEND_DIR" || exit 1

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${GREEN}Building the project...${NC}"
npm run build

# Run the project in preview mode
echo -e "${GREEN}Starting preview server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
npm run preview
