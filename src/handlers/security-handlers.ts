import { CloudStackClient } from '../cloudstack-client.js';

export class SecurityHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListSSHKeyPairs(args: any) {
    const result = await this.cloudStackClient.listSSHKeyPairs(args);
    const keypairs = result.listsshkeypairsresponse?.sshkeypair || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${keypairs.length} SSH key pairs:\n\n${keypairs
            .map(
              (kp: Record<string, any>) =>
                `• ${kp.name}\n  Fingerprint: ${kp.fingerprint}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleCreateSSHKeyPair(args: any) {
    const result = await this.cloudStackClient.createSSHKeyPair(args);
    return {
      content: [
        {
          type: 'text',
          text: `SSH key pair '${args.name}' created successfully.\nFingerprint: ${result.createsshkeypairresponse?.keypair?.fingerprint}`,
        },
      ],
    };
  }

  async handleListSecurityGroups(args: any) {
    const result = await this.cloudStackClient.listSecurityGroups(args);
    const groups = result.listsecuritygroupsresponse?.securitygroup || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${groups.length} security groups:\n\n${groups
            .map(
              (sg: Record<string, any>) =>
                `• ${sg.name} (${sg.id})\n  Description: ${sg.description}\n  Rules: ${sg.ingressrule?.length || 0} ingress, ${sg.egressrule?.length || 0} egress\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleCreateSecurityGroupRule(args: any) {
    const result = await this.cloudStackClient.authorizeSecurityGroupIngress(args);
    return {
      content: [
        {
          type: 'text',
          text: `Security group rule creation initiated. Job ID: ${result.authorizesecuritygroupingressresponse?.jobid}`,
        },
      ],
    };
  }
}