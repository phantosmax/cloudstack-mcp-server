import { CloudStackClient } from '../cloudstack-client.js';

export class SecurityHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListSSHKeyPairs(args: any) {
    const result = await this.cloudStackClient.listSSHKeyPairs(args);
    const keyPairs = result.listsshkeypairsresponse?.sshkeypair || [];
    
    const keyPairList = keyPairs.map((keyPair: any) => ({
      name: keyPair.name,
      fingerprint: keyPair.fingerprint,
      account: keyPair.account,
      domain: keyPair.domain
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${keyPairList.length} SSH key pairs:\n\n${keyPairList
            .map((keyPair: any) => 
              `• ${keyPair.name}\n  Fingerprint: ${keyPair.fingerprint}\n  Account: ${keyPair.account}\n  Domain: ${keyPair.domain}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleCreateSSHKeyPair(args: any) {
    const result = await this.cloudStackClient.createSSHKeyPair({ name: args.name });
    
    return {
      content: [
        {
          type: 'text',
          text: `Created SSH key pair: ${args.name}\nFingerprint: ${result.createsshkeypairresponse?.fingerprint}\nPrivate Key:\n${result.createsshkeypairresponse?.privatekey}`
        }
      ]
    };
  }

  async handleListSecurityGroups(args: any) {
    const result = await this.cloudStackClient.listSecurityGroups(args);
    const securityGroups = result.listsecuritygroupsresponse?.securitygroup || [];
    
    const securityGroupList = securityGroups.map((sg: any) => ({
      id: sg.id,
      name: sg.name,
      description: sg.description,
      account: sg.account,
      domain: sg.domain,
      ingressrule: sg.ingressrule || [],
      egressrule: sg.egressrule || []
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${securityGroupList.length} security groups:\n\n${securityGroupList
            .map((sg: any) => 
              `• ${sg.name} (${sg.id})\n  Description: ${sg.description}\n  Account: ${sg.account}\n  Domain: ${sg.domain}\n  Ingress Rules: ${sg.ingressrule.length}\n  Egress Rules: ${sg.egressrule.length}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleCreateSecurityGroupRule(args: any) {
    const result = await this.cloudStackClient.authorizeSecurityGroupIngress(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created security group rule. Job ID: ${result.authorizesecuritygroupingressresponse?.jobid}\nRule ID: ${result.authorizesecuritygroupingressresponse?.id}`
        }
      ]
    };
  }
}