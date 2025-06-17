import { CloudStackClient } from '../cloudstack-client.js';

export class AccountHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListAccounts(args: any) {
    const result = await this.cloudStackClient.listAccounts(args);
    const accounts = result.listaccountsresponse?.account || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${accounts.length} accounts:\n\n${accounts
            .map(
              (account: Record<string, any>) =>
                `• ${account.name} (${account.id})\n  Type: ${account.accounttype}\n  Domain: ${account.domain}\n  State: ${account.state}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListUsers(args: any) {
    const result = await this.cloudStackClient.listUsers(args);
    const users = result.listusersresponse?.user || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${users.length} users:\n\n${users
            .map(
              (user: Record<string, any>) =>
                `• ${user.username} (${user.id})\n  Account: ${user.account}\n  State: ${user.state}\n  Created: ${user.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListDomains(args: any) {
    const result = await this.cloudStackClient.listDomains(args);
    const domains = result.listdomainsresponse?.domain || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${domains.length} domains:\n\n${domains
            .map(
              (domain: Record<string, any>) =>
                `• ${domain.name} (${domain.id})\n  Path: ${domain.path}\n  Level: ${domain.level}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleListUsageRecords(args: any) {
    const result = await this.cloudStackClient.listUsageRecords(args);
    const records = result.listusagerecordsresponse?.usagerecord || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${records.length} usage records:\n\n${records
            .map(
              (record: Record<string, any>) =>
                `• ${record.description}\n  Usage: ${record.usage}\n  Start: ${record.startdate}\n  End: ${record.enddate}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }
}