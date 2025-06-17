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
import { CloudStackConfig } from './types.js';
import { toolDefinitions } from './tool-definitions.js';
import {
  VmHandlers,
  InfrastructureHandlers,
  StorageHandlers,
  NetworkHandlers,
  MonitoringHandlers,
  AccountHandlers,
  SecurityHandlers,
} from './handlers/index.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

class CloudStackMcpServer {
  private server: Server;
  private cloudStackClient: CloudStackClient;
  private vmHandlers!: VmHandlers;
  private infrastructureHandlers!: InfrastructureHandlers;
  private storageHandlers!: StorageHandlers;
  private networkHandlers!: NetworkHandlers;
  private monitoringHandlers!: MonitoringHandlers;
  private accountHandlers!: AccountHandlers;
  private securityHandlers!: SecurityHandlers;

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
    this.initializeHandlers();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private initializeHandlers(): void {
    this.vmHandlers = new VmHandlers(this.cloudStackClient);
    this.infrastructureHandlers = new InfrastructureHandlers(this.cloudStackClient);
    this.storageHandlers = new StorageHandlers(this.cloudStackClient);
    this.networkHandlers = new NetworkHandlers(this.cloudStackClient);
    this.monitoringHandlers = new MonitoringHandlers(this.cloudStackClient);
    this.accountHandlers = new AccountHandlers(this.cloudStackClient);
    this.securityHandlers = new SecurityHandlers(this.cloudStackClient);
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
        tools: toolDefinitions,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          // VM Operations
          case 'list_virtual_machines':
            return await this.vmHandlers.handleListVirtualMachines(args);
          case 'get_virtual_machine':
            return await this.vmHandlers.handleGetVirtualMachine(args);
          case 'start_virtual_machine':
            return await this.vmHandlers.handleStartVirtualMachine(args);
          case 'stop_virtual_machine':
            return await this.vmHandlers.handleStopVirtualMachine(args);
          case 'reboot_virtual_machine':
            return await this.vmHandlers.handleRebootVirtualMachine(args);
          case 'destroy_virtual_machine':
            return await this.vmHandlers.handleDestroyVirtualMachine(args);
          case 'deploy_virtual_machine':
            return await this.vmHandlers.handleDeployVirtualMachine(args);
          case 'scale_virtual_machine':
            return await this.vmHandlers.handleScaleVirtualMachine(args);
          case 'migrate_virtual_machine':
            return await this.vmHandlers.handleMigrateVirtualMachine(args);
          case 'reset_password_virtual_machine':
            return await this.vmHandlers.handleResetPasswordVirtualMachine(args);
          case 'change_service_offering_virtual_machine':
            return await this.vmHandlers.handleChangeServiceOfferingVirtualMachine(args);
          // Infrastructure Operations
          case 'list_zones':
            return await this.infrastructureHandlers.handleListZones(args);
          case 'list_templates':
            return await this.infrastructureHandlers.handleListTemplates(args);
          case 'list_service_offerings':
            return await this.infrastructureHandlers.handleListServiceOfferings(args);
          case 'list_hosts':
            return await this.infrastructureHandlers.handleListHosts(args);
          case 'list_clusters':
            return await this.infrastructureHandlers.handleListClusters(args);
          case 'list_storage_pools':
            return await this.infrastructureHandlers.handleListStoragePools(args);
          case 'list_system_vms':
            return await this.infrastructureHandlers.handleListSystemVms(args);
          // Storage Management
          case 'list_volumes':
            return await this.storageHandlers.handleListVolumes(args);
          case 'create_volume':
            return await this.storageHandlers.handleCreateVolume(args);
          case 'attach_volume':
            return await this.storageHandlers.handleAttachVolume(args);
          case 'detach_volume':
            return await this.storageHandlers.handleDetachVolume(args);
          case 'resize_volume':
            return await this.storageHandlers.handleResizeVolume(args);
          case 'create_snapshot':
            return await this.storageHandlers.handleCreateSnapshot(args);
          case 'list_snapshots':
            return await this.storageHandlers.handleListSnapshots(args);
          // Networking
          case 'list_networks':
            return await this.networkHandlers.handleListNetworks(args);
          case 'create_network':
            return await this.networkHandlers.handleCreateNetwork(args);
          case 'list_public_ip_addresses':
            return await this.networkHandlers.handleListPublicIpAddresses(args);
          case 'associate_ip_address':
            return await this.networkHandlers.handleAssociateIpAddress(args);
          case 'enable_static_nat':
            return await this.networkHandlers.handleEnableStaticNat(args);
          case 'create_firewall_rule':
            return await this.networkHandlers.handleCreateFirewallRule(args);
          case 'list_load_balancer_rules':
            return await this.networkHandlers.handleListLoadBalancerRules(args);
          // Monitoring & Analytics
          case 'list_virtual_machine_metrics':
            return await this.monitoringHandlers.handleListVirtualMachineMetrics(args);
          case 'list_events':
            return await this.monitoringHandlers.handleListEvents(args);
          case 'list_alerts':
            return await this.monitoringHandlers.handleListAlerts(args);
          case 'list_capacity':
            return await this.monitoringHandlers.handleListCapacity(args);
          case 'list_async_jobs':
            return await this.monitoringHandlers.handleListAsyncJobs(args);
          // Account & User Management
          case 'list_accounts':
            return await this.accountHandlers.handleListAccounts(args);
          case 'list_users':
            return await this.accountHandlers.handleListUsers(args);
          case 'list_domains':
            return await this.accountHandlers.handleListDomains(args);
          case 'list_usage_records':
            return await this.accountHandlers.handleListUsageRecords(args);
          // Security & Compliance
          case 'list_ssh_key_pairs':
            return await this.securityHandlers.handleListSSHKeyPairs(args);
          case 'create_ssh_key_pair':
            return await this.securityHandlers.handleCreateSSHKeyPair(args);
          case 'list_security_groups':
            return await this.securityHandlers.handleListSecurityGroups(args);
          case 'create_security_group_rule':
            return await this.securityHandlers.handleCreateSecurityGroupRule(args);
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