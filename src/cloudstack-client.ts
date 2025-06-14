import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createHmac } from 'crypto';

export interface CloudStackConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  timeout?: number;
}

export interface CloudStackParams {
  [key: string]: string | number | boolean | undefined;
}

export interface CloudStackResponse {
  [key: string]: any;
}

export class CloudStackClient {
  private apiUrl: string;
  private apiKey: string;
  private secretKey: string;
  private timeout: number;
  private axios: AxiosInstance;

  constructor(config: CloudStackConfig) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.timeout = config.timeout || 30000;

    this.axios = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generateSignature(command: string, params: CloudStackParams): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: CloudStackParams, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const signature = createHmac('sha1', this.secretKey)
      .update(queryString.toLowerCase())
      .digest('base64');

    return signature;
  }

  async request(command: string, params: CloudStackParams = {}): Promise<CloudStackResponse> {
    try {
      const timestamp = Date.now();
      const requestParams: CloudStackParams = {
        ...params,
        command,
        apiKey: this.apiKey,
        response: 'json',
        _: timestamp,
      };

      const signature = this.generateSignature(command, requestParams);
      requestParams.signature = signature;

      const response: AxiosResponse<CloudStackResponse> = await this.axios.get(this.apiUrl, {
        params: requestParams,
      });

      if (response.data.errortext) {
        throw new Error(`CloudStack API Error: ${response.data.errortext}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errortext || error.message;
        throw new Error(`CloudStack API request failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  // Virtual Machine operations
  async listVirtualMachines(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listVirtualMachines', params);
  }

  async deployVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('deployVirtualMachine', params);
  }

  async startVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('startVirtualMachine', params);
  }

  async stopVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('stopVirtualMachine', params);
  }

  async rebootVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('rebootVirtualMachine', params);
  }

  async destroyVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('destroyVirtualMachine', params);
  }

  // Zone operations
  async listZones(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listZones', params);
  }

  // Template operations
  async listTemplates(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    const defaultParams = { templatefilter: 'featured', ...params };
    return this.request('listTemplates', defaultParams);
  }

  // Service offering operations
  async listServiceOfferings(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listServiceOfferings', params);
  }

  // Network operations
  async listNetworks(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listNetworks', params);
  }

  // Job operations
  async queryAsyncJobResult(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('queryAsyncJobResult', params);
  }

  // VM Advanced operations
  async scaleVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('scaleVirtualMachine', params);
  }

  async migrateVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('migrateVirtualMachine', params);
  }

  async resetPasswordForVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('resetPasswordForVirtualMachine', params);
  }

  async changeServiceForVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('changeServiceForVirtualMachine', params);
  }

  // Storage operations
  async listVolumes(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listVolumes', params);
  }

  async createVolume(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createVolume', params);
  }

  async attachVolume(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('attachVolume', params);
  }

  async detachVolume(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('detachVolume', params);
  }

  async resizeVolume(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('resizeVolume', params);
  }

  async createSnapshot(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createSnapshot', params);
  }

  async listSnapshots(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listSnapshots', params);
  }

  // Network operations (extended)
  async createNetwork(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createNetwork', params);
  }

  async listPublicIpAddresses(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listPublicIpAddresses', params);
  }

  async associateIpAddress(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('associateIpAddress', params);
  }

  async enableStaticNat(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('enableStaticNat', params);
  }

  async createFirewallRule(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createFirewallRule', params);
  }

  async listLoadBalancerRules(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listLoadBalancerRules', params);
  }

  async createLoadBalancerRule(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createLoadBalancerRule', params);
  }

  // Monitoring operations
  async listVirtualMachineMetrics(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listVirtualMachineMetrics', params);
  }

  async listEvents(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listEvents', params);
  }

  async listAlerts(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listAlerts', params);
  }

  async listCapacity(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listCapacity', params);
  }

  async listAsyncJobs(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listAsyncJobs', params);
  }

  // Account and User Management
  async listAccounts(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listAccounts', params);
  }

  async listUsers(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listUsers', params);
  }

  async listDomains(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listDomains', params);
  }

  async listUsageRecords(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('listUsageRecords', params);
  }

  // System Administration
  async listHosts(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listHosts', params);
  }

  async listClusters(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listClusters', params);
  }

  async listStoragePools(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listStoragePools', params);
  }

  async listSystemVms(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listSystemVms', params);
  }

  // Security operations
  async listSSHKeyPairs(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listSSHKeyPairs', params);
  }

  async createSSHKeyPair(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('createSSHKeyPair', params);
  }

  async listSecurityGroups(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listSecurityGroups', params);
  }

  async authorizeSecurityGroupIngress(params: CloudStackParams): Promise<CloudStackResponse> {
    return this.request('authorizeSecurityGroupIngress', params);
  }

  // System operations
  async listCapabilities(params: CloudStackParams = {}): Promise<CloudStackResponse> {
    return this.request('listCapabilities', params);
  }
}