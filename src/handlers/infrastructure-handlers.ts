import { CloudStackClient } from '../cloudstack-client.js';

export class InfrastructureHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListZones(args: any) {
    const result = await this.cloudStackClient.listZones(args);
    const zones = result.listzonesresponse?.zone || [];
    
    const zoneList = zones.map((zone: Record<string, any>) => ({
      id: zone.id,
      name: zone.name,
      networktype: zone.networktype,
      allocationstate: zone.allocationstate,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${zoneList.length} zones:\n\n${zoneList
            .map(
              (zone: Record<string, any>) =>
                `• ${zone.name} (${zone.id})\n  Network Type: ${zone.networktype}\n  State: ${zone.allocationstate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListTemplates(args: any) {
    const result = await this.cloudStackClient.listTemplates(args);
    const templates = result.listtemplatesresponse?.template || [];
    
    const templateList = templates.map((template: Record<string, any>) => ({
      id: template.id,
      name: template.name,
      displaytext: template.displaytext,
      ostypename: template.ostypename,
      size: template.size,
      created: template.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${templateList.length} templates:\n\n${templateList
            .map(
              (template: Record<string, any>) =>
                `• ${template.name} (${template.id})\n  Description: ${template.displaytext}\n  OS: ${template.ostypename}\n  Size: ${Math.round(template.size / 1024 / 1024 / 1024)}GB\n  Created: ${template.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListServiceOfferings(args: any) {
    const result = await this.cloudStackClient.listServiceOfferings(args);
    const offerings = result.listserviceofferingsresponse?.serviceoffering || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${offerings.length} service offerings:\n\n${offerings
            .map(
              (offering: Record<string, any>) =>
                `• ${offering.name} (${offering.id})\n  CPU: ${offering.cpunumber} cores\n  Memory: ${offering.memory}MB\n  Storage: ${offering.diskbytesreadrate ? 'Custom' : 'Default'}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListHosts(args: any) {
    const result = await this.cloudStackClient.listHosts(args);
    const hosts = result.listhostsresponse?.host || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${hosts.length} hosts:\n\n${hosts
            .map(
              (host: Record<string, any>) =>
                `• ${host.name} (${host.id})\n  Type: ${host.type}\n  State: ${host.state}\n  Zone: ${host.zonename}\n  Cluster: ${host.clustername}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListClusters(args: any) {
    const result = await this.cloudStackClient.listClusters(args);
    const clusters = result.listclustersresponse?.cluster || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${clusters.length} clusters:\n\n${clusters
            .map(
              (cluster: Record<string, any>) =>
                `• ${cluster.name} (${cluster.id})\n  Hypervisor: ${cluster.hypervisortype}\n  Zone: ${cluster.zonename}\n  State: ${cluster.allocationstate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListStoragePools(args: any) {
    const result = await this.cloudStackClient.listStoragePools(args);
    const pools = result.liststoragepoolsresponse?.storagepool || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${pools.length} storage pools:\n\n${pools
            .map(
              (pool: Record<string, any>) =>
                `• ${pool.name} (${pool.id})\n  Type: ${pool.type}\n  Zone: ${pool.zonename}\n  State: ${pool.state}\n  Size: ${Math.round(pool.disksizeallocated / 1024 / 1024 / 1024)}GB used / ${Math.round(pool.disksizetotal / 1024 / 1024 / 1024)}GB total\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListSystemVms(args: any) {
    const result = await this.cloudStackClient.listSystemVms(args);
    const systemVms = result.listsystemvmsresponse?.systemvm || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${systemVms.length} system VMs:\n\n${systemVms
            .map(
              (vm: Record<string, any>) =>
                `• ${vm.name} (${vm.id})\n  Type: ${vm.systemvmtype}\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }
}