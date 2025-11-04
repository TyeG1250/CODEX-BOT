#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";
import { exec as execCallback } from "child_process";

const exec = promisify(execCallback);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file from the project directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file from the project root",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file in the project directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file from the project root",
        },
        content: {
          type: "string",
          description: "Content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the directory (defaults to project root)",
        },
      },
    },
  },
  {
    name: "search_code",
    description: "Search for text/pattern in project files using grep",
    inputSchema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Text or regex pattern to search for",
        },
        path: {
          type: "string",
          description: "Directory to search in (defaults to project root)",
        },
        file_pattern: {
          type: "string",
          description: "File pattern to filter (e.g., '*.ts', '*.js')",
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "execute_command",
    description: "Execute a shell command in the project directory",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Shell command to execute",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "analyze_project",
    description: "Get overview of project structure and statistics",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Get project root from environment or use current directory
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

// Server implementation
class CodexBotServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "codex-bot-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: TOOLS };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "read_file":
            return await this.handleReadFile(args);
          case "write_file":
            return await this.handleWriteFile(args);
          case "list_files":
            return await this.handleListFiles(args);
          case "search_code":
            return await this.handleSearchCode(args);
          case "execute_command":
            return await this.handleExecuteCommand(args);
          case "analyze_project":
            return await this.handleAnalyzeProject();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async handleReadFile(args: any) {
    const filePath = path.resolve(PROJECT_ROOT, args.path);

    // Security check: ensure path is within project root
    if (!filePath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied: path is outside project root");
    }

    const content = await fs.readFile(filePath, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  }

  private async handleWriteFile(args: any) {
    const filePath = path.resolve(PROJECT_ROOT, args.path);

    // Security check
    if (!filePath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied: path is outside project root");
    }

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, args.content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Successfully wrote to ${args.path}`,
        },
      ],
    };
  }

  private async handleListFiles(args: any) {
    const dirPath = args.path
      ? path.resolve(PROJECT_ROOT, args.path)
      : PROJECT_ROOT;

    // Security check
    if (!dirPath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied: path is outside project root");
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(files, null, 2),
        },
      ],
    };
  }

  private async handleSearchCode(args: any) {
    const searchPath = args.path
      ? path.resolve(PROJECT_ROOT, args.path)
      : PROJECT_ROOT;

    // Security check
    if (!searchPath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied: path is outside project root");
    }

    let command = `grep -r -n "${args.pattern}" "${searchPath}"`;

    if (args.file_pattern) {
      command += ` --include="${args.file_pattern}"`;
    }

    try {
      const { stdout } = await exec(command);
      return {
        content: [
          {
            type: "text",
            text: stdout || "No matches found",
          },
        ],
      };
    } catch (error: any) {
      // grep returns exit code 1 when no matches found
      if (error.code === 1) {
        return {
          content: [
            {
              type: "text",
              text: "No matches found",
            },
          ],
        };
      }
      throw error;
    }
  }

  private async handleExecuteCommand(args: any) {
    const { stdout, stderr } = await exec(args.command, {
      cwd: PROJECT_ROOT,
    });

    return {
      content: [
        {
          type: "text",
          text: stdout + stderr,
        },
      ],
    };
  }

  private async handleAnalyzeProject() {
    try {
      // Count files by extension
      const { stdout } = await exec(
        `find "${PROJECT_ROOT}" -type f | sed 's/.*\\.//' | sort | uniq -c | sort -rn`,
        { cwd: PROJECT_ROOT }
      );

      // Get directory structure
      const { stdout: tree } = await exec(
        `find "${PROJECT_ROOT}" -type d | head -20`,
        { cwd: PROJECT_ROOT }
      );

      const analysis = `
Project Analysis
================

File Type Statistics:
${stdout}

Directory Structure (first 20 directories):
${tree}
`;

      return {
        content: [
          {
            type: "text",
            text: analysis,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Project analysis error: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("CODEX-BOT MCP Server running on stdio");
  }
}

// Start the server
const server = new CodexBotServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
