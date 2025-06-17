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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { CloudStackClient } from './cloudstack-client.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

interface CloudStackConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  timeout?: number;
}

class CloudStackMcpServer {
  private server: Server;
  private cloudStackClient: CloudStackClient;

  constructor() {
    this.server = new Server(
      {
        name: 'cloudstack-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.cloudStackClient = new CloudStackClient(this.getConfig());
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private getConfig(): CloudStackConfig {
    const config: CloudStackConfig = {
      apiUrl: process.env.CLOUDSTACK_API_URL || '',
      apiKey: process.env.CLOUDSTACK_API_KEY || '',
      secretKey: process.env.CLOUDSTACK_SECRET_KEY || '',
      timeout: parseInt(process.env.CLOUDSTACK_TIMEOUT || '30000'),
    };

    if (!config.apiUrl || !config.apiKey || !config.secretKey) {
      throw new Error('Missing required CloudStack configuration. Please set CLOUDSTACK_API_URL, CLOUDSTACK_API_KEY, and CLOUDSTACK_SECRET_KEY environment variables.');
    }

    return config;
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_virtual_machines',
            description: 'List virtual machines in CloudStack',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter VMs',
                },
                state: {
                  type: 'string',
                  description: 'VM state (Running, Stopped, etc.)',
                },
                keyword: {
                  type: 'string',
                  description: 'Keyword to search VMs',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_virtual_machine',
            description: 'Get details of a specific virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'start_virtual_machine',
            description: 'Start a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID to start',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'stop_virtual_machine',
            description: 'Stop a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID to stop',
                },
                forced: {
                  type: 'boolean',
                  description: 'Force stop the VM',
                  default: false,
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'reboot_virtual_machine',
            description: 'Reboot a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID to reboot',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'destroy_virtual_machine',
            description: 'Destroy a virtual machine using proper workflow: stop → destroy → expunge. Handles VMs in any state including Error. (DESTRUCTIVE - cannot be undone)',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID to destroy',
                },
                expunge: {
                  type: 'boolean',
                  description: 'Expunge the VM immediately (PERMANENT deletion)',
                  default: false,
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this DESTRUCTIVE action - VM will be permanently deleted (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['id', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_zones',
            description: 'List all zones in CloudStack',
            inputSchema: {
              type: 'object',
              properties: {
                available: {
                  type: 'boolean',
                  description: 'Show only available zones',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_templates',
            description: 'List available templates',
            inputSchema: {
              type: 'object',
              properties: {
                templatefilter: {
                  type: 'string',
                  description: 'Template filter (featured, self, selfexecutable, etc.)',
                  default: 'featured',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter templates',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'deploy_virtual_machine',
            description: 'Deploy a new virtual machine. Auto-selects network for Advanced zones if not specified. Use list_zones, list_templates, and list_service_offerings to get required IDs.',
            inputSchema: {
              type: 'object',
              properties: {
                serviceofferingid: {
                  type: 'string',
                  description: 'Service offering ID',
                },
                templateid: {
                  type: 'string',
                  description: 'Template ID',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID',
                },
                name: {
                  type: 'string',
                  description: 'VM name',
                },
                displayname: {
                  type: 'string',
                  description: 'VM display name',
                },
              },
              required: ['serviceofferingid', 'templateid', 'zoneid'],
              additionalProperties: false,
            },
          },
          // VM Advanced Operations
          {
            name: 'scale_virtual_machine',
            description: 'Scale (resize) a virtual machine (requires VM restart)',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID',
                },
                serviceofferingid: {
                  type: 'string',
                  description: 'New service offering ID',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this disruptive action - VM will be restarted (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['id', 'serviceofferingid', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'migrate_virtual_machine',
            description: 'Migrate a virtual machine to another host (may cause brief downtime)',
            inputSchema: {
              type: 'object',
              properties: {
                virtualmachineid: {
                  type: 'string',
                  description: 'VM ID',
                },
                hostid: {
                  type: 'string',
                  description: 'Target host ID (optional)',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this disruptive action - VM may experience downtime (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['virtualmachineid', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'reset_password_virtual_machine',
            description: 'Reset password for a virtual machine (changes VM credentials)',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this security-sensitive action - VM password will be changed (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['id', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'change_service_offering_virtual_machine',
            description: 'Change service offering for a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'VM ID',
                },
                serviceofferingid: {
                  type: 'string',
                  description: 'New service offering ID',
                },
              },
              required: ['id', 'serviceofferingid'],
              additionalProperties: false,
            },
          },
          // Storage Management
          {
            name: 'list_volumes',
            description: 'List storage volumes',
            inputSchema: {
              type: 'object',
              properties: {
                virtualmachineid: {
                  type: 'string',
                  description: 'VM ID to filter volumes',
                },
                type: {
                  type: 'string',
                  description: 'Volume type (ROOT, DATADISK)',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter volumes',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_volume',
            description: 'Create a new storage volume',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Volume name',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID',
                },
                diskofferingid: {
                  type: 'string',
                  description: 'Disk offering ID',
                },
                size: {
                  type: 'number',
                  description: 'Size in GB (for custom disk offerings)',
                },
              },
              required: ['name', 'zoneid'],
              additionalProperties: false,
            },
          },
          {
            name: 'attach_volume',
            description: 'Attach a volume to a virtual machine',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Volume ID',
                },
                virtualmachineid: {
                  type: 'string',
                  description: 'VM ID',
                },
              },
              required: ['id', 'virtualmachineid'],
              additionalProperties: false,
            },
          },
          {
            name: 'detach_volume',
            description: 'Detach a volume from a virtual machine (may cause data loss if not safely unmounted)',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Volume ID',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this potentially dangerous action - ensure volume is safely unmounted first (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['id', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'resize_volume',
            description: 'Resize a storage volume (may require filesystem expansion)',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Volume ID',
                },
                size: {
                  type: 'number',
                  description: 'New size in GB',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Confirm this storage modification - may require manual filesystem expansion (REQUIRED for safety)',
                  default: false,
                },
              },
              required: ['id', 'size', 'confirm'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_snapshot',
            description: 'Create a snapshot of a volume',
            inputSchema: {
              type: 'object',
              properties: {
                volumeid: {
                  type: 'string',
                  description: 'Volume ID',
                },
                name: {
                  type: 'string',
                  description: 'Snapshot name',
                },
              },
              required: ['volumeid'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_snapshots',
            description: 'List volume snapshots',
            inputSchema: {
              type: 'object',
              properties: {
                volumeid: {
                  type: 'string',
                  description: 'Volume ID to filter snapshots',
                },
                snapshottype: {
                  type: 'string',
                  description: 'Snapshot type (MANUAL, RECURRING)',
                },
              },
              additionalProperties: false,
            },
          },
          // Networking
          {
            name: 'list_networks',
            description: 'List networks',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter networks',
                },
                type: {
                  type: 'string',
                  description: 'Network type',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_network',
            description: 'Create a new network',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Network name',
                },
                displaytext: {
                  type: 'string',
                  description: 'Network description',
                },
                networkofferingid: {
                  type: 'string',
                  description: 'Network offering ID',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID',
                },
              },
              required: ['name', 'networkofferingid', 'zoneid'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_public_ip_addresses',
            description: 'List public IP addresses',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter IPs',
                },
                associatednetworkid: {
                  type: 'string',
                  description: 'Network ID to filter IPs',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'associate_ip_address',
            description: 'Acquire a new public IP address',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID',
                },
                networkid: {
                  type: 'string',
                  description: 'Network ID (optional)',
                },
              },
              required: ['zoneid'],
              additionalProperties: false,
            },
          },
          {
            name: 'enable_static_nat',
            description: 'Enable static NAT for an IP address',
            inputSchema: {
              type: 'object',
              properties: {
                ipaddressid: {
                  type: 'string',
                  description: 'Public IP ID',
                },
                virtualmachineid: {
                  type: 'string',
                  description: 'VM ID',
                },
              },
              required: ['ipaddressid', 'virtualmachineid'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_firewall_rule',
            description: 'Create a firewall rule',
            inputSchema: {
              type: 'object',
              properties: {
                ipaddressid: {
                  type: 'string',
                  description: 'Public IP ID',
                },
                protocol: {
                  type: 'string',
                  description: 'Protocol (TCP, UDP, ICMP)',
                },
                startport: {
                  type: 'number',
                  description: 'Start port',
                },
                endport: {
                  type: 'number',
                  description: 'End port',
                },
                cidrlist: {
                  type: 'string',
                  description: 'CIDR list (comma separated)',
                },
              },
              required: ['ipaddressid', 'protocol'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_load_balancer_rules',
            description: 'List load balancer rules',
            inputSchema: {
              type: 'object',
              properties: {
                publicipid: {
                  type: 'string',
                  description: 'Public IP ID to filter rules',
                },
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter rules',
                },
              },
              additionalProperties: false,
            },
          },
          // Monitoring & Analytics
          {
            name: 'list_virtual_machine_metrics',
            description: 'Get virtual machine performance metrics',
            inputSchema: {
              type: 'object',
              properties: {
                ids: {
                  type: 'string',
                  description: 'Comma separated list of VM IDs',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_events',
            description: 'List CloudStack events',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Event type',
                },
                level: {
                  type: 'string',
                  description: 'Event level (INFO, WARN, ERROR)',
                },
                startdate: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)',
                },
                pagesize: {
                  type: 'number',
                  description: 'Number of events to return',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_alerts',
            description: 'List system alerts',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Alert type',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_capacity',
            description: 'List system capacity information',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter capacity',
                },
                type: {
                  type: 'string',
                  description: 'Capacity type',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_async_jobs',
            description: 'List asynchronous jobs',
            inputSchema: {
              type: 'object',
              properties: {
                jobstatus: {
                  type: 'number',
                  description: 'Job status (0=pending, 1=success, 2=error)',
                },
                jobresulttype: {
                  type: 'string',
                  description: 'Job result type',
                },
              },
              additionalProperties: false,
            },
          },
          // Account & User Management
          {
            name: 'list_accounts',
            description: 'List CloudStack accounts',
            inputSchema: {
              type: 'object',
              properties: {
                domainid: {
                  type: 'string',
                  description: 'Domain ID to filter accounts',
                },
                accounttype: {
                  type: 'number',
                  description: 'Account type',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_users',
            description: 'List users',
            inputSchema: {
              type: 'object',
              properties: {
                accountid: {
                  type: 'string',
                  description: 'Account ID to filter users',
                },
                username: {
                  type: 'string',
                  description: 'Username to search',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_domains',
            description: 'List CloudStack domains',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Domain name to search',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_usage_records',
            description: 'List resource usage records',
            inputSchema: {
              type: 'object',
              properties: {
                startdate: {
                  type: 'string',
                  description: 'Start date (YYYY-MM-DD)',
                },
                enddate: {
                  type: 'string',
                  description: 'End date (YYYY-MM-DD)',
                },
                type: {
                  type: 'string',
                  description: 'Usage type',
                },
              },
              required: ['startdate', 'enddate'],
              additionalProperties: false,
            },
          },
          // System Administration
          {
            name: 'list_hosts',
            description: 'List physical hosts',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter hosts',
                },
                type: {
                  type: 'string',
                  description: 'Host type (Routing, Storage, etc.)',
                },
                state: {
                  type: 'string',
                  description: 'Host state',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_clusters',
            description: 'List host clusters',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter clusters',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_storage_pools',
            description: 'List storage pools',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter storage pools',
                },
                clusterid: {
                  type: 'string',
                  description: 'Cluster ID to filter storage pools',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_system_vms',
            description: 'List system virtual machines',
            inputSchema: {
              type: 'object',
              properties: {
                zoneid: {
                  type: 'string',
                  description: 'Zone ID to filter system VMs',
                },
                systemvmtype: {
                  type: 'string',
                  description: 'System VM type (domainrouter, consoleproxy, secondarystoragevm)',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'list_service_offerings',
            description: 'List service offerings',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Service offering name',
                },
                domainid: {
                  type: 'string',
                  description: 'Domain ID',
                },
              },
              additionalProperties: false,
            },
          },
          // Security & Compliance
          {
            name: 'list_ssh_key_pairs',
            description: 'List SSH key pairs',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Key pair name',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_ssh_key_pair',
            description: 'Create a new SSH key pair',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Key pair name',
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_security_groups',
            description: 'List security groups',
            inputSchema: {
              type: 'object',
              properties: {
                securitygroupname: {
                  type: 'string',
                  description: 'Security group name',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_security_group_rule',
            description: 'Create a security group ingress rule',
            inputSchema: {
              type: 'object',
              properties: {
                securitygroupid: {
                  type: 'string',
                  description: 'Security group ID',
                },
                protocol: {
                  type: 'string',
                  description: 'Protocol (TCP, UDP, ICMP)',
                },
                startport: {
                  type: 'number',
                  description: 'Start port',
                },
                endport: {
                  type: 'number',
                  description: 'End port',
                },
                cidrlist: {
                  type: 'string',
                  description: 'CIDR list',
                },
              },
              required: ['securitygroupid', 'protocol'],
              additionalProperties: false,
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'list_virtual_machines':
            return await this.handleListVirtualMachines(args);
          case 'get_virtual_machine':
            return await this.handleGetVirtualMachine(args);
          case 'start_virtual_machine':
            return await this.handleStartVirtualMachine(args);
          case 'stop_virtual_machine':
            return await this.handleStopVirtualMachine(args);
          case 'reboot_virtual_machine':
            return await this.handleRebootVirtualMachine(args);
          case 'destroy_virtual_machine':
            return await this.handleDestroyVirtualMachine(args);
          case 'list_zones':
            return await this.handleListZones(args);
          case 'list_templates':
            return await this.handleListTemplates(args);
          case 'deploy_virtual_machine':
            return await this.handleDeployVirtualMachine(args);
          // VM Advanced Operations
          case 'scale_virtual_machine':
            return await this.handleScaleVirtualMachine(args);
          case 'migrate_virtual_machine':
            return await this.handleMigrateVirtualMachine(args);
          case 'reset_password_virtual_machine':
            return await this.handleResetPasswordVirtualMachine(args);
          case 'change_service_offering_virtual_machine':
            return await this.handleChangeServiceOfferingVirtualMachine(args);
          // Storage Management
          case 'list_volumes':
            return await this.handleListVolumes(args);
          case 'create_volume':
            return await this.handleCreateVolume(args);
          case 'attach_volume':
            return await this.handleAttachVolume(args);
          case 'detach_volume':
            return await this.handleDetachVolume(args);
          case 'resize_volume':
            return await this.handleResizeVolume(args);
          case 'create_snapshot':
            return await this.handleCreateSnapshot(args);
          case 'list_snapshots':
            return await this.handleListSnapshots(args);
          // Networking
          case 'list_networks':
            return await this.handleListNetworks(args);
          case 'create_network':
            return await this.handleCreateNetwork(args);
          case 'list_public_ip_addresses':
            return await this.handleListPublicIpAddresses(args);
          case 'associate_ip_address':
            return await this.handleAssociateIpAddress(args);
          case 'enable_static_nat':
            return await this.handleEnableStaticNat(args);
          case 'create_firewall_rule':
            return await this.handleCreateFirewallRule(args);
          case 'list_load_balancer_rules':
            return await this.handleListLoadBalancerRules(args);
          // Monitoring & Analytics
          case 'list_virtual_machine_metrics':
            return await this.handleListVirtualMachineMetrics(args);
          case 'list_events':
            return await this.handleListEvents(args);
          case 'list_alerts':
            return await this.handleListAlerts(args);
          case 'list_capacity':
            return await this.handleListCapacity(args);
          case 'list_async_jobs':
            return await this.handleListAsyncJobs(args);
          // Account & User Management
          case 'list_accounts':
            return await this.handleListAccounts(args);
          case 'list_users':
            return await this.handleListUsers(args);
          case 'list_domains':
            return await this.handleListDomains(args);
          case 'list_usage_records':
            return await this.handleListUsageRecords(args);
          // System Administration
          case 'list_hosts':
            return await this.handleListHosts(args);
          case 'list_clusters':
            return await this.handleListClusters(args);
          case 'list_storage_pools':
            return await this.handleListStoragePools(args);
          case 'list_system_vms':
            return await this.handleListSystemVms(args);
          case 'list_service_offerings':
            return await this.handleListServiceOfferings(args);
          // Security & Compliance
          case 'list_ssh_key_pairs':
            return await this.handleListSSHKeyPairs(args);
          case 'create_ssh_key_pair':
            return await this.handleCreateSSHKeyPair(args);
          case 'list_security_groups':
            return await this.handleListSecurityGroups(args);
          case 'create_security_group_rule':
            return await this.handleCreateSecurityGroupRule(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${request.params.name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleListVirtualMachines(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines(args);
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
    
    const vmList = vms.map((vm: Record<string, any>) => ({
      id: vm.id,
      name: vm.name,
      displayname: vm.displayname,
      state: vm.state,
      zonename: vm.zonename,
      templatename: vm.templatename,
      serviceofferingname: vm.serviceofferingname,
      cpunumber: vm.cpunumber,
      memory: vm.memory,
      created: vm.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${vmList.length} virtual machines:\n\n${vmList
            .map(
              (vm: Record<string, any>) =>
                `• ${vm.name} (${vm.id})\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n  Template: ${vm.templatename}\n  CPU: ${vm.cpunumber}, Memory: ${vm.memory}MB\n  Created: ${vm.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleGetVirtualMachine(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines({ id: args.id });
    const vm = result.listvirtualmachinesresponse?.virtualmachine?.[0];
    
    if (!vm) {
      throw new McpError(ErrorCode.InvalidRequest, `Virtual machine with ID ${args.id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Virtual Machine Details:
Name: ${vm.name}
Display Name: ${vm.displayname}
ID: ${vm.id}
State: ${vm.state}
Zone: ${vm.zonename}
Template: ${vm.templatename}
Service Offering: ${vm.serviceofferingname}
CPU: ${vm.cpunumber}
Memory: ${vm.memory}MB
Created: ${vm.created}
${vm.nic ? `\nNetwork:\n${vm.nic.map((n: any) => `  IP: ${n.ipaddress}, Network: ${n.networkname}`).join('\n')}` : ''}`,
        },
      ],
    };
  }

  private async handleStartVirtualMachine(args: any) {
    const result = await this.cloudStackClient.startVirtualMachine({ id: args.id });
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} start initiated. Job ID: ${result.startvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleStopVirtualMachine(args: any) {
    const result = await this.cloudStackClient.stopVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} stop initiated${args.forced ? ' (forced)' : ''}. Job ID: ${result.stopvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleRebootVirtualMachine(args: any) {
    const result = await this.cloudStackClient.rebootVirtualMachine({ id: args.id });
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} reboot initiated. Job ID: ${result.rebootvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleDestroyVirtualMachine(args: any) {
    if (!args.confirm) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'DESTRUCTIVE ACTION BLOCKED: This will permanently delete the virtual machine. Please set confirm=true to proceed. THIS CANNOT BE UNDONE.'
      );
    }
    
    try {
      // Get VM current state
      const vms = await this.cloudStackClient.listVirtualMachines({ id: args.id });
      const vm = vms.listvirtualmachinesresponse?.virtualmachine?.[0];
      
      if (!vm) {
        throw new McpError(ErrorCode.InvalidRequest, `Virtual machine ${args.id} not found`);
      }
      
      let jobIds = [];
      
      // Step 1: Stop VM if running or in error state
      if (vm.state === 'Running' || vm.state === 'Error') {
        console.log(`VM ${vm.name} is in ${vm.state} state, stopping first...`);
        try {
          const stopResult = await this.cloudStackClient.stopVirtualMachine({ 
            id: args.id,
            forced: vm.state === 'Error' // Force stop for VMs in error state
          });
          jobIds.push(stopResult.stopvirtualmachineresponse?.jobid);
          
          // Wait a bit for stop operation
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (stopError: any) {
          console.log(`Stop failed (may be expected): ${stopError.message}`);
        }
      }
      
      // Step 2: Destroy without expunge first
      console.log(`Destroying VM ${vm.name}...`);
      const destroyResult = await this.cloudStackClient.destroyVirtualMachine({ 
        id: args.id,
        expunge: false 
      });
      jobIds.push(destroyResult.destroyvirtualmachineresponse?.jobid);
      
      // Wait for destroy to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Try to expunge
      if (args.expunge !== false) { // Default to expunge unless explicitly set to false
        console.log(`Expunging VM ${vm.name}...`);
        try {
          // Try direct expunge command
          const expungeResult = await this.cloudStackClient.request('expungeVirtualMachine', {
            id: args.id
          });
          if (expungeResult.expungevirtualmachineresponse?.jobid) {
            jobIds.push(expungeResult.expungevirtualmachineresponse.jobid);
          }
        } catch (expungeError: any) {
          // If expunge fails, try destroy with expunge flag
          console.log('Direct expunge failed, trying destroy with expunge flag...');
          try {
            const destroyExpungeResult = await this.cloudStackClient.destroyVirtualMachine({ 
              id: args.id,
              expunge: true
            });
            jobIds.push(destroyExpungeResult.destroyvirtualmachineresponse?.jobid);
          } catch (finalError: any) {
            console.log(`Expunge failed: ${finalError.message}`);
          }
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `⚠️  DESTRUCTIVE ACTION EXECUTED: Virtual machine ${vm.name} (${args.id}) destruction workflow completed.\n\nJob IDs: ${jobIds.filter(id => id).join(', ')}\n\nThe VM has been ${args.expunge !== false ? 'destroyed and expunged' : 'destroyed (not expunged)'}.\n\nNote: It may take a few moments for the VM to be fully removed.`,
          },
        ],
      };
    } catch (error: any) {
      // Re-throw with more context
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to destroy VM: ${error.message}`
      );
    }
  }

  private async handleListZones(args: any) {
    const result = await this.cloudStackClient.listZones(args);
    const zones = result.listzonesresponse?.zone || [];
    
    const zoneList = zones.map((zone: Record<string, any>) => ({
      id: zone.id,
      name: zone.name,
      networktype: zone.networktype,
      allocationstate: zone.allocationstate,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${zoneList.length} zones:\n\n${zoneList
            .map(
              (zone: Record<string, any>) =>
                `• ${zone.name} (${zone.id})\n  Network Type: ${zone.networktype}\n  State: ${zone.allocationstate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListTemplates(args: any) {
    const result = await this.cloudStackClient.listTemplates(args);
    const templates = result.listtemplatesresponse?.template || [];
    
    const templateList = templates.map((template: Record<string, any>) => ({
      id: template.id,
      name: template.name,
      displaytext: template.displaytext,
      ostypename: template.ostypename,
      size: template.size,
      created: template.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${templateList.length} templates:\n\n${templateList
            .map(
              (template: Record<string, any>) =>
                `• ${template.name} (${template.id})\n  Description: ${template.displaytext}\n  OS: ${template.ostypename}\n  Size: ${Math.round(template.size / 1024 / 1024 / 1024)}GB\n  Created: ${template.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleDeployVirtualMachine(args: any) {
    try {
      // Check if zone requires network and none provided
      if (args.zoneid && !args.networkids) {
        const zones = await this.cloudStackClient.listZones({ id: args.zoneid });
        const zone = zones.listzonesresponse?.zone?.[0];
        
        if (zone?.networktype === 'Advanced') {
          // Auto-select first available network in the zone
          const networks = await this.cloudStackClient.listNetworks({ zoneid: args.zoneid });
          const networkList = networks.listnetworksresponse?.network || [];
          
          if (networkList.length > 0) {
            args.networkids = networkList[0].id;
            console.log(`Auto-selected network ${networkList[0].name} (${networkList[0].id}) for Advanced zone`);
          } else {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'This is an Advanced zone but no networks are available. Please create a network first.'
            );
          }
        }
      }
      
      // Ensure we have required parameters
      if (!args.serviceofferingid || !args.templateid || !args.zoneid) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Missing required parameters: serviceofferingid, templateid, and zoneid are required'
        );
      }
      
      // Deploy the VM
      const result = await this.cloudStackClient.deployVirtualMachine(args);
      
      return {
        content: [
          {
            type: 'text',
            text: `Virtual machine deployment initiated successfully!\nJob ID: ${result.deployvirtualmachineresponse?.jobid}\n\nTip: Use query_async_job_result with this Job ID to check deployment status.`,
          },
        ],
      };
    } catch (error: any) {
      // Provide helpful error messages
      if (error.message?.includes('530')) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'VM limit reached for your account. Please destroy some existing VMs before creating new ones.'
        );
      } else if (error.message?.includes('431')) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Missing required parameter. For Advanced zones, you may need to specify networkids.'
        );
      }
      throw error;
    }
  }

  // VM Advanced Operations Handlers
  private async handleScaleVirtualMachine(args: any) {
    const result = await this.cloudStackClient.scaleVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} scaling initiated. Job ID: ${result.scalevirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleMigrateVirtualMachine(args: any) {
    const result = await this.cloudStackClient.migrateVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.virtualmachineid} migration initiated. Job ID: ${result.migratevirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleResetPasswordVirtualMachine(args: any) {
    const result = await this.cloudStackClient.resetPasswordForVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Password reset initiated for VM ${args.id}. Job ID: ${result.resetpasswordforvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleChangeServiceOfferingVirtualMachine(args: any) {
    const result = await this.cloudStackClient.changeServiceForVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Service offering change initiated for VM ${args.id}. Job ID: ${result.changeserviceforvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  // Storage Management Handlers
  private async handleListVolumes(args: any) {
    const result = await this.cloudStackClient.listVolumes(args);
    const volumes = result.listvolumesresponse?.volume || [];
    
    const volumeList = volumes.map((volume: Record<string, any>) => ({
      id: volume.id,
      name: volume.name,
      type: volume.type,
      size: volume.size,
      state: volume.state,
      virtualmachineid: volume.virtualmachineid,
      zonename: volume.zonename,
      created: volume.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${volumeList.length} volumes:\n\n${volumeList
            .map(
              (volume: Record<string, any>) =>
                `• ${volume.name} (${volume.id})\n  Type: ${volume.type}\n  Size: ${Math.round(volume.size / 1024 / 1024 / 1024)}GB\n  State: ${volume.state}\n  Zone: ${volume.zonename}\n  Created: ${volume.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleCreateVolume(args: any) {
    const result = await this.cloudStackClient.createVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume creation initiated. Job ID: ${result.createvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleAttachVolume(args: any) {
    const result = await this.cloudStackClient.attachVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} attachment initiated. Job ID: ${result.attachvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleDetachVolume(args: any) {
    const result = await this.cloudStackClient.detachVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} detachment initiated. Job ID: ${result.detachvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleResizeVolume(args: any) {
    const result = await this.cloudStackClient.resizeVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} resize to ${args.size}GB initiated. Job ID: ${result.resizevolumeresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleCreateSnapshot(args: any) {
    const result = await this.cloudStackClient.createSnapshot(args);
    return {
      content: [
        {
          type: 'text',
          text: `Snapshot creation initiated for volume ${args.volumeid}. Job ID: ${result.createsnapshotresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleListSnapshots(args: any) {
    const result = await this.cloudStackClient.listSnapshots(args);
    const snapshots = result.listsnapshotsresponse?.snapshot || [];
    
    const snapshotList = snapshots.map((snapshot: Record<string, any>) => ({
      id: snapshot.id,
      name: snapshot.name,
      volumeid: snapshot.volumeid,
      volumename: snapshot.volumename,
      state: snapshot.state,
      snapshottype: snapshot.snapshottype,
      created: snapshot.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${snapshotList.length} snapshots:\n\n${snapshotList
            .map(
              (snapshot: Record<string, any>) =>
                `• ${snapshot.name} (${snapshot.id})\n  Volume: ${snapshot.volumename}\n  Type: ${snapshot.snapshottype}\n  State: ${snapshot.state}\n  Created: ${snapshot.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  // Network Handlers
  private async handleListNetworks(args: any) {
    const result = await this.cloudStackClient.listNetworks(args);
    const networks = result.listnetworksresponse?.network || [];
    
    const networkList = networks.map((network: Record<string, any>) => ({
      id: network.id,
      name: network.name,
      displaytext: network.displaytext,
      type: network.type,
      zonename: network.zonename,
      state: network.state,
      cidr: network.cidr,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${networkList.length} networks:\n\n${networkList
            .map(
              (network: Record<string, any>) =>
                `• ${network.name} (${network.id})\n  Type: ${network.type}\n  CIDR: ${network.cidr}\n  Zone: ${network.zonename}\n  State: ${network.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleCreateNetwork(args: any) {
    const result = await this.cloudStackClient.createNetwork(args);
    return {
      content: [
        {
          type: 'text',
          text: `Network creation initiated. Job ID: ${result.createnetworkresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleListPublicIpAddresses(args: any) {
    const result = await this.cloudStackClient.listPublicIpAddresses(args);
    const ips = result.listpublicipaddressesresponse?.publicipaddress || [];
    
    const ipList = ips.map((ip: Record<string, any>) => ({
      id: ip.id,
      ipaddress: ip.ipaddress,
      zonename: ip.zonename,
      state: ip.state,
      isstaticnat: ip.isstaticnat,
      associatednetworkname: ip.associatednetworkname,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ipList.length} public IP addresses:\n\n${ipList
            .map(
              (ip: Record<string, any>) =>
                `• ${ip.ipaddress} (${ip.id})\n  Zone: ${ip.zonename}\n  State: ${ip.state}\n  Static NAT: ${ip.isstaticnat ? 'Yes' : 'No'}\n  Network: ${ip.associatednetworkname || 'None'}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleAssociateIpAddress(args: any) {
    const result = await this.cloudStackClient.associateIpAddress(args);
    return {
      content: [
        {
          type: 'text',
          text: `IP address association initiated. Job ID: ${result.associateipaddressresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleEnableStaticNat(args: any) {
    const result = await this.cloudStackClient.enableStaticNat(args);
    return {
      content: [
        {
          type: 'text',
          text: `Static NAT enabled for IP ${args.ipaddressid} to VM ${args.virtualmachineid}. Success: ${result.enablestaticnatresponse?.success}`,
        },
      ],
    };
  }

  private async handleCreateFirewallRule(args: any) {
    const result = await this.cloudStackClient.createFirewallRule(args);
    return {
      content: [
        {
          type: 'text',
          text: `Firewall rule creation initiated. Job ID: ${result.createfirewallruleresponse?.jobid}`,
        },
      ],
    };
  }

  private async handleListLoadBalancerRules(args: any) {
    const result = await this.cloudStackClient.listLoadBalancerRules(args);
    const rules = result.listloadbalancerrulesresponse?.loadbalancerrule || [];
    
    const ruleList = rules.map((rule: Record<string, any>) => ({
      id: rule.id,
      name: rule.name,
      publicip: rule.publicip,
      publicport: rule.publicport,
      privateport: rule.privateport,
      algorithm: rule.algorithm,
      state: rule.state,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ruleList.length} load balancer rules:\n\n${ruleList
            .map(
              (rule: Record<string, any>) =>
                `• ${rule.name} (${rule.id})\n  Public IP: ${rule.publicip}:${rule.publicport}\n  Private Port: ${rule.privateport}\n  Algorithm: ${rule.algorithm}\n  State: ${rule.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  // Monitoring Handlers
  private async handleListVirtualMachineMetrics(args: any) {
    const result = await this.cloudStackClient.listVirtualMachineMetrics(args);
    const metrics = result.listvirtualmachinemetricsresponse?.virtualmachine || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `VM Metrics:\n\n${metrics
            .map(
              (vm: Record<string, any>) =>
                `• ${vm.name} (${vm.id})\n  CPU Used: ${vm.cpuused || 'N/A'}\n  Memory Used: ${vm.memoryused || 'N/A'}\n  Network Read: ${vm.networkkbsread || 'N/A'}\n  Network Write: ${vm.networkkbswrite || 'N/A'}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListEvents(args: any) {
    const result = await this.cloudStackClient.listEvents(args);
    const events = result.listeventsresponse?.event || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${events.length} events:\n\n${events
            .map(
              (event: Record<string, any>) =>
                `• ${event.type} - ${event.description}\n  Level: ${event.level}\n  Created: ${event.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListAlerts(args: any) {
    const result = await this.cloudStackClient.listAlerts(args);
    const alerts = result.listalertsresponse?.alert || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${alerts.length} alerts:\n\n${alerts
            .map(
              (alert: Record<string, any>) =>
                `• ${alert.type} - ${alert.description}\n  Sent: ${alert.sent}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListCapacity(args: any) {
    const result = await this.cloudStackClient.listCapacity(args);
    const capacity = result.listcapacityresponse?.capacity || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `System Capacity:\n\n${capacity
            .map(
              (cap: Record<string, any>) =>
                `• ${cap.type}: ${cap.percentused}% used\n  Used: ${cap.capacityused} / ${cap.capacitytotal}\n  Zone: ${cap.zonename}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListAsyncJobs(args: any) {
    const result = await this.cloudStackClient.listAsyncJobs(args);
    const jobs = result.listasyncjobsresponse?.asyncjobs || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${jobs.length} async jobs:\n\n${jobs
            .map(
              (job: Record<string, any>) =>
                `• Job ${job.jobid}\n  Status: ${job.jobstatus === 0 ? 'Pending' : job.jobstatus === 1 ? 'Success' : 'Error'}\n  Created: ${job.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  // Account Management Handlers
  private async handleListAccounts(args: any) {
    const result = await this.cloudStackClient.listAccounts(args);
    const accounts = result.listaccountsresponse?.account || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${accounts.length} accounts:\n\n${accounts
            .map(
              (account: Record<string, any>) =>
                `• ${account.name} (${account.id})\n  Type: ${account.accounttype}\n  Domain: ${account.domain}\n  State: ${account.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListUsers(args: any) {
    const result = await this.cloudStackClient.listUsers(args);
    const users = result.listusersresponse?.user || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${users.length} users:\n\n${users
            .map(
              (user: Record<string, any>) =>
                `• ${user.username} (${user.id})\n  Account: ${user.account}\n  State: ${user.state}\n  Created: ${user.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListDomains(args: any) {
    const result = await this.cloudStackClient.listDomains(args);
    const domains = result.listdomainsresponse?.domain || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${domains.length} domains:\n\n${domains
            .map(
              (domain: Record<string, any>) =>
                `• ${domain.name} (${domain.id})\n  Path: ${domain.path}\n  Level: ${domain.level}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListUsageRecords(args: any) {
    const result = await this.cloudStackClient.listUsageRecords(args);
    const records = result.listusagerecordsresponse?.usagerecord || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${records.length} usage records:\n\n${records
            .map(
              (record: Record<string, any>) =>
                `• ${record.description}\n  Usage: ${record.usage}\n  Start: ${record.startdate}\n  End: ${record.enddate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  // System Administration Handlers
  private async handleListHosts(args: any) {
    const result = await this.cloudStackClient.listHosts(args);
    const hosts = result.listhostsresponse?.host || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${hosts.length} hosts:\n\n${hosts
            .map(
              (host: Record<string, any>) =>
                `• ${host.name} (${host.id})\n  Type: ${host.type}\n  State: ${host.state}\n  Zone: ${host.zonename}\n  Cluster: ${host.clustername}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListClusters(args: any) {
    const result = await this.cloudStackClient.listClusters(args);
    const clusters = result.listclustersresponse?.cluster || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${clusters.length} clusters:\n\n${clusters
            .map(
              (cluster: Record<string, any>) =>
                `• ${cluster.name} (${cluster.id})\n  Hypervisor: ${cluster.hypervisortype}\n  Zone: ${cluster.zonename}\n  State: ${cluster.allocationstate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListStoragePools(args: any) {
    const result = await this.cloudStackClient.listStoragePools(args);
    const pools = result.liststoragepoolsresponse?.storagepool || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${pools.length} storage pools:\n\n${pools
            .map(
              (pool: Record<string, any>) =>
                `• ${pool.name} (${pool.id})\n  Type: ${pool.type}\n  Zone: ${pool.zonename}\n  State: ${pool.state}\n  Size: ${Math.round(pool.disksizeallocated / 1024 / 1024 / 1024)}GB used / ${Math.round(pool.disksizetotal / 1024 / 1024 / 1024)}GB total\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListSystemVms(args: any) {
    const result = await this.cloudStackClient.listSystemVms(args);
    const systemVms = result.listsystemvmsresponse?.systemvm || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${systemVms.length} system VMs:\n\n${systemVms
            .map(
              (vm: Record<string, any>) =>
                `• ${vm.name} (${vm.id})\n  Type: ${vm.systemvmtype}\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleListServiceOfferings(args: any) {
    const result = await this.cloudStackClient.listServiceOfferings(args);
    const offerings = result.listserviceofferingsresponse?.serviceoffering || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${offerings.length} service offerings:\n\n${offerings
            .map(
              (offering: Record<string, any>) =>
                `• ${offering.name} (${offering.id})\n  CPU: ${offering.cpunumber} cores\n  Memory: ${offering.memory}MB\n  Storage: ${offering.diskbytesreadrate ? 'Custom' : 'Default'}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  // Security Handlers
  private async handleListSSHKeyPairs(args: any) {
    const result = await this.cloudStackClient.listSSHKeyPairs(args);
    const keypairs = result.listsshkeypairsresponse?.sshkeypair || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${keypairs.length} SSH key pairs:\n\n${keypairs
            .map(
              (kp: Record<string, any>) =>
                `• ${kp.name}\n  Fingerprint: ${kp.fingerprint}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleCreateSSHKeyPair(args: any) {
    const result = await this.cloudStackClient.createSSHKeyPair(args);
    return {
      content: [
        {
          type: 'text',
          text: `SSH key pair '${args.name}' created successfully.\nFingerprint: ${result.createsshkeypairresponse?.keypair?.fingerprint}`,
        },
      ],
    };
  }

  private async handleListSecurityGroups(args: any) {
    const result = await this.cloudStackClient.listSecurityGroups(args);
    const groups = result.listsecuritygroupsresponse?.securitygroup || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${groups.length} security groups:\n\n${groups
            .map(
              (sg: Record<string, any>) =>
                `• ${sg.name} (${sg.id})\n  Description: ${sg.description}\n  Rules: ${sg.ingressrule?.length || 0} ingress, ${sg.egressrule?.length || 0} egress\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleCreateSecurityGroupRule(args: any) {
    const result = await this.cloudStackClient.authorizeSecurityGroupIngress(args);
    return {
      content: [
        {
          type: 'text',
          text: `Security group rule creation initiated. Job ID: ${result.authorizesecuritygroupingressresponse?.jobid}`,
        },
      ],
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CloudStack MCP server running on stdio');
  }
}

const server = new CloudStackMcpServer();
server.run().catch(console.error);