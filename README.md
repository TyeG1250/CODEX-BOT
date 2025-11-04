# CODEX-BOT MCP Server

A Model Context Protocol (MCP) server that provides AI-powered code analysis and development tools for accessing your local projects.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows AI assistants like Claude to securely connect to external tools, APIs, and data sources. This server exposes your `JARVIS-X` project to Claude Desktop, enabling it to read files, search code, analyze your project, and execute commands.

## Features

This MCP server provides the following tools:

- **read_file** - Read contents of any file in your project
- **write_file** - Write or update files in your project
- **list_files** - List files and directories
- **search_code** - Search for patterns across your codebase using grep
- **execute_command** - Run shell commands in your project directory
- **analyze_project** - Get project statistics and structure overview

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Claude Desktop app (for integration)

## Installation

### 1. Clone and Setup

```bash
# Clone this repository (if not already cloned)
git clone <repository-url>
cd CODEX-BOT

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### 2. Configure Your Project Path

The server is pre-configured to access your project at `G:\JARVIS-X`.

If you need to change this, edit the `PROJECT_ROOT` environment variable in your configuration.

### 3. Configure Claude Desktop

You need to add this MCP server to Claude Desktop's configuration file.

#### Windows Configuration

1. Open Claude Desktop configuration file:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add the following configuration (update the path to where you cloned CODEX-BOT):

```json
{
  "mcpServers": {
    "codex-bot": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\path\\to\\CODEX-BOT\\build\\index.js"
      ],
      "env": {
        "PROJECT_ROOT": "G:\\JARVIS-X"
      }
    }
  }
}
```

#### macOS Configuration

1. Open Claude Desktop configuration file:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Add similar configuration with Unix-style paths:

```json
{
  "mcpServers": {
    "codex-bot": {
      "command": "node",
      "args": [
        "/Users/YourUsername/path/to/CODEX-BOT/build/index.js"
      ],
      "env": {
        "PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

#### Linux Configuration

1. Open Claude Desktop configuration file:
   ```
   ~/.config/Claude/claude_desktop_config.json
   ```

2. Use the macOS configuration format above with your Linux paths.

### 4. Restart Claude Desktop

After adding the configuration, restart Claude Desktop for the changes to take effect.

## Usage

Once configured, you can use these tools in Claude Desktop by asking questions like:

- "Read the main.py file from my project"
- "Search for all TODO comments in my codebase"
- "List all files in the src directory"
- "Analyze my project structure"
- "Execute npm test in my project"

Claude will automatically use the appropriate MCP tools to interact with your `JARVIS-X` project.

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Watch Mode (auto-rebuild on changes)

```bash
npm run watch
```

## Security Considerations

- The server includes path validation to prevent access outside your project root
- All file operations are restricted to the configured `PROJECT_ROOT` directory
- Command execution runs with the same permissions as the Node.js process
- Review any commands before execution in production environments

## Troubleshooting

### Server not appearing in Claude Desktop

1. Check that the path in `claude_desktop_config.json` is correct and uses proper escaping
2. Ensure the project is built (`npm run build`)
3. Check Claude Desktop logs for errors
4. Restart Claude Desktop after configuration changes

### Permission Errors

Ensure Node.js has read/write permissions for your project directory (`G:\JARVIS-X`).

### Path Issues on Windows

Use double backslashes (`\\`) in JSON configuration files for Windows paths, or use forward slashes (`/`).

## Configuration Reference

### Environment Variables

- `PROJECT_ROOT` - Root directory of your project (defaults to current working directory)

### Example Configuration File

See `claude-desktop-config.json` for a template configuration.

## Project Structure

```
CODEX-BOT/
├── src/
│   └── index.ts           # Main MCP server implementation
├── build/                 # Compiled JavaScript (generated)
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── claude-desktop-config.json  # Example Claude Desktop config
├── .env.example           # Environment variable template
└── README.md              # This file
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Links

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/download)
