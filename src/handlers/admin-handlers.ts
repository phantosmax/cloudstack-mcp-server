import { CloudStackClient } from '../cloudstack-client.js';

export class AdminHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListZones(args: any) {
    const result = await this.cloudStackClient.listZones(args);
    const zones = result.listzonesresponse?.zone || [];
    
    const zoneList = zones.map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      allocationstate: zone.allocationstate,
      networktype: zone.networktype,
      localstorageenabled: zone.localstorageenabled,
      securitygroupsenabled: zone.securitygroupsenabled
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${zoneList.length} zones:\n\n${zoneList
            .map((zone: any) => 
              `• ${zone.name} (${zone.id})\n  Description: ${zone.description}\n  Allocation State: ${zone.allocationstate}\n  Network Type: ${zone.networktype}\n  Local Storage: ${zone.localstorageenabled}\n  Security Groups: ${zone.securitygroupsenabled}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListTemplates(args: any) {
    const result = await this.cloudStackClient.listTemplates(args);
    const templates = result.listtemplatesresponse?.template || [];
    
    const templateList = templates.map((template: any) => ({
      id: template.id,
      name: template.name,
      displaytext: template.displaytext,
      ostypename: template.ostypename,
      size: template.size,
      created: template.created,
      isready: template.isready,
      ispublic: template.ispublic,
      isfeatured: template.isfeatured
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${templateList.length} templates:\n\n${templateList
            .map((template: any) => 
              `• ${template.name} (${template.id})\n  Display Text: ${template.displaytext}\n  OS Type: ${template.ostypename}\n  Size: ${template.size}GB\n  Ready: ${template.isready}\n  Public: ${template.ispublic}\n  Featured: ${template.isfeatured}\n  Created: ${template.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListAccounts(args: any) {
    const result = await this.cloudStackClient.listAccounts(args);
    const accounts = result.listaccountsresponse?.account || [];
    
    const accountList = accounts.map((account: any) => ({
      id: account.id,
      name: account.name,
      accounttype: account.accounttype,
      domain: account.domain,
      state: account.state,
      receivedbytes: account.receivedbytes,
      sentbytes: account.sentbytes
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${accountList.length} accounts:\n\n${accountList
            .map((account: any) => 
              `• ${account.name} (${account.id})\n  Type: ${account.accounttype}\n  Domain: ${account.domain}\n  State: ${account.state}\n  Received: ${account.receivedbytes} bytes\n  Sent: ${account.sentbytes} bytes\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListUsers(args: any) {
    const result = await this.cloudStackClient.listUsers(args);
    const users = result.listusersresponse?.user || [];
    
    const userList = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      state: user.state,
      account: user.account,
      accounttype: user.accounttype,
      domain: user.domain,
      created: user.created
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${userList.length} users:\n\n${userList
            .map((user: any) => 
              `• ${user.username} (${user.id})\n  Name: ${user.firstname} ${user.lastname}\n  Email: ${user.email}\n  State: ${user.state}\n  Account: ${user.account}\n  Domain: ${user.domain}\n  Created: ${user.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListDomains(args: any) {
    const result = await this.cloudStackClient.listDomains(args);
    const domains = result.listdomainsresponse?.domain || [];
    
    const domainList = domains.map((domain: any) => ({
      id: domain.id,
      name: domain.name,
      path: domain.path,
      level: domain.level,
      parentdomainid: domain.parentdomainid,
      parentdomainname: domain.parentdomainname,
      haschild: domain.haschild,
      state: domain.state
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${domainList.length} domains:\n\n${domainList
            .map((domain: any) => 
              `• ${domain.name} (${domain.id})\n  Path: ${domain.path}\n  Level: ${domain.level}\n  Parent: ${domain.parentdomainname || 'None'}\n  Has Children: ${domain.haschild}\n  State: ${domain.state}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListHosts(args: any) {
    const result = await this.cloudStackClient.listHosts(args);
    const hosts = result.listhostsresponse?.host || [];
    
    const hostList = hosts.map((host: any) => ({
      id: host.id,
      name: host.name,
      type: host.type,
      state: host.state,
      ipaddress: host.ipaddress,
      zonename: host.zonename,
      clustername: host.clustername,
      hypervisor: host.hypervisor,
      cpunumber: host.cpunumber,
      cpuspeed: host.cpuspeed,
      memorytotal: host.memorytotal,
      memoryused: host.memoryused
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${hostList.length} hosts:\n\n${hostList
            .map((host: any) => 
              `• ${host.name} (${host.id})\n  Type: ${host.type}\n  State: ${host.state}\n  IP: ${host.ipaddress}\n  Zone: ${host.zonename}\n  Cluster: ${host.clustername}\n  Hypervisor: ${host.hypervisor}\n  CPUs: ${host.cpunumber} @ ${host.cpuspeed}MHz\n  Memory: ${host.memoryused}/${host.memorytotal}MB\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListClusters(args: any) {
    const result = await this.cloudStackClient.listClusters(args);
    const clusters = result.listclustersresponse?.cluster || [];
    
    const clusterList = clusters.map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      zonename: cluster.zonename,
      hypervisortype: cluster.hypervisortype,
      clustertype: cluster.clustertype,
      allocationstate: cluster.allocationstate,
      managedstate: cluster.managedstate
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${clusterList.length} clusters:\n\n${clusterList
            .map((cluster: any) => 
              `• ${cluster.name} (${cluster.id})\n  Zone: ${cluster.zonename}\n  Hypervisor: ${cluster.hypervisortype}\n  Type: ${cluster.clustertype}\n  Allocation State: ${cluster.allocationstate}\n  Managed State: ${cluster.managedstate}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListStoragePools(args: any) {
    const result = await this.cloudStackClient.listStoragePools(args);
    const pools = result.liststoragepoolsresponse?.storagepool || [];
    
    const poolList = pools.map((pool: any) => ({
      id: pool.id,
      name: pool.name,
      type: pool.type,
      state: pool.state,
      zonename: pool.zonename,
      clustername: pool.clustername,
      ipaddress: pool.ipaddress,
      path: pool.path,
      disksizeused: pool.disksizeused,
      disksizetotal: pool.disksizetotal
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${poolList.length} storage pools:\n\n${poolList
            .map((pool: any) => 
              `• ${pool.name} (${pool.id})\n  Type: ${pool.type}\n  State: ${pool.state}\n  Zone: ${pool.zonename}\n  Cluster: ${pool.clustername}\n  IP: ${pool.ipaddress}\n  Path: ${pool.path}\n  Usage: ${pool.disksizeused}/${pool.disksizetotal} GB\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListSystemVms(args: any) {
    const result = await this.cloudStackClient.listSystemVms(args);
    const systemVms = result.listsystemvmsresponse?.systemvm || [];
    
    const systemVmList = systemVms.map((vm: any) => ({
      id: vm.id,
      name: vm.name,
      systemvmtype: vm.systemvmtype,
      state: vm.state,
      zonename: vm.zonename,
      hostid: vm.hostid,
      hostname: vm.hostname,
      publicip: vm.publicip,
      privateip: vm.privateip,
      linklocalip: vm.linklocalip
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${systemVmList.length} system VMs:\n\n${systemVmList
            .map((vm: any) => 
              `• ${vm.name} (${vm.id})\n  Type: ${vm.systemvmtype}\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n  Host: ${vm.hostname}\n  Public IP: ${vm.publicip}\n  Private IP: ${vm.privateip}\n  Link Local IP: ${vm.linklocalip}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleListServiceOfferings(args: any) {
    const result = await this.cloudStackClient.listServiceOfferings(args);
    const offerings = result.listserviceofferingsresponse?.serviceoffering || [];
    
    const offeringList = offerings.map((offering: any) => ({
      id: offering.id,
      name: offering.name,
      displaytext: offering.displaytext,
      cpunumber: offering.cpunumber,
      cpuspeed: offering.cpuspeed,
      memory: offering.memory,
      storagetype: offering.storagetype,
      iscustomized: offering.iscustomized,
      issystem: offering.issystem,
      created: offering.created
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${offeringList.length} service offerings:\n\n${offeringList
            .map((offering: any) => 
              `• ${offering.name} (${offering.id})\n  Display Text: ${offering.displaytext}\n  CPUs: ${offering.cpunumber} @ ${offering.cpuspeed}MHz\n  Memory: ${offering.memory}MB\n  Storage Type: ${offering.storagetype}\n  Customized: ${offering.iscustomized}\n  System: ${offering.issystem}\n  Created: ${offering.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}