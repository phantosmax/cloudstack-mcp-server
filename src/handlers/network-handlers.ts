import { CloudStackClient } from '../cloudstack-client.js';

export class NetworkHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListNetworks(args: any) {
    const result = await this.cloudStackClient.listNetworks(args);
    const networks = result.listnetworksresponse?.network || [];
    
    const networkList = networks.map((network: Record<string, any>) => ({
      id: network.id,
      name: network.name,
      displaytext: network.displaytext,
      type: network.type,
      zonename: network.zonename,
      state: network.state,
      cidr: network.cidr,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${networkList.length} networks:\n\n${networkList
            .map(
              (network: Record<string, any>) =>
                `• ${network.name} (${network.id})\n  Type: ${network.type}\n  CIDR: ${network.cidr}\n  Zone: ${network.zonename}\n  State: ${network.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleCreateNetwork(args: any) {
    const result = await this.cloudStackClient.createNetwork(args);
    return {
      content: [
        {
          type: 'text',
          text: `Network creation initiated. Job ID: ${result.createnetworkresponse?.jobid}`,
        },
      ],
    };
  }

  async handleListPublicIpAddresses(args: any) {
    const result = await this.cloudStackClient.listPublicIpAddresses(args);
    const ips = result.listpublicipaddressesresponse?.publicipaddress || [];
    
    const ipList = ips.map((ip: Record<string, any>) => ({
      id: ip.id,
      ipaddress: ip.ipaddress,
      zonename: ip.zonename,
      state: ip.state,
      isstaticnat: ip.isstaticnat,
      associatednetworkname: ip.associatednetworkname,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ipList.length} public IP addresses:\n\n${ipList
            .map(
              (ip: Record<string, any>) =>
                `• ${ip.ipaddress} (${ip.id})\n  Zone: ${ip.zonename}\n  State: ${ip.state}\n  Static NAT: ${ip.isstaticnat ? 'Yes' : 'No'}\n  Network: ${ip.associatednetworkname || 'None'}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleAssociateIpAddress(args: any) {
    const result = await this.cloudStackClient.associateIpAddress(args);
    return {
      content: [
        {
          type: 'text',
          text: `IP address association initiated. Job ID: ${result.associateipaddressresponse?.jobid}`,
        },
      ],
    };
  }

  async handleEnableStaticNat(args: any) {
    const result = await this.cloudStackClient.enableStaticNat(args);
    return {
      content: [
        {
          type: 'text',
          text: `Static NAT enabled for IP ${args.ipaddressid} to VM ${args.virtualmachineid}. Success: ${result.enablestaticnatresponse?.success}`,
        },
      ],
    };
  }

  async handleCreateFirewallRule(args: any) {
    const result = await this.cloudStackClient.createFirewallRule(args);
    return {
      content: [
        {
          type: 'text',
          text: `Firewall rule creation initiated. Job ID: ${result.createfirewallruleresponse?.jobid}`,
        },
      ],
    };
  }

  async handleListLoadBalancerRules(args: any) {
    const result = await this.cloudStackClient.listLoadBalancerRules(args);
    const rules = result.listloadbalancerrulesresponse?.loadbalancerrule || [];
    
    const ruleList = rules.map((rule: Record<string, any>) => ({
      id: rule.id,
      name: rule.name,
      publicip: rule.publicip,
      publicport: rule.publicport,
      privateport: rule.privateport,
      algorithm: rule.algorithm,
      state: rule.state,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${ruleList.length} load balancer rules:\n\n${ruleList
            .map(
              (rule: Record<string, any>) =>
                `• ${rule.name} (${rule.id})\n  Public IP: ${rule.publicip}:${rule.publicport}\n  Private Port: ${rule.privateport}\n  Algorithm: ${rule.algorithm}\n  State: ${rule.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }
}