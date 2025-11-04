# CODEX-BOT Quick Start Guide

## Option 1: One-Line Setup (Recommended)

After cloning this repository to your Windows computer, open **PowerShell 7** in the CODEX-BOT directory and run:

```powershell
npm install; npm run build; $p=(Get-Location).Path; $c="$env:APPDATA\Claude\claude_desktop_config.json"; $d=Split-Path -Parent $c; if(-not(Test-Path $d)){New-Item -ItemType Directory -Path $d -Force|Out-Null}; $cfg=@{mcpServers=@{"codex-bot"=@{command="node";args=@("$p\build\index.js");env=@{PROJECT_ROOT="G:\JARVIS-X"}}}}; if(Test-Path $c){$old=Get-Content $c -Raw|ConvertFrom-Json;if(-not $old.mcpServers){$old|Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force};$old.mcpServers|Add-Member -MemberType NoteProperty -Name "codex-bot" -Value $cfg.mcpServers."codex-bot" -Force;$old|ConvertTo-Json -Depth 10|Set-Content $c -Encoding UTF8}else{$cfg|ConvertTo-Json -Depth 10|Set-Content $c -Encoding UTF8}; Write-Host "Setup complete! Restart Claude Desktop." -ForegroundColor Green
```

## Option 2: Run the Setup Script

```powershell
.\setup.ps1
```

## What This Does

1. Installs npm dependencies
2. Builds the TypeScript project
3. Automatically configures Claude Desktop to use this MCP server
4. Sets up access to your JARVIS-X project at `G:\JARVIS-X`

## After Setup

1. **Restart Claude Desktop**
2. The server will appear as "codex-bot" in your MCP servers
3. Try asking Claude: "List files in my JARVIS-X project"

## Prerequisites

- Node.js 18+ installed
- PowerShell 7
- Claude Desktop installed
- This repository cloned to your Windows computer

## Getting the Repository

```powershell
# Clone the repository
git clone <your-repo-url> CODEX-BOT
cd CODEX-BOT

# Then run the one-liner above
```

## Troubleshooting

If the one-liner doesn't work:
1. Make sure you're in the CODEX-BOT directory
2. Run `.\setup.ps1` instead
3. Check that Node.js is installed: `node --version`
