# Kiro Settings

This directory contains Kiro-specific configuration files.

## MCP Configuration

The `mcp.json` file (if present) configures Model Context Protocol servers that extend Kiro's capabilities.

Example structure:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "uvx",
      "args": ["package-name@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Configuration Levels

- **User Level**: `~/.kiro/settings/mcp.json` (global)
- **Workspace Level**: `.kiro/settings/mcp.json` (project-specific)

Workspace settings override user settings.
