# PowerShell setup script for Windows

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

Write-Host "==== Web FPGA Simulator Setup Script (Windows) ====" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Test-CommandExists "node")) {
    Write-Host "Node.js is not installed. Installing Node.js..." -ForegroundColor Yellow
    
    # Check if winget is available (Windows 10 & above)
    if (Test-CommandExists "winget") {
        Write-Host "Installing Node.js using winget..."
        winget install OpenJS.NodeJS
        
        # Refresh environment variables to make 'node' available in current session
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    # Check if chocolatey is available
    elseif (Test-CommandExists "choco") {
        Write-Host "Installing Node.js using Chocolatey..."
        choco install nodejs -y
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    else {
        Write-Host "No package manager found. Please install Node.js manually from https://nodejs.org/" -ForegroundColor Red
        Write-Host "After installing, restart this script." -ForegroundColor Red
        pause
        exit 1
    }
}
else {
    $nodeVersion = node -v
    Write-Host "Node.js is already installed ($nodeVersion)" -ForegroundColor Green
}

# Navigate to project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$frontendDir = Join-Path $projectRoot "Code\Frontend"

# Check if the Frontend directory exists
if (-not (Test-Path $frontendDir)) {
    Write-Host "Frontend directory not found at $frontendDir" -ForegroundColor Red
    pause
    exit 1
}

# Navigate to the Frontend directory
Write-Host "Navigating to Frontend directory..." -ForegroundColor Green
Set-Location $frontendDir

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Build the project
Write-Host "Building the project..." -ForegroundColor Green
npm run build

# Run the project in preview mode
Write-Host "Starting preview server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
npm run preview
