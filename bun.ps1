#!/usr/bin/env pwsh

# Bun wrapper script for Windows PowerShell
# This script provides a convenient way to run bun commands from the project root

$BUN_PATH = "$env:USERPROFILE\.bun\bin\bun.exe"

if (-not (Test-Path $BUN_PATH)) {
    Write-Host "❌ Bun not found at $BUN_PATH" -ForegroundColor Red
    Write-Host "Please install Bun first: https://bun.sh/" -ForegroundColor Yellow
    exit 1
}

# Run bun with all provided arguments
& $BUN_PATH @args
