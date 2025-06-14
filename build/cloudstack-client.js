import axios from 'axios';
import { createHmac } from 'crypto';
export class CloudStackClient {
    apiUrl;
    apiKey;
    secretKey;
    timeout;
    axios;
    constructor(config) {
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
    generateSignature(command, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
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
    async request(command, params = {}) {
        try {
            const timestamp = Date.now();
            const requestParams = {
                ...params,
                command,
                apiKey: this.apiKey,
                response: 'json',
                _: timestamp,
            };
            const signature = this.generateSignature(command, requestParams);
            requestParams.signature = signature;
            const response = await this.axios.get(this.apiUrl, {
                params: requestParams,
            });
            if (response.data.errortext) {
                throw new Error(`CloudStack API Error: ${response.data.errortext}`);
            }
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.errortext || error.message;
                throw new Error(`CloudStack API request failed: ${errorMessage}`);
            }
            throw error;
        }
    }
    // Virtual Machine operations
    async listVirtualMachines(params = {}) {
        return this.request('listVirtualMachines', params);
    }
    async deployVirtualMachine(params) {
        return this.request('deployVirtualMachine', params);
    }
    async startVirtualMachine(params) {
        return this.request('startVirtualMachine', params);
    }
    async stopVirtualMachine(params) {
        return this.request('stopVirtualMachine', params);
    }
    async rebootVirtualMachine(params) {
        return this.request('rebootVirtualMachine', params);
    }
    async destroyVirtualMachine(params) {
        return this.request('destroyVirtualMachine', params);
    }
    // Zone operations
    async listZones(params = {}) {
        return this.request('listZones', params);
    }
    // Template operations
    async listTemplates(params = {}) {
        const defaultParams = { templatefilter: 'featured', ...params };
        return this.request('listTemplates', defaultParams);
    }
    // Service offering operations
    async listServiceOfferings(params = {}) {
        return this.request('listServiceOfferings', params);
    }
    // Network operations
    async listNetworks(params = {}) {
        return this.request('listNetworks', params);
    }
    // Job operations
    async queryAsyncJobResult(params) {
        return this.request('queryAsyncJobResult', params);
    }
    // VM Advanced operations
    async scaleVirtualMachine(params) {
        return this.request('scaleVirtualMachine', params);
    }
    async migrateVirtualMachine(params) {
        return this.request('migrateVirtualMachine', params);
    }
    async resetPasswordForVirtualMachine(params) {
        return this.request('resetPasswordForVirtualMachine', params);
    }
    async changeServiceForVirtualMachine(params) {
        return this.request('changeServiceForVirtualMachine', params);
    }
    // Storage operations
    async listVolumes(params = {}) {
        return this.request('listVolumes', params);
    }
    async createVolume(params) {
        return this.request('createVolume', params);
    }
    async attachVolume(params) {
        return this.request('attachVolume', params);
    }
    async detachVolume(params) {
        return this.request('detachVolume', params);
    }
    async resizeVolume(params) {
        return this.request('resizeVolume', params);
    }
    async createSnapshot(params) {
        return this.request('createSnapshot', params);
    }
    async listSnapshots(params = {}) {
        return this.request('listSnapshots', params);
    }
    // Network operations (extended)
    async createNetwork(params) {
        return this.request('createNetwork', params);
    }
    async listPublicIpAddresses(params = {}) {
        return this.request('listPublicIpAddresses', params);
    }
    async associateIpAddress(params) {
        return this.request('associateIpAddress', params);
    }
    async enableStaticNat(params) {
        return this.request('enableStaticNat', params);
    }
    async createFirewallRule(params) {
        return this.request('createFirewallRule', params);
    }
    async listLoadBalancerRules(params = {}) {
        return this.request('listLoadBalancerRules', params);
    }
    async createLoadBalancerRule(params) {
        return this.request('createLoadBalancerRule', params);
    }
    // Monitoring operations
    async listVirtualMachineMetrics(params = {}) {
        return this.request('listVirtualMachineMetrics', params);
    }
    async listEvents(params = {}) {
        return this.request('listEvents', params);
    }
    async listAlerts(params = {}) {
        return this.request('listAlerts', params);
    }
    async listCapacity(params = {}) {
        return this.request('listCapacity', params);
    }
    async listAsyncJobs(params = {}) {
        return this.request('listAsyncJobs', params);
    }
    // Account and User Management
    async listAccounts(params = {}) {
        return this.request('listAccounts', params);
    }
    async listUsers(params = {}) {
        return this.request('listUsers', params);
    }
    async listDomains(params = {}) {
        return this.request('listDomains', params);
    }
    async listUsageRecords(params) {
        return this.request('listUsageRecords', params);
    }
    // System Administration
    async listHosts(params = {}) {
        return this.request('listHosts', params);
    }
    async listClusters(params = {}) {
        return this.request('listClusters', params);
    }
    async listStoragePools(params = {}) {
        return this.request('listStoragePools', params);
    }
    async listSystemVms(params = {}) {
        return this.request('listSystemVms', params);
    }
    // Security operations
    async listSSHKeyPairs(params = {}) {
        return this.request('listSSHKeyPairs', params);
    }
    async createSSHKeyPair(params) {
        return this.request('createSSHKeyPair', params);
    }
    async listSecurityGroups(params = {}) {
        return this.request('listSecurityGroups', params);
    }
    async authorizeSecurityGroupIngress(params) {
        return this.request('authorizeSecurityGroupIngress', params);
    }
    // System operations
    async listCapabilities(params = {}) {
        return this.request('listCapabilities', params);
    }
}
//# sourceMappingURL=cloudstack-client.js.map