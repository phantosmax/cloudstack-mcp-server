export const adminTools = [
  {
    name: 'list_zones',
    description: 'List availability zones',
    inputSchema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Show only available zones',
          default: true,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_templates',
    description: 'List templates',
    inputSchema: {
      type: 'object',
      properties: {
        templatefilter: {
          type: 'string',
          description: 'Template filter (featured, self, selfexecutable, sharedexecutable, executable, community)',
          default: 'featured',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter templates',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
        },
      },
      required: ['templatefilter'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_accounts',
    description: 'List accounts',
    inputSchema: {
      type: 'object',
      properties: {
        domainid: {
          type: 'string',
          description: 'Domain ID to filter accounts',
        },
        state: {
          type: 'string',
          description: 'Account state',
        },
        accounttype: {
          type: 'number',
          description: 'Account type (0=User, 1=Admin, 2=DomainAdmin)',
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
        account: {
          type: 'string',
          description: 'Account name to filter users',
        },
        domainid: {
          type: 'string',
          description: 'Domain ID to filter users',
        },
        state: {
          type: 'string',
          description: 'User state',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_domains',
    description: 'List domains',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'number',
          description: 'Domain level',
        },
        name: {
          type: 'string',
          description: 'Domain name',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_hosts',
    description: 'List hosts',
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
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_clusters',
    description: 'List clusters',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter clusters',
        },
        hypervisor: {
          type: 'string',
          description: 'Hypervisor type',
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
    description: 'List system VMs (console proxy, secondary storage)',
    inputSchema: {
      type: 'object',
      properties: {
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter system VMs',
        },
        systemvmtype: {
          type: 'string',
          description: 'System VM type (consoleproxy, secondarystoragevm)',
        },
        state: {
          type: 'string',
          description: 'System VM state',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_service_offerings',
    description: 'List service offerings (compute plans)',
    inputSchema: {
      type: 'object',
      properties: {
        issystem: {
          type: 'boolean',
          description: 'Show system offerings',
          default: false,
        },
        domainid: {
          type: 'string',
          description: 'Domain ID to filter offerings',
        },
      },
      additionalProperties: false,
    },
  },
];