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
export declare class CloudStackClient {
    private apiUrl;
    private apiKey;
    private secretKey;
    private timeout;
    private axios;
    constructor(config: CloudStackConfig);
    private generateSignature;
    request(command: string, params?: CloudStackParams): Promise<CloudStackResponse>;
    listVirtualMachines(params?: CloudStackParams): Promise<CloudStackResponse>;
    deployVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    startVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    stopVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    rebootVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    destroyVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    listZones(params?: CloudStackParams): Promise<CloudStackResponse>;
    listTemplates(params?: CloudStackParams): Promise<CloudStackResponse>;
    listServiceOfferings(params?: CloudStackParams): Promise<CloudStackResponse>;
    listNetworks(params?: CloudStackParams): Promise<CloudStackResponse>;
    queryAsyncJobResult(params: CloudStackParams): Promise<CloudStackResponse>;
    scaleVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    migrateVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    resetPasswordForVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    changeServiceForVirtualMachine(params: CloudStackParams): Promise<CloudStackResponse>;
    listVolumes(params?: CloudStackParams): Promise<CloudStackResponse>;
    createVolume(params: CloudStackParams): Promise<CloudStackResponse>;
    attachVolume(params: CloudStackParams): Promise<CloudStackResponse>;
    detachVolume(params: CloudStackParams): Promise<CloudStackResponse>;
    resizeVolume(params: CloudStackParams): Promise<CloudStackResponse>;
    createSnapshot(params: CloudStackParams): Promise<CloudStackResponse>;
    listSnapshots(params?: CloudStackParams): Promise<CloudStackResponse>;
    createNetwork(params: CloudStackParams): Promise<CloudStackResponse>;
    listPublicIpAddresses(params?: CloudStackParams): Promise<CloudStackResponse>;
    associateIpAddress(params: CloudStackParams): Promise<CloudStackResponse>;
    enableStaticNat(params: CloudStackParams): Promise<CloudStackResponse>;
    createFirewallRule(params: CloudStackParams): Promise<CloudStackResponse>;
    listLoadBalancerRules(params?: CloudStackParams): Promise<CloudStackResponse>;
    createLoadBalancerRule(params: CloudStackParams): Promise<CloudStackResponse>;
    listVirtualMachineMetrics(params?: CloudStackParams): Promise<CloudStackResponse>;
    listEvents(params?: CloudStackParams): Promise<CloudStackResponse>;
    listAlerts(params?: CloudStackParams): Promise<CloudStackResponse>;
    listCapacity(params?: CloudStackParams): Promise<CloudStackResponse>;
    listAsyncJobs(params?: CloudStackParams): Promise<CloudStackResponse>;
    listAccounts(params?: CloudStackParams): Promise<CloudStackResponse>;
    listUsers(params?: CloudStackParams): Promise<CloudStackResponse>;
    listDomains(params?: CloudStackParams): Promise<CloudStackResponse>;
    listUsageRecords(params: CloudStackParams): Promise<CloudStackResponse>;
    listHosts(params?: CloudStackParams): Promise<CloudStackResponse>;
    listClusters(params?: CloudStackParams): Promise<CloudStackResponse>;
    listStoragePools(params?: CloudStackParams): Promise<CloudStackResponse>;
    listSystemVms(params?: CloudStackParams): Promise<CloudStackResponse>;
    listSSHKeyPairs(params?: CloudStackParams): Promise<CloudStackResponse>;
    createSSHKeyPair(params: CloudStackParams): Promise<CloudStackResponse>;
    listSecurityGroups(params?: CloudStackParams): Promise<CloudStackResponse>;
    authorizeSecurityGroupIngress(params: CloudStackParams): Promise<CloudStackResponse>;
    listCapabilities(params?: CloudStackParams): Promise<CloudStackResponse>;
}
//# sourceMappingURL=cloudstack-client.d.ts.map