/**
 * Test utilities and helpers for CloudStack MCP Server tests
 */

import { CloudStackConfig, CloudStackParams } from '../src/cloudstack-client';

/**
 * Mock CloudStack configuration for testing
 */
export const mockCloudStackConfig: CloudStackConfig = {
  apiUrl: 'http://test.example.com/client/api',
  apiKey: 'test-api-key-12345678',
  secretKey: 'test-secret-key-87654321',
  timeout: 30000
};

/**
 * Mock CloudStack response templates
 */
export const mockResponses = {
  virtualMachines: {
    data: {
      listvirtualmachinesresponse: {
        virtualmachine: [
          {
            id: 'vm-123',
            name: 'test-vm',
            displayname: 'Test Virtual Machine',
            state: 'Running',
            zonename: 'test-zone',
            templatename: 'CentOS 7',
            serviceofferingname: 'Small Instance',
            cpunumber: 2,
            memory: 2048,
            created: '2024-01-01T00:00:00Z'
          }
        ]
      }
    }
  },
  
  job: {
    data: {
      deployvirtualmachineresponse: {
        jobid: 'job-12345',
        id: 'vm-456'
      }
    }
  },
  
  zones: {
    data: {
      listzonesresponse: {
        zone: [
          {
            id: 'zone-123',
            name: 'test-zone',
            networktype: 'Advanced',
            allocationstate: 'Enabled'
          }
        ]
      }
    }
  },
  
  templates: {
    data: {
      listtemplatesresponse: {
        template: [
          {
            id: 'template-123',
            name: 'CentOS 7',
            displaytext: 'CentOS 7 Template',
            ostypename: 'CentOS 7',
            size: 10737418240,
            created: '2024-01-01T00:00:00Z'
          }
        ]
      }
    }
  },
  
  error: {
    data: {
      errortext: 'Test error message'
    }
  }
};

/**
 * Creates mock parameters for testing various CloudStack operations
 */
export const mockParams = {
  vm: {
    list: { zoneid: 'zone-123', state: 'Running' },
    deploy: {
      serviceofferingid: 'offering-123',
      templateid: 'template-123',
      zoneid: 'zone-123',
      name: 'test-vm'
    },
    start: { id: 'vm-123' },
    stop: { id: 'vm-123', forced: false },
    destroy: { id: 'vm-123', confirm: true, expunge: false }
  },
  
  volume: {
    create: { name: 'test-volume', zoneid: 'zone-123' },
    attach: { id: 'volume-123', virtualmachineid: 'vm-123' },
    detach: { id: 'volume-123', confirm: true }
  },
  
  network: {
    create: {
      name: 'test-network',
      networkofferingid: 'offering-123',
      zoneid: 'zone-123'
    }
  }
};

/**
 * Validates that a CloudStack API call was made with correct parameters
 */
export function expectCloudStackCall(
  mockAxios: any,
  command: string,
  params: CloudStackParams = {}
) {
  expect(mockAxios.get).toHaveBeenCalledWith(
    mockCloudStackConfig.apiUrl,
    expect.objectContaining({
      params: expect.objectContaining({
        command,
        apiKey: mockCloudStackConfig.apiKey,
        response: 'json',
        ...params
      })
    })
  );
}

/**
 * Creates a mock axios error for testing error handling
 */
export function createAxiosError(message: string, status?: number) {
  return {
    isAxiosError: true,
    message,
    response: {
      status: status || 500,
      data: { errortext: message }
    }
  };
}

/**
 * Function categories and their expected counts for validation
 */
export const FUNCTION_CATEGORIES = {
  'Virtual Machine Management': 7,
  'VM Advanced Operations': 4,
  'Storage Management': 7,
  'Networking': 7,
  'Monitoring & Analytics': 5,
  'Account & User Management': 4,
  'Infrastructure Discovery': 2,
  'System Administration': 5,
  'Security & Compliance': 4
} as const;

/**
 * Total expected function count
 */
export const TOTAL_FUNCTIONS = Object.values(FUNCTION_CATEGORIES).reduce((a, b) => a + b, 0);

/**
 * All CloudStack MCP tool names organized by category
 */
export const TOOL_NAMES = {
  vmManagement: [
    'list_virtual_machines',
    'get_virtual_machine',
    'start_virtual_machine',
    'stop_virtual_machine',
    'reboot_virtual_machine',
    'destroy_virtual_machine',
    'deploy_virtual_machine'
  ],
  
  vmAdvanced: [
    'scale_virtual_machine',
    'migrate_virtual_machine',
    'reset_password_virtual_machine',
    'change_service_offering_virtual_machine'
  ],
  
  storage: [
    'list_volumes',
    'create_volume',
    'attach_volume',
    'detach_volume',
    'resize_volume',
    'create_snapshot',
    'list_snapshots'
  ],
  
  networking: [
    'list_networks',
    'create_network',
    'list_public_ip_addresses',
    'associate_ip_address',
    'enable_static_nat',
    'create_firewall_rule',
    'list_load_balancer_rules'
  ],
  
  monitoring: [
    'list_virtual_machine_metrics',
    'list_events',
    'list_alerts',
    'list_capacity',
    'list_async_jobs'
  ],
  
  account: [
    'list_accounts',
    'list_users',
    'list_domains',
    'list_usage_records'
  ],
  
  infrastructure: [
    'list_zones',
    'list_templates'
  ],
  
  systemAdmin: [
    'list_hosts',
    'list_clusters',
    'list_storage_pools',
    'list_system_vms',
    'list_service_offerings'
  ],
  
  security: [
    'list_ssh_key_pairs',
    'create_ssh_key_pair',
    'list_security_groups',
    'create_security_group_rule'
  ]
} as const;

/**
 * Flattened array of all tool names
 */
export const ALL_TOOL_NAMES = Object.values(TOOL_NAMES).flat();

/**
 * Operations that require confirmation for safety
 */
export const DESTRUCTIVE_OPERATIONS = [
  'destroy_virtual_machine',
  'scale_virtual_machine',
  'migrate_virtual_machine',
  'reset_password_virtual_machine',
  'detach_volume',
  'resize_volume'
] as const;