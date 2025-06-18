import { CloudStackClient } from '../cloudstack-client.js';

export class MonitoringHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListEvents(args: any) {
    const result = await this.cloudStackClient.listEvents(args);
    const events = result.listeventsresponse?.event || [];
    
    const eventList = events.map((event: any) => ({
      id: event.id,
      type: event.type,
      description: event.description,
      level: event.level,
      created: event.created,
      username: event.username,
      domain: event.domain
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${eventList.length} events:\n\n${eventList
            .map((event: any) => 
              `• ${event.type} (${event.id})\n  Description: ${event.description}\n  Level: ${event.level}\n  User: ${event.username}\n  Domain: ${event.domain}\n  Created: ${event.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListAlerts(args: any) {
    const result = await this.cloudStackClient.listAlerts(args);
    const alerts = result.listalertsresponse?.alert || [];
    
    const alertList = alerts.map((alert: any) => ({
      id: alert.id,
      type: alert.type,
      description: alert.description,
      sent: alert.sent,
      name: alert.name
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${alertList.length} alerts:\n\n${alertList
            .map((alert: any) => 
              `• ${alert.name} (${alert.id})\n  Type: ${alert.type}\n  Description: ${alert.description}\n  Sent: ${alert.sent}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListCapacity(args: any) {
    const result = await this.cloudStackClient.listCapacity(args);
    const capacities = result.listcapacityresponse?.capacity || [];
    
    const capacityList = capacities.map((capacity: any) => ({
      type: capacity.type,
      zonename: capacity.zonename,
      capacityused: capacity.capacityused,
      capacitytotal: capacity.capacitytotal,
      percentused: capacity.percentused
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${capacityList.length} capacity metrics:\n\n${capacityList
            .map((cap: any) => 
              `• Type: ${cap.type}\n  Zone: ${cap.zonename}\n  Used: ${cap.capacityused}\n  Total: ${cap.capacitytotal}\n  Percent Used: ${cap.percentused}%\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListAsyncJobs(args: any) {
    const result = await this.cloudStackClient.listAsyncJobs(args);
    const jobs = result.listasyncjobsresponse?.asyncjobs || [];
    
    const jobList = jobs.map((job: any) => ({
      jobid: job.jobid,
      cmd: job.cmd,
      jobstatus: job.jobstatus,
      created: job.created,
      userid: job.userid,
      instancetype: job.jobinstancetype,
      instanceid: job.jobinstanceid
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${jobList.length} async jobs:\n\n${jobList
            .map((job: any) => 
              `• Job ID: ${job.jobid}\n  Command: ${job.cmd}\n  Status: ${job.jobstatus}\n  Created: ${job.created}\n  Instance: ${job.instancetype} (${job.instanceid})\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListUsageRecords(args: any) {
    const result = await this.cloudStackClient.listUsageRecords(args);
    const records = result.listusagerecordsresponse?.usagerecord || [];
    
    const recordList = records.map((record: any) => ({
      usageid: record.usageid,
      description: record.description,
      usagetype: record.usagetype,
      rawusage: record.rawusage,
      usage: record.usage,
      startdate: record.startdate,
      enddate: record.enddate
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${recordList.length} usage records:\n\n${recordList
            .map((record: any) => 
              `• ${record.description} (${record.usageid})\n  Type: ${record.usagetype}\n  Usage: ${record.usage}\n  Start: ${record.startdate}\n  End: ${record.enddate}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}