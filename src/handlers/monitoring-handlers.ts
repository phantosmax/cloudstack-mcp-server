import { CloudStackClient } from '../cloudstack-client.js';

export class MonitoringHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListVirtualMachineMetrics(args: any) {
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

  async handleListEvents(args: any) {
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

  async handleListAlerts(args: any) {
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

  async handleListCapacity(args: any) {
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

  async handleListAsyncJobs(args: any) {
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
}