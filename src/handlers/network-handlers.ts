import { CloudStackClient } from '../cloudstack-client.js';

export class NetworkHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListNetworks(args: any) {
    const result = await this.cloudStackClient.listNetworks(args);
    const networks = result.listnetworksresponse?.network || [];
    
    const networkList = networks.map((network: any) => ({
      id: network.id,
      name: network.name,
      displaytext: network.displaytext,
      type: network.type,
      state: network.state,
      zonename: network.zonename,
      cidr: network.cidr,
      gateway: network.gateway,
      netmask: network.netmask,
      vlan: network.vlan,
      broadcasturi: network.broadcasturi,
      traffictype: network.traffictype
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${networkList.length} networks:\n\n${networkList
            .map((net: any) => 
              `• ${net.name} (${net.id})\n  Display Text: ${net.displaytext}\n  Type: ${net.type}\n  State: ${net.state}\n  Zone: ${net.zonename}\n  CIDR: ${net.cidr}\n  Gateway: ${net.gateway}\n  Netmask: ${net.netmask}\n  VLAN: ${net.vlan || 'N/A'}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleCreateNetwork(args: any) {
    const result = await this.cloudStackClient.createNetwork(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created network. Job ID: ${result.createnetworkresponse?.jobid}\nNetwork ID: ${result.createnetworkresponse?.id}`
        }
      ]
    };
  }

  async handleListPublicIpAddresses(args: any) {
    const result = await this.cloudStackClient.listPublicIpAddresses(args);
    const ips = result.listpublicipaddressesresponse?.publicipaddress || [];
    
    const ipList = ips.map((ip: any) => ({
      id: ip.id,
      ipaddress: ip.ipaddress,
      state: ip.state,
      zonename: ip.zonename,
      allocated: ip.allocated,
      issourcenat: ip.issourcenat,
      isstaticnat: ip.isstaticnat,
      virtualmachineid: ip.virtualmachineid,
      virtualmachinename: ip.virtualmachinename
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ipList.length} public IP addresses:\n\n${ipList
            .map((ip: any) => 
              `• ${ip.ipaddress} (${ip.id})\n  State: ${ip.state}\n  Zone: ${ip.zonename}\n  Allocated: ${ip.allocated}\n  Source NAT: ${ip.issourcenat}\n  Static NAT: ${ip.isstaticnat}\n  VM: ${ip.virtualmachinename || 'Not assigned'}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleAssociateIpAddress(args: any) {
    const result = await this.cloudStackClient.associateIpAddress(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Associated IP address. Job ID: ${result.associateipaddressresponse?.jobid}\nIP ID: ${result.associateipaddressresponse?.id}`
        }
      ]
    };
  }

  async handleEnableStaticNat(args: any) {
    const result = await this.cloudStackClient.enableStaticNat(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Enabled static NAT for IP ${args.ipaddressid} to VM ${args.virtualmachineid}. Success: ${result.enablestaticnatresponse?.success}`
        }
      ]
    };
  }

  async handleCreateFirewallRule(args: any) {
    const result = await this.cloudStackClient.createFirewallRule(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created firewall rule. Job ID: ${result.createfirewallruleresponse?.jobid}\nRule ID: ${result.createfirewallruleresponse?.id}`
        }
      ]
    };
  }

  async handleListLoadBalancerRules(args: any) {
    const result = await this.cloudStackClient.listLoadBalancerRules(args);
    const rules = result.listloadbalancerrulesresponse?.loadbalancerrule || [];
    
    const ruleList = rules.map((rule: any) => ({
      id: rule.id,
      name: rule.name,
      algorithm: rule.algorithm,
      state: rule.state,
      publicip: rule.publicip,
      publicport: rule.publicport,
      privateport: rule.privateport,
      description: rule.description
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ruleList.length} load balancer rules:\n\n${ruleList
            .map((rule: any) => 
              `• ${rule.name} (${rule.id})\n  Public IP: ${rule.publicip}:${rule.publicport}\n  Private Port: ${rule.privateport}\n  Algorithm: ${rule.algorithm}\n  State: ${rule.state}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}