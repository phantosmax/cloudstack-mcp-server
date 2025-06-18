export const networkTools = [
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
          description: 'Network type (Isolated, Shared, L2)',
        },
        isdefault: {
          type: 'boolean',
          description: 'Filter by default networks',
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
          description: 'Network display text',
        },
        networkofferingid: {
          type: 'string',
          description: 'Network offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        gateway: {
          type: 'string',
          description: 'Network gateway',
        },
        netmask: {
          type: 'string',
          description: 'Network netmask',
        },
      },
      required: ['name', 'displaytext', 'networkofferingid', 'zoneid'],
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
        allocatedonly: {
          type: 'boolean',
          description: 'Show only allocated IPs',
          default: true,
        },
        isstaticnat: {
          type: 'boolean',
          description: 'Filter by static NAT enabled',
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
          description: 'Network ID',
        },
        vpcid: {
          type: 'string',
          description: 'VPC ID',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'enable_static_nat',
    description: 'Enable static NAT for an IP to a VM',
    inputSchema: {
      type: 'object',
      properties: {
        ipaddressid: {
          type: 'string',
          description: 'Public IP address ID',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID',
        },
        vmguestip: {
          type: 'string',
          description: 'VM guest IP (for multiple IPs)',
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
          description: 'Public IP address ID',
        },
        protocol: {
          type: 'string',
          description: 'Protocol (tcp, udp, icmp)',
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
          description: 'CIDR list (comma-separated)',
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
];