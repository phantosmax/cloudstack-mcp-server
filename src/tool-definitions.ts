export const toolDefinitions = [
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
];