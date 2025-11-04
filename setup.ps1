# CODEX-BOT MCP Server - Automated Setup Script for PowerShell 7
# Run this script from the CODEX-BOT directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CODEX-BOT MCP Server Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory (where script is run from)
$CODEX_BOT_PATH = Get-Location
Write-Host "[1/5] CODEX-BOT Location: $CODEX_BOT_PATH" -ForegroundColor Green

# Install npm dependencies
Write-Host "`n[2/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed successfully!" -ForegroundColor Green

# Build the TypeScript project
Write-Host "`n[3/5] Building TypeScript project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Build completed successfully!" -ForegroundColor Green

# Prepare paths for Claude Desktop configuration
$BUILD_PATH = Join-Path $CODEX_BOT_PATH "build\index.js"
$PROJECT_ROOT = "G:\JARVIS-X"
$USERNAME = "TMG"
$CLAUDE_CONFIG_PATH = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host "`n[4/5] Configuring Claude Desktop..." -ForegroundColor Yellow
Write-Host "Username: $USERNAME" -ForegroundColor Cyan
Write-Host "Build path: $BUILD_PATH" -ForegroundColor Cyan
Write-Host "Project root: $PROJECT_ROOT" -ForegroundColor Cyan
Write-Host "Config file: $CLAUDE_CONFIG_PATH" -ForegroundColor Cyan

# Create Claude config directory if it doesn't exist
$CLAUDE_DIR = Split-Path -Parent $CLAUDE_CONFIG_PATH
if (-not (Test-Path $CLAUDE_DIR)) {
    Write-Host "Creating Claude config directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $CLAUDE_DIR -Force | Out-Null
}

# Escape backslashes for JSON
$BUILD_PATH_ESCAPED = $BUILD_PATH -replace '\\', '\\'
$PROJECT_ROOT_ESCAPED = $PROJECT_ROOT -replace '\\', '\\'

# Create the MCP server configuration
$mcpConfig = @{
    mcpServers = @{
        "codex-bot" = @{
            command = "node"
            args = @($BUILD_PATH_ESCAPED)
            env = @{
                PROJECT_ROOT = $PROJECT_ROOT_ESCAPED
            }
        }
    }
}

# Check if config file exists
if (Test-Path $CLAUDE_CONFIG_PATH) {
    Write-Host "Existing Claude config found. Backing up..." -ForegroundColor Yellow
    $BACKUP_PATH = "$CLAUDE_CONFIG_PATH.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $CLAUDE_CONFIG_PATH $BACKUP_PATH
    Write-Host "Backup created: $BACKUP_PATH" -ForegroundColor Green

    # Read existing config
    try {
        $existingConfig = Get-Content $CLAUDE_CONFIG_PATH -Raw | ConvertFrom-Json

        # Merge configs - add or update codex-bot entry
        if (-not $existingConfig.mcpServers) {
            $existingConfig | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
        }

        $existingConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "codex-bot" -Value $mcpConfig.mcpServers."codex-bot" -Force

        # Write merged config
        $existingConfig | ConvertTo-Json -Depth 10 | Set-Content $CLAUDE_CONFIG_PATH -Encoding UTF8
        Write-Host "Updated existing configuration with codex-bot server" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Could not parse existing config. Creating new one..." -ForegroundColor Yellow
        $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $CLAUDE_CONFIG_PATH -Encoding UTF8
    }
}
else {
    # Create new config file
    Write-Host "Creating new Claude Desktop configuration..." -ForegroundColor Yellow
    $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $CLAUDE_CONFIG_PATH -Encoding UTF8
    Write-Host "Configuration file created!" -ForegroundColor Green
}

# Verify the configuration
Write-Host "`n[5/5] Verifying configuration..." -ForegroundColor Yellow
if (Test-Path $CLAUDE_CONFIG_PATH) {
    Write-Host "Configuration file exists: ✓" -ForegroundColor Green

    # Display the configuration
    Write-Host "`nClaude Desktop Configuration:" -ForegroundColor Cyan
    Get-Content $CLAUDE_CONFIG_PATH | Write-Host -ForegroundColor Gray
}
else {
    Write-Host "Configuration file not found: ✗" -ForegroundColor Red
    exit 1
}

# Final instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Desktop application" -ForegroundColor White
Write-Host "2. The 'codex-bot' MCP server will be available" -ForegroundColor White
Write-Host "3. You can now ask Claude to interact with your project at: $PROJECT_ROOT" -ForegroundColor White
Write-Host ""
Write-Host "Example commands to try in Claude Desktop:" -ForegroundColor Yellow
Write-Host "  - 'Read the main file from my JARVIS-X project'" -ForegroundColor Gray
Write-Host "  - 'List all files in the src directory'" -ForegroundColor Gray
Write-Host "  - 'Search for TODO comments in my project'" -ForegroundColor Gray
Write-Host "  - 'Analyze my project structure'" -ForegroundColor Gray
Write-Host ""
Write-Host "Configuration saved to: $CLAUDE_CONFIG_PATH" -ForegroundColor Cyan
Write-Host ""
