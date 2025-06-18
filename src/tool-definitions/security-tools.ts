export const securityTools = [
  {
    name: 'list_ssh_key_pairs',
    description: 'List SSH key pairs',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Key pair name to filter',
        },
        fingerprint: {
          type: 'string',
          description: 'Key fingerprint to filter',
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
        publickey: {
          type: 'string',
          description: 'Public key string (optional - generates if not provided)',
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
          description: 'Security group name to filter',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to show associated security groups',
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
          description: 'CIDR list (comma-separated)',
        },
        usersecuritygrouplist: {
          type: 'string',
          description: 'User security group list',
        },
      },
      required: ['securitygroupid', 'protocol'],
      additionalProperties: false,
    },
  },
];