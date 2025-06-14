# CloudStack MCP Server

A high-performance MCP (Model Context Protocol) server for Apache CloudStack API integration. This server provides comprehensive tools for managing CloudStack infrastructure through the MCP protocol, enabling seamless integration with AI assistants and automation tools.

## Features

- **🔧 Complete VM Lifecycle Management**: Deploy, start, stop, reboot, and destroy virtual machines
- **🏗️ Infrastructure Discovery**: List zones, templates, and service offerings
- **🔐 Secure Authentication**: HMAC-SHA1 signed requests with CloudStack API credentials
- **⚡ High Performance**: Efficient TypeScript implementation with proper error handling
- **🛡️ Type Safety**: Full TypeScript support with comprehensive interfaces
- **📊 Rich Information**: Detailed VM metadata including CPU, memory, network, and status

## Quick Start

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd cloudstack-mcp-server
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   CLOUDSTACK_API_URL=http://your-cloudstack-server:8080/client/api
   CLOUDSTACK_API_KEY=your-api-key
   CLOUDSTACK_SECRET_KEY=your-secret-key
   CLOUDSTACK_TIMEOUT=30000
   ```

3. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build && npm start
   ```

### MCP Client Integration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "cloudstack": {
      "command": "node",
      "args": ["/path/to/cloudstack-mcp-server/build/index.js"],
      "env": {
        "CLOUDSTACK_API_URL": "http://your-server:8080/client/api",
        "CLOUDSTACK_API_KEY": "your-api-key",
        "CLOUDSTACK_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

## Available Tools (9 Tools)

### 🖥️ Virtual Machine Management

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_virtual_machines` | List VMs with optional filtering | `zoneid`, `state`, `keyword` |
| `get_virtual_machine` | Get detailed VM information | `id` (required) |
| `start_virtual_machine` | Start a stopped virtual machine | `id` (required) |
| `stop_virtual_machine` | Stop a running virtual machine | `id` (required), `forced` (optional) |
| `reboot_virtual_machine` | Reboot a virtual machine | `id` (required) |
| `destroy_virtual_machine` | Destroy a virtual machine | `id` (required), `expunge` (optional) |
| `deploy_virtual_machine` | Deploy a new virtual machine | `serviceofferingid`, `templateid`, `zoneid` (required), `name`, `displayname` (optional) |

### 🏗️ Infrastructure Discovery

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_zones` | List all available zones | `available` (optional) |
| `list_templates` | List available VM templates | `templatefilter`, `zoneid` (optional) |

## Example Usage

### List Virtual Machines
```json
{
  "tool": "list_virtual_machines",
  "arguments": {
    "state": "Running",
    "zoneid": "1746ef10-8fa6-40c1-9c82-c3956bf75db8"
  }
}
```

### Deploy New Virtual Machine
```json
{
  "tool": "deploy_virtual_machine",
  "arguments": {
    "serviceofferingid": "c6f99499-7f59-4138-9427-a09db13af2bc",
    "templateid": "7d4a7bb5-2409-4c8f-8537-6bbdc8a4e5c1",
    "zoneid": "1746ef10-8fa6-40c1-9c82-c3956bf75db8",
    "name": "my-new-vm",
    "displayname": "My New VM"
  }
}
```

## Project Structure

```
├── src/
│   ├── index.ts              # Entry point with environment setup
│   ├── server.ts             # Main MCP server (468 lines)
│   └── cloudstack-client.ts  # CloudStack API client (145 lines)
├── build/                    # Compiled JavaScript output
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables (not in repo)
```

### Architecture Overview

- **`src/index.ts`**: Minimal entry point that loads environment variables and imports the server
- **`src/server.ts`**: Comprehensive MCP server implementation with 9 tool handlers, error management, and CloudStack integration
- **`src/cloudstack-client.ts`**: Robust CloudStack API client with HMAC-SHA1 authentication, type-safe interfaces, and comprehensive error handling

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDSTACK_API_URL` | CloudStack API endpoint | `http://cloudstack.example.com:8080/client/api` |
| `CLOUDSTACK_API_KEY` | CloudStack API key | `your-32-character-api-key` |
| `CLOUDSTACK_SECRET_KEY` | CloudStack secret key | `your-secret-key` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDSTACK_TIMEOUT` | Request timeout (milliseconds) | `30000` |

## Development

### Build Commands
```bash
# Build TypeScript to JavaScript
npm run build

# Run in development mode with hot reload
npm run dev

# Run compiled JavaScript
npm start

# Type checking only
npx tsc --noEmit
```

### Code Quality
- **TypeScript**: Full type safety with strict mode enabled
- **Error Handling**: Comprehensive error handling with MCP error types
- **Async/Await**: Modern async patterns throughout
- **Modular Design**: Clean separation of concerns

## Security

- **HMAC-SHA1 Signing**: All API requests are cryptographically signed
- **No Credential Storage**: Credentials read from environment variables only
- **Request Validation**: Input validation on all tool parameters
- **Error Sanitization**: Sensitive information filtered from error messages

## Compatibility

- **CloudStack**: Compatible with CloudStack 4.11+
- **Node.js**: Requires Node.js 18+
- **MCP Protocol**: Implements MCP SDK 0.5.0+
- **TypeScript**: Built with TypeScript 5.0+

## License

MIT - See LICENSE file for details