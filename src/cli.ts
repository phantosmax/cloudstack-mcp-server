#!/usr/bin/env node

// Add AbortController polyfill for older Node.js versions
if (!globalThis.AbortController) {
  try {
    const polyfill = await import('node-abort-controller');
    globalThis.AbortController = polyfill.AbortController as any;
    globalThis.AbortSignal = polyfill.AbortSignal as any;
  } catch (error) {
    console.error('Failed to load AbortController polyfill:', error);
  }
}

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

interface CliOptions {
  help?: boolean;
  version?: boolean;
  config?: string;
  verbose?: boolean;
  format?: 'json' | 'table' | 'compact';
  timeout?: number;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

class CloudStackCli {
  private verbose: boolean = false;
  private format: 'json' | 'table' | 'compact' = 'table';
  private timeout: number = 30000;
  private mcpServerPath: string;

  constructor() {
    // Default to the built server file
    this.mcpServerPath = resolve(__dirname, 'index.js');
  }

  private log(message: string): void {
    if (this.verbose) {
      console.error(`[DEBUG] ${message}`);
    }
  }

  private async callMcpServer(toolCall: ToolCall): Promise<any> {
    return new Promise((resolve, reject) => {
      this.log(`Starting MCP server: ${this.mcpServerPath}`);
      
      const serverProcess = spawn('node', [this.mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env
      });

      let responseData = '';
      let errorData = '';
      let requestId = 1;

      // Handle server output
      serverProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        this.log(`Server stdout: ${chunk}`);
        responseData += chunk;
      });

      serverProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        this.log(`Server stderr: ${chunk}`);
        errorData += chunk;
      });

      // Handle server exit
      serverProcess.on('close', (code) => {
        this.log(`Server process exited with code ${code}`);
        
        if (code !== 0) {
          reject(new Error(`MCP server failed with code ${code}: ${errorData}`));
          return;
        }

        try {
          // Parse the response lines
          const lines = responseData.trim().split('\n').filter(line => line.trim());
          this.log(`Received ${lines.length} response lines`);
          
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.id === requestId && response.result) {
                resolve(response.result);
                return;
              } else if (response.id === requestId && response.error) {
                reject(new Error(`MCP Error: ${response.error.message}`));
                return;
              }
            } catch (parseError) {
              this.log(`Failed to parse response line: ${line}`);
            }
          }
          
          reject(new Error('No valid response received from MCP server'));
        } catch (error) {
          reject(new Error(`Failed to parse server response: ${error}`));
        }
      });

      // Handle server startup timeout
      const startupTimeout = setTimeout(() => {
        serverProcess.kill();
        reject(new Error('MCP server startup timeout'));
      }, this.timeout);

      // Send initialization messages
      serverProcess.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: { listChanged: false },
            sampling: {}
          },
          clientInfo: {
            name: 'cloudstack-cli',
            version: '1.0.0'
          }
        }
      }) + '\n');

      // Send the actual tool call
      serverProcess.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'tools/call',
        params: toolCall
      }) + '\n');

      // Close stdin to signal end of input
      serverProcess.stdin.end();

      // Clear startup timeout since we've sent the request
      clearTimeout(startupTimeout);
    });
  }

  private parseArguments(args: string[]): { options: CliOptions; command: string; toolArgs: Record<string, any> } {
    const options: CliOptions = {};
    const toolArgs: Record<string, any> = {};
    let command = '';
    let i = 0;

    while (i < args.length) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        switch (key) {
          case 'help':
            options.help = true;
            break;
          case 'version':
            options.version = true;
            break;
          case 'verbose':
            options.verbose = true;
            this.verbose = true;
            break;
          case 'format':
            if (nextArg && ['json', 'table', 'compact'].includes(nextArg)) {
              options.format = nextArg as 'json' | 'table' | 'compact';
              this.format = options.format;
              i++;
            }
            break;
          case 'timeout':
            if (nextArg && !isNaN(parseInt(nextArg))) {
              options.timeout = parseInt(nextArg);
              this.timeout = options.timeout;
              i++;
            }
            break;
          case 'config':
            if (nextArg) {
              options.config = nextArg;
              i++;
            }
            break;
          default:
            // Tool-specific arguments
            if (nextArg && !nextArg.startsWith('--')) {
              toolArgs[key.replace(/-/g, '')] = nextArg;
              i++;
            } else {
              toolArgs[key.replace(/-/g, '')] = true;
            }
        }
      } else if (!command) {
        command = arg;
      } else {
        // Positional arguments
        const match = arg.match(/^(\w+)=(.+)$/);
        if (match) {
          toolArgs[match[1]] = match[2];
        }
      }
      i++;
    }

    return { options, command, toolArgs };
  }

  private formatOutput(data: any): void {
    switch (this.format) {
      case 'json':
        console.log(JSON.stringify(data, null, 2));
        break;
      case 'compact':
        console.log(JSON.stringify(data));
        break;
      case 'table':
      default:
        if (data.content && Array.isArray(data.content)) {
          data.content.forEach((item: any) => {
            if (item.type === 'text') {
              console.log(item.text);
            }
          });
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
    }
  }

  private showHelp(): void {
    const version = this.getVersion();
    console.log(`CloudStack MCP CLI v${version}

Usage: cloudstack-cli [options] <command> [arguments]

Options:
  --help              Show this help message
  --version           Show version information
  --verbose           Enable verbose logging
  --format <format>   Output format: json, table, compact (default: table)
  --timeout <ms>      Request timeout in milliseconds (default: 30000)
  --config <file>     Configuration file path

Commands:
  Virtual Machines:
    list-vms [--zone-id <id>] [--state <state>] [--keyword <keyword>]
    get-vm --id <vm-id>
    start-vm --id <vm-id>
    stop-vm --id <vm-id> [--forced]
    reboot-vm --id <vm-id>
    destroy-vm --id <vm-id> [--expunge] --confirm
    deploy-vm --service-offering-id <id> --template-id <id> --zone-id <id> [--name <name>]
    scale-vm --id <vm-id> --service-offering-id <id> --confirm
    migrate-vm --vm-id <vm-id> [--host-id <id>] --confirm
    reset-password-vm --id <vm-id> --confirm

  Infrastructure:
    list-zones [--available]
    list-templates [--template-filter <filter>] [--zone-id <id>]
    list-service-offerings [--name <name>] [--domain-id <id>]
    list-hosts [--zone-id <id>] [--type <type>] [--state <state>]

  Storage:
    list-volumes [--vm-id <id>] [--type <type>] [--zone-id <id>]
    create-volume --name <name> --zone-id <id> [--disk-offering-id <id>] [--size <gb>]
    attach-volume --id <volume-id> --vm-id <vm-id>
    detach-volume --id <volume-id> --confirm
    resize-volume --id <volume-id> --size <gb> --confirm

  Networking:
    list-networks [--zone-id <id>] [--type <type>]
    list-public-ips [--zone-id <id>] [--network-id <id>]
    associate-ip --zone-id <id> [--network-id <id>]
    create-firewall-rule --ip-id <id> --protocol <protocol> [--start-port <port>] [--cidr <cidr>]

  Monitoring:
    list-events [--type <type>] [--level <level>] [--start-date <date>] [--page-size <size>]
    list-alerts [--type <type>]
    list-capacity [--zone-id <id>] [--type <type>]
    vm-metrics [--ids <vm-ids>]

  Security:
    list-ssh-keys [--name <name>]
    create-ssh-key --name <name>
    list-security-groups [--name <name>]

Examples:
  cloudstack-cli list-vms --state Running
  cloudstack-cli get-vm --id 12345-67890
  cloudstack-cli deploy-vm --service-offering-id 1 --template-id 2 --zone-id 3 --name myvm
  cloudstack-cli list-zones --format json
  cloudstack-cli destroy-vm --id 12345 --confirm --verbose

Environment Variables:
  CLOUDSTACK_API_URL     CloudStack API endpoint URL
  CLOUDSTACK_API_KEY     API key for authentication
  CLOUDSTACK_SECRET_KEY  Secret key for authentication
  CLOUDSTACK_TIMEOUT     Request timeout in milliseconds (optional)
`);
  }

  private getVersion(): string {
    try {
      const packagePath = resolve(__dirname, '../package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  private mapCommandToTool(command: string): string {
    const commandMap: Record<string, string> = {
      'list-vms': 'list_virtual_machines',
      'get-vm': 'get_virtual_machine',
      'start-vm': 'start_virtual_machine',
      'stop-vm': 'stop_virtual_machine',
      'reboot-vm': 'reboot_virtual_machine',
      'destroy-vm': 'destroy_virtual_machine',
      'deploy-vm': 'deploy_virtual_machine',
      'scale-vm': 'scale_virtual_machine',
      'migrate-vm': 'migrate_virtual_machine',
      'reset-password-vm': 'reset_password_virtual_machine',
      'list-zones': 'list_zones',
      'list-templates': 'list_templates',
      'list-service-offerings': 'list_service_offerings',
      'list-hosts': 'list_hosts',
      'list-volumes': 'list_volumes',
      'create-volume': 'create_volume',
      'attach-volume': 'attach_volume',
      'detach-volume': 'detach_volume',
      'resize-volume': 'resize_volume',
      'list-networks': 'list_networks',
      'list-public-ips': 'list_public_ip_addresses',
      'associate-ip': 'associate_ip_address',
      'create-firewall-rule': 'create_firewall_rule',
      'list-events': 'list_events',
      'list-alerts': 'list_alerts',
      'list-capacity': 'list_capacity',
      'vm-metrics': 'list_virtual_machine_metrics',
      'list-ssh-keys': 'list_ssh_key_pairs',
      'create-ssh-key': 'create_ssh_key_pair',
      'list-security-groups': 'list_security_groups'
    };

    return commandMap[command] || command;
  }

  private validateEnvironment(): boolean {
    const required = ['CLOUDSTACK_API_URL', 'CLOUDSTACK_API_KEY', 'CLOUDSTACK_SECRET_KEY'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
      console.error('\nPlease set the following environment variables:');
      console.error('  CLOUDSTACK_API_URL=https://your-cloudstack-server/client/api');
      console.error('  CLOUDSTACK_API_KEY=your-api-key');
      console.error('  CLOUDSTACK_SECRET_KEY=your-secret-key');
      return false;
    }
    
    return true;
  }

  async run(args: string[]): Promise<void> {
    try {
      const { options, command, toolArgs } = this.parseArguments(args);

      if (options.version) {
        console.log(`CloudStack MCP CLI v${this.getVersion()}`);
        return;
      }

      if (options.help || !command) {
        this.showHelp();
        return;
      }

      if (!this.validateEnvironment()) {
        process.exit(1);
      }

      if (options.config) {
        // Load additional config from file if specified
        try {
          dotenv.config({ path: options.config });
        } catch (error) {
          console.error(`Error loading config file: ${error}`);
          process.exit(1);
        }
      }

      const toolName = this.mapCommandToTool(command);
      this.log(`Executing tool: ${toolName} with arguments: ${JSON.stringify(toolArgs)}`);

      const result = await this.callMcpServer({
        name: toolName,
        arguments: toolArgs
      });

      this.formatOutput(result);

    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CloudStackCli();
  cli.run(process.argv.slice(2));
}

export { CloudStackCli };