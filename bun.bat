@echo off
REM Bun wrapper script for Windows batch
REM This provides a convenient way to run bun commands

SET BUN_PATH=%USERPROFILE%\.bun\bin\bun.exe

IF NOT EXIST "%BUN_PATH%" (
    echo ❌ Bun not found at %BUN_PATH%
    echo Please install Bun first: https://bun.sh/
    exit /b 1
)

REM Run bun with all provided arguments
"%BUN_PATH%" %*
