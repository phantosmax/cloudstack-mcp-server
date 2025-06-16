# CloudStack CLI

A command-line interface for interacting with CloudStack through the MCP server.

## Installation

After building the project, the CLI is available as `cloudstack-cli`:

```bash
npm run build
npm link  # Optional: to install globally
```

## Configuration

Set the required environment variables:

```bash
export CLOUDSTACK_API_URL="https://your-cloudstack-server/client/api"
export CLOUDSTACK_API_KEY="your-api-key"
export CLOUDSTACK_SECRET_KEY="your-secret-key"
export CLOUDSTACK_TIMEOUT="30000"  # Optional, default 30 seconds
```

Or create a `.env` file:

```
CLOUDSTACK_API_URL=https://your-cloudstack-server/client/api
CLOUDSTACK_API_KEY=your-api-key
CLOUDSTACK_SECRET_KEY=your-secret-key
CLOUDSTACK_TIMEOUT=30000
```

## Usage

```bash
cloudstack-cli [options] <command> [arguments]
```

### Global Options

- `--help` - Show help message
- `--version` - Show version information
- `--verbose` - Enable verbose logging
- `--format <format>` - Output format: `json`, `table`, `compact` (default: `table`)
- `--timeout <ms>` - Request timeout in milliseconds (default: 30000)
- `--config <file>` - Load additional environment variables from file

## Commands

### Virtual Machines

#### List Virtual Machines
```bash
# List all VMs
cloudstack-cli list-vms

# List running VMs
cloudstack-cli list-vms --state Running

# List VMs in a specific zone
cloudstack-cli list-vms --zone-id 1

# Search VMs by keyword
cloudstack-cli list-vms --keyword web-server
```

#### Get Virtual Machine Details
```bash
cloudstack-cli get-vm --id 12345-67890-abcdef
```

#### Start Virtual Machine
```bash
cloudstack-cli start-vm --id 12345-67890-abcdef
```

#### Stop Virtual Machine
```bash
# Graceful stop
cloudstack-cli stop-vm --id 12345-67890-abcdef

# Forced stop
cloudstack-cli stop-vm --id 12345-67890-abcdef --forced
```

#### Reboot Virtual Machine
```bash
cloudstack-cli reboot-vm --id 12345-67890-abcdef
```

#### Deploy New Virtual Machine
```bash
cloudstack-cli deploy-vm \
  --service-offering-id 1 \
  --template-id 2 \
  --zone-id 3 \
  --name my-new-vm \
  --display-name "My New VM"
```

#### Scale Virtual Machine
```bash
# Requires VM restart
cloudstack-cli scale-vm \
  --id 12345-67890-abcdef \
  --service-offering-id 5 \
  --confirm
```

#### Migrate Virtual Machine
```bash
# Migrate to any available host
cloudstack-cli migrate-vm \
  --vm-id 12345-67890-abcdef \
  --confirm

# Migrate to specific host
cloudstack-cli migrate-vm \
  --vm-id 12345-67890-abcdef \
  --host-id host-123 \
  --confirm
```

#### Reset VM Password
```bash
cloudstack-cli reset-password-vm \
  --id 12345-67890-abcdef \
  --confirm
```

#### Destroy Virtual Machine
```bash
# Destroy (can be recovered)
cloudstack-cli destroy-vm \
  --id 12345-67890-abcdef \
  --confirm

# Destroy and expunge (permanent)
cloudstack-cli destroy-vm \
  --id 12345-67890-abcdef \
  --expunge \
  --confirm
```

### Infrastructure

#### List Zones
```bash
# List all zones
cloudstack-cli list-zones

# List only available zones
cloudstack-cli list-zones --available
```

#### List Templates
```bash
# List featured templates
cloudstack-cli list-templates

# List all templates
cloudstack-cli list-templates --template-filter all

# List templates in specific zone
cloudstack-cli list-templates --zone-id 1
```

#### List Service Offerings
```bash
# List all service offerings
cloudstack-cli list-service-offerings

# Search by name
cloudstack-cli list-service-offerings --name "Small Instance"
```

#### List Hosts
```bash
# List all hosts
cloudstack-cli list-hosts

# List hosts in specific zone
cloudstack-cli list-hosts --zone-id 1

# List routing hosts only
cloudstack-cli list-hosts --type Routing
```

### Storage

#### List Volumes
```bash
# List all volumes
cloudstack-cli list-volumes

# List volumes for specific VM
cloudstack-cli list-volumes --vm-id 12345-67890-abcdef

# List data disk volumes only
cloudstack-cli list-volumes --type DATADISK
```

#### Create Volume
```bash
# Create with disk offering
cloudstack-cli create-volume \
  --name my-data-volume \
  --zone-id 1 \
  --disk-offering-id 3

# Create with custom size
cloudstack-cli create-volume \
  --name my-custom-volume \
  --zone-id 1 \
  --size 100
```

#### Attach Volume
```bash
cloudstack-cli attach-volume \
  --id vol-12345 \
  --vm-id 12345-67890-abcdef
```

#### Detach Volume
```bash
cloudstack-cli detach-volume \
  --id vol-12345 \
  --confirm
```

#### Resize Volume
```bash
cloudstack-cli resize-volume \
  --id vol-12345 \
  --size 200 \
  --confirm
```

### Networking

#### List Networks
```bash
# List all networks
cloudstack-cli list-networks

# List networks in specific zone
cloudstack-cli list-networks --zone-id 1
```

#### List Public IP Addresses
```bash
# List all public IPs
cloudstack-cli list-public-ips

# List IPs in specific zone
cloudstack-cli list-public-ips --zone-id 1

# List IPs for specific network
cloudstack-cli list-public-ips --network-id net-123
```

#### Associate IP Address
```bash
# Acquire new public IP
cloudstack-cli associate-ip --zone-id 1

# Acquire IP for specific network
cloudstack-cli associate-ip \
  --zone-id 1 \
  --network-id net-123
```

#### Create Firewall Rule
```bash
# Open HTTP port
cloudstack-cli create-firewall-rule \
  --ip-id ip-12345 \
  --protocol TCP \
  --start-port 80 \
  --end-port 80 \
  --cidr "0.0.0.0/0"

# Open HTTPS port
cloudstack-cli create-firewall-rule \
  --ip-id ip-12345 \
  --protocol TCP \
  --start-port 443 \
  --end-port 443 \
  --cidr "0.0.0.0/0"
```

### Monitoring

#### List Events
```bash
# List recent events
cloudstack-cli list-events

# List error events only
cloudstack-cli list-events --level ERROR

# List events from specific date
cloudstack-cli list-events --start-date 2024-01-01

# Limit number of events
cloudstack-cli list-events --page-size 50
```

#### List System Alerts
```bash
cloudstack-cli list-alerts
```

#### List System Capacity
```bash
# List all capacity information
cloudstack-cli list-capacity

# List capacity for specific zone
cloudstack-cli list-capacity --zone-id 1
```

#### Get VM Metrics
```bash
# Get metrics for specific VMs
cloudstack-cli vm-metrics --ids "vm1,vm2,vm3"
```

### Security

#### List SSH Key Pairs
```bash
# List all SSH keys
cloudstack-cli list-ssh-keys

# Search by name
cloudstack-cli list-ssh-keys --name my-key
```

#### Create SSH Key Pair
```bash
cloudstack-cli create-ssh-key --name my-new-key
```

#### List Security Groups
```bash
# List all security groups
cloudstack-cli list-security-groups

# Search by name
cloudstack-cli list-security-groups --name default
```

## Output Formats

### Table Format (Default)
Human-readable table format with formatted text output.

```bash
cloudstack-cli list-vms
```

### JSON Format
Raw JSON output for programmatic processing.

```bash
cloudstack-cli list-vms --format json
```

### Compact Format
Single-line JSON output.

```bash
cloudstack-cli list-vms --format compact
```

## Examples

### Complete VM Deployment Workflow

```bash
# 1. List available zones
cloudstack-cli list-zones

# 2. List available templates
cloudstack-cli list-templates --zone-id 1

# 3. List service offerings
cloudstack-cli list-service-offerings

# 4. Deploy new VM
cloudstack-cli deploy-vm \
  --service-offering-id 1 \
  --template-id 5 \
  --zone-id 1 \
  --name web-server-01 \
  --display-name "Web Server 01"

# 5. Wait for deployment and get VM details
cloudstack-cli get-vm --id <new-vm-id>

# 6. Start the VM if not already running
cloudstack-cli start-vm --id <new-vm-id>
```

### Monitoring and Troubleshooting

```bash
# Check system capacity
cloudstack-cli list-capacity --format table

# Review recent error events
cloudstack-cli list-events --level ERROR --page-size 20

# Check VM metrics
cloudstack-cli vm-metrics --ids "vm1,vm2,vm3" --format json

# List system alerts
cloudstack-cli list-alerts
```

### Network Configuration

```bash
# Get public IP
cloudstack-cli associate-ip --zone-id 1

# Create firewall rules
cloudstack-cli create-firewall-rule \
  --ip-id <ip-id> \
  --protocol TCP \
  --start-port 22 \
  --end-port 22 \
  --cidr "10.0.0.0/8"

cloudstack-cli create-firewall-rule \
  --ip-id <ip-id> \
  --protocol TCP \
  --start-port 80 \
  --end-port 80 \
  --cidr "0.0.0.0/0"
```

## Error Handling

The CLI provides detailed error messages and exit codes:

- Exit code 0: Success
- Exit code 1: Error (configuration, network, API, etc.)

Use `--verbose` flag to see detailed debugging information:

```bash
cloudstack-cli list-vms --verbose
```

## Development

To run the CLI in development mode:

```bash
# Run TypeScript directly
npm run dev:cli -- list-vms --help

# Build and run
npm run build
npm run cli -- list-vms --help
```