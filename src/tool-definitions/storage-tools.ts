export const storageTools = [
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
        zoneid: {
          type: 'string',
          description: 'Zone ID to filter volumes',
        },
        type: {
          type: 'string',
          description: 'Volume type (ROOT, DATADISK)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'create_volume',
    description: 'Create a new volume',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Volume name',
        },
        diskofferingid: {
          type: 'string',
          description: 'Disk offering ID',
        },
        zoneid: {
          type: 'string',
          description: 'Zone ID',
        },
        size: {
          type: 'number',
          description: 'Volume size in GB (for custom disk offerings)',
        },
      },
      required: ['name', 'diskofferingid', 'zoneid'],
      additionalProperties: false,
    },
  },
  {
    name: 'attach_volume',
    description: 'Attach volume to virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
        virtualmachineid: {
          type: 'string',
          description: 'VM ID to attach to',
        },
        deviceid: {
          type: 'number',
          description: 'Device ID',
        },
      },
      required: ['id', 'virtualmachineid'],
      additionalProperties: false,
    },
  },
  {
    name: 'detach_volume',
    description: 'Detach volume from virtual machine',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Volume ID',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'resize_volume',
    description: 'Resize a volume',
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
        shrinkok: {
          type: 'boolean',
          description: 'Allow shrinking',
          default: false,
        },
      },
      required: ['id', 'size'],
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
          description: 'Volume ID to snapshot',
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
        intervaltype: {
          type: 'string',
          description: 'Interval type (MANUAL, HOURLY, DAILY, WEEKLY, MONTHLY)',
        },
      },
      additionalProperties: false,
    },
  },
];