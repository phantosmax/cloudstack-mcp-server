export const monitoringTools = [
  {
    name: 'list_events',
    description: 'List system events',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          description: 'Event level (INFO, WARN, ERROR)',
        },
        type: {
          type: 'string',
          description: 'Event type',
        },
        startdate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        enddate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
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
          type: 'number',
          description: 'Capacity type (0=Memory, 1=CPU, 2=Storage, etc.)',
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
        keyword: {
          type: 'string',
          description: 'Keyword to search jobs',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_usage_records',
    description: 'List usage records for billing',
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
          type: 'number',
          description: 'Usage type',
        },
      },
      required: ['startdate', 'enddate'],
      additionalProperties: false,
    },
  },
];