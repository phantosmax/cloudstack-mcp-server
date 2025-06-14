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
   CLOUDSTACK_API_URL=https://your-cloudstack-server/client/api
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
        "CLOUDSTACK_API_URL": "https://your-cloudstack-server/client/api",
        "CLOUDSTACK_API_KEY": "your-api-key",
        "CLOUDSTACK_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

## Available Tools (45 Tools)

### 🖥️ Virtual Machine Management (7 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_virtual_machines` | List VMs with optional filtering | `zoneid`, `state`, `keyword` |
| `get_virtual_machine` | Get detailed VM information | `id` (required) |
| `start_virtual_machine` | Start a stopped virtual machine | `id` (required) |
| `stop_virtual_machine` | Stop a running virtual machine | `id` (required), `forced` (optional) |
| `reboot_virtual_machine` | Reboot a virtual machine | `id` (required) |
| `destroy_virtual_machine` | Destroy a virtual machine | `id` (required), `confirm` (required), `expunge` (optional) |
| `deploy_virtual_machine` | Deploy a new virtual machine | `serviceofferingid`, `templateid`, `zoneid` (required), `name`, `displayname` (optional) |

### ⚙️ VM Advanced Operations (4 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `scale_virtual_machine` | Scale (resize) a virtual machine | `id`, `serviceofferingid`, `confirm` (required) |
| `migrate_virtual_machine` | Migrate VM to another host | `virtualmachineid`, `confirm` (required), `hostid` (optional) |
| `reset_password_virtual_machine` | Reset password for a virtual machine | `id`, `confirm` (required) |
| `change_service_offering_virtual_machine` | Change service offering for a VM | `id`, `serviceofferingid` (required) |

### 💾 Storage Management (7 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_volumes` | List storage volumes | `virtualmachineid`, `type`, `zoneid` |
| `create_volume` | Create a new storage volume | `name`, `zoneid` (required), `diskofferingid`, `size` |
| `attach_volume` | Attach a volume to a virtual machine | `id`, `virtualmachineid` (required) |
| `detach_volume` | Detach a volume from a virtual machine | `id`, `confirm` (required) |
| `resize_volume` | Resize a storage volume | `id`, `size`, `confirm` (required) |
| `create_snapshot` | Create a snapshot of a volume | `volumeid` (required), `name` |
| `list_snapshots` | List volume snapshots | `volumeid`, `snapshottype` |

### 🌐 Networking (7 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_networks` | List networks | `zoneid`, `type` |
| `create_network` | Create a new network | `name`, `networkofferingid`, `zoneid` (required), `displaytext` |
| `list_public_ip_addresses` | List public IP addresses | `zoneid`, `associatednetworkid` |
| `associate_ip_address` | Acquire a new public IP address | `zoneid` (required), `networkid` |
| `enable_static_nat` | Enable static NAT for an IP address | `ipaddressid`, `virtualmachineid` (required) |
| `create_firewall_rule` | Create a firewall rule | `ipaddressid`, `protocol` (required), `startport`, `endport`, `cidrlist` |
| `list_load_balancer_rules` | List load balancer rules | `publicipid`, `zoneid` |

### 📊 Monitoring & Analytics (5 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_virtual_machine_metrics` | Get virtual machine performance metrics | `ids` |
| `list_events` | List CloudStack events | `type`, `level`, `startdate`, `pagesize` |
| `list_alerts` | List system alerts | `type` |
| `list_capacity` | List system capacity information | `zoneid`, `type` |
| `list_async_jobs` | List asynchronous jobs | `jobstatus`, `jobresulttype` |

### 👥 Account & User Management (4 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_accounts` | List CloudStack accounts | `domainid`, `accounttype` |
| `list_users` | List users | `accountid`, `username` |
| `list_domains` | List CloudStack domains | `name` |
| `list_usage_records` | List resource usage records | `startdate`, `enddate` (required), `type` |

### 🏗️ Infrastructure Discovery (2 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_zones` | List all available zones | `available` (optional) |
| `list_templates` | List available VM templates | `templatefilter`, `zoneid` (optional) |

### 🔧 System Administration (5 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_hosts` | List physical hosts | `zoneid`, `type`, `state` |
| `list_clusters` | List host clusters | `zoneid` |
| `list_storage_pools` | List storage pools | `zoneid`, `clusterid` |
| `list_system_vms` | List system virtual machines | `zoneid`, `systemvmtype` |
| `list_service_offerings` | List service offerings | `name`, `domainid` |

### 🔐 Security & Compliance (4 Tools)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_ssh_key_pairs` | List SSH key pairs | `name` |
| `create_ssh_key_pair` | Create a new SSH key pair | `name` (required) |
| `list_security_groups` | List security groups | `securitygroupname` |
| `create_security_group_rule` | Create a security group ingress rule | `securitygroupid`, `protocol` (required), `startport`, `endport`, `cidrlist` |

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