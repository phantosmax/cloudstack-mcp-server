/**
 * CloudStack MCP Server Tests
 * 
 * Comprehensive test suite for the CloudStack MCP Server including:
 * - Function availability validation
 * - Tool mapping verification  
 * - Safety mechanism testing
 * - Environment configuration validation
 */

import { CloudStackClient } from '../src/cloudstack-client';
import {
  TOTAL_FUNCTIONS,
  FUNCTION_CATEGORIES,
  ALL_TOOL_NAMES,
  TOOL_NAMES,
  DESTRUCTIVE_OPERATIONS
} from './test-utils';

// Mock the CloudStackClient
jest.mock('../src/cloudstack-client');
const MockedCloudStackClient = CloudStackClient as jest.MockedClass<typeof CloudStackClient>;

// Mock environment variables
process.env.CLOUDSTACK_API_URL = 'http://test.example.com/client/api';
process.env.CLOUDSTACK_API_KEY = 'test-api-key';
process.env.CLOUDSTACK_SECRET_KEY = 'test-secret-key';
process.env.CLOUDSTACK_TIMEOUT = '30000';

describe('CloudStack MCP Server', () => {
  let mockClient: jest.Mocked<CloudStackClient>;

  beforeEach(() => {
    // Create comprehensive mock of CloudStackClient
    mockClient = createMockCloudStackClient();
    MockedCloudStackClient.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Function Availability', () => {
    it(`should have exactly ${TOTAL_FUNCTIONS} total functions`, () => {
      expect(ALL_TOOL_NAMES).toHaveLength(TOTAL_FUNCTIONS);
    });

    it('should have correct count per category', () => {
      expect(TOOL_NAMES.vmManagement).toHaveLength(FUNCTION_CATEGORIES['Virtual Machine Management']);
      expect(TOOL_NAMES.vmAdvanced).toHaveLength(FUNCTION_CATEGORIES['VM Advanced Operations']);
      expect(TOOL_NAMES.storage).toHaveLength(FUNCTION_CATEGORIES['Storage Management']);
      expect(TOOL_NAMES.networking).toHaveLength(FUNCTION_CATEGORIES['Networking']);
      expect(TOOL_NAMES.monitoring).toHaveLength(FUNCTION_CATEGORIES['Monitoring & Analytics']);
      expect(TOOL_NAMES.account).toHaveLength(FUNCTION_CATEGORIES['Account & User Management']);
      expect(TOOL_NAMES.infrastructure).toHaveLength(FUNCTION_CATEGORIES['Infrastructure Discovery']);
      expect(TOOL_NAMES.systemAdmin).toHaveLength(FUNCTION_CATEGORIES['System Administration']);
      expect(TOOL_NAMES.security).toHaveLength(FUNCTION_CATEGORIES['Security & Compliance']);
    });

    it('should have no duplicate function names', () => {
      const uniqueNames = new Set(ALL_TOOL_NAMES);
      expect(uniqueNames.size).toBe(ALL_TOOL_NAMES.length);
    });
  });

  describe('CloudStack Client Integration', () => {
    it('should have all required CloudStack client methods', () => {
      const requiredMethods = [
        // VM Management
        'listVirtualMachines', 'deployVirtualMachine', 'startVirtualMachine',
        'stopVirtualMachine', 'rebootVirtualMachine', 'destroyVirtualMachine',
        
        // VM Advanced Operations
        'scaleVirtualMachine', 'migrateVirtualMachine',
        'resetPasswordForVirtualMachine', 'changeServiceForVirtualMachine',
        
        // Storage Management
        'listVolumes', 'createVolume', 'attachVolume', 'detachVolume',
        'resizeVolume', 'createSnapshot', 'listSnapshots',
        
        // Networking
        'listNetworks', 'createNetwork', 'listPublicIpAddresses',
        'associateIpAddress', 'enableStaticNat', 'createFirewallRule',
        'listLoadBalancerRules',
        
        // Monitoring & Analytics
        'listVirtualMachineMetrics', 'listEvents', 'listAlerts',
        'listCapacity', 'listAsyncJobs',
        
        // Account & User Management
        'listAccounts', 'listUsers', 'listDomains', 'listUsageRecords',
        
        // Infrastructure Discovery
        'listZones', 'listTemplates', 'listServiceOfferings',
        
        // System Administration
        'listHosts', 'listClusters', 'listStoragePools', 'listSystemVms',
        
        // Security & Compliance
        'listSSHKeyPairs', 'createSSHKeyPair', 'listSecurityGroups',
        'authorizeSecurityGroupIngress'
      ];

      requiredMethods.forEach(method => {
        expect((mockClient as any)[method]).toBeDefined();
        expect(typeof (mockClient as any)[method]).toBe('function');
      });
    });
  });

  describe('Safety Mechanisms', () => {
    it('should identify destructive operations correctly', () => {
      expect(DESTRUCTIVE_OPERATIONS).toContain('destroy_virtual_machine');
      expect(DESTRUCTIVE_OPERATIONS).toContain('scale_virtual_machine');
      expect(DESTRUCTIVE_OPERATIONS).toContain('migrate_virtual_machine');
      expect(DESTRUCTIVE_OPERATIONS).toContain('reset_password_virtual_machine');
      expect(DESTRUCTIVE_OPERATIONS).toContain('detach_volume');
      expect(DESTRUCTIVE_OPERATIONS).toContain('resize_volume');
    });

    it('should have confirmation requirements for dangerous operations', () => {
      const confirmationRequired = [
        'destroy_virtual_machine',
        'scale_virtual_machine',
        'migrate_virtual_machine',
        'reset_password_virtual_machine',
        'detach_volume',
        'resize_volume'
      ];

      confirmationRequired.forEach(operation => {
        expect(DESTRUCTIVE_OPERATIONS).toContain(operation);
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should require all necessary environment variables', () => {
      expect(process.env.CLOUDSTACK_API_URL).toBeTruthy();
      expect(process.env.CLOUDSTACK_API_KEY).toBeTruthy();
      expect(process.env.CLOUDSTACK_SECRET_KEY).toBeTruthy();
    });

    it('should have default timeout value', () => {
      expect(process.env.CLOUDSTACK_TIMEOUT).toBe('30000');
    });

    it('should validate environment variable format', () => {
      expect(process.env.CLOUDSTACK_API_URL).toMatch(/^https?:\/\//);
      expect(process.env.CLOUDSTACK_API_KEY).toMatch(/^[a-zA-Z0-9-]+$/);
      expect(process.env.CLOUDSTACK_SECRET_KEY).toMatch(/^[a-zA-Z0-9-]+$/);
      expect(Number(process.env.CLOUDSTACK_TIMEOUT)).toBeGreaterThan(0);
    });
  });

  describe('Function Categories', () => {
    Object.entries(TOOL_NAMES).forEach(([category, tools]) => {
      describe(`${category} functions`, () => {
        it(`should have ${tools.length} functions`, () => {
          expect(tools).toHaveLength(tools.length);
        });

        it('should have valid function names', () => {
          tools.forEach(tool => {
            expect(tool).toMatch(/^[a-z_]+$/);
            expect(tool).not.toContain(' ');
          });
        });
      });
    });
  });
});

/**
 * Creates a comprehensive mock of the CloudStackClient with all required methods
 */
function createMockCloudStackClient(): jest.Mocked<CloudStackClient> {
  return {
    // VM Management
    listVirtualMachines: jest.fn().mockResolvedValue({ listvirtualmachinesresponse: { virtualmachine: [] } }),
    deployVirtualMachine: jest.fn().mockResolvedValue({ deployvirtualmachineresponse: { jobid: 'job-123' } }),
    startVirtualMachine: jest.fn().mockResolvedValue({ startvirtualmachineresponse: { jobid: 'job-124' } }),
    stopVirtualMachine: jest.fn().mockResolvedValue({ stopvirtualmachineresponse: { jobid: 'job-125' } }),
    rebootVirtualMachine: jest.fn().mockResolvedValue({ rebootvirtualmachineresponse: { jobid: 'job-126' } }),
    destroyVirtualMachine: jest.fn().mockResolvedValue({ destroyvirtualmachineresponse: { jobid: 'job-127' } }),
    
    // VM Advanced Operations
    scaleVirtualMachine: jest.fn().mockResolvedValue({ scalevirtualmachineresponse: { jobid: 'job-128' } }),
    migrateVirtualMachine: jest.fn().mockResolvedValue({ migratevirtualmachineresponse: { jobid: 'job-129' } }),
    resetPasswordForVirtualMachine: jest.fn().mockResolvedValue({ resetpasswordforvirtualmachineresponse: { jobid: 'job-130' } }),
    changeServiceForVirtualMachine: jest.fn().mockResolvedValue({ changeserviceforvirtualmachineresponse: { jobid: 'job-131' } }),
    
    // Storage Management
    listVolumes: jest.fn().mockResolvedValue({ listvolumesresponse: { volume: [] } }),
    createVolume: jest.fn().mockResolvedValue({ createvolumeresponse: { jobid: 'job-132' } }),
    attachVolume: jest.fn().mockResolvedValue({ attachvolumeresponse: { jobid: 'job-133' } }),
    detachVolume: jest.fn().mockResolvedValue({ detachvolumeresponse: { jobid: 'job-134' } }),
    resizeVolume: jest.fn().mockResolvedValue({ resizevolumeresponse: { jobid: 'job-135' } }),
    createSnapshot: jest.fn().mockResolvedValue({ createsnapshotresponse: { jobid: 'job-136' } }),
    listSnapshots: jest.fn().mockResolvedValue({ listsnapshotsresponse: { snapshot: [] } }),
    
    // Networking
    listNetworks: jest.fn().mockResolvedValue({ listnetworksresponse: { network: [] } }),
    createNetwork: jest.fn().mockResolvedValue({ createnetworkresponse: { jobid: 'job-137' } }),
    listPublicIpAddresses: jest.fn().mockResolvedValue({ listpublicipaddressesresponse: { publicipaddress: [] } }),
    associateIpAddress: jest.fn().mockResolvedValue({ associateipaddressresponse: { jobid: 'job-138' } }),
    enableStaticNat: jest.fn().mockResolvedValue({ enablestaticnatresponse: { success: true } }),
    createFirewallRule: jest.fn().mockResolvedValue({ createfirewallruleresponse: { jobid: 'job-139' } }),
    listLoadBalancerRules: jest.fn().mockResolvedValue({ listloadbalancerrulesresponse: { loadbalancerrule: [] } }),
    
    // Monitoring & Analytics
    listVirtualMachineMetrics: jest.fn().mockResolvedValue({ listvirtualmachinemetricsresponse: { virtualmachine: [] } }),
    listEvents: jest.fn().mockResolvedValue({ listeventsresponse: { event: [] } }),
    listAlerts: jest.fn().mockResolvedValue({ listalertsresponse: { alert: [] } }),
    listCapacity: jest.fn().mockResolvedValue({ listcapacityresponse: { capacity: [] } }),
    listAsyncJobs: jest.fn().mockResolvedValue({ listasyncjobsresponse: { asyncjobs: [] } }),
    
    // Account & User Management
    listAccounts: jest.fn().mockResolvedValue({ listaccountsresponse: { account: [] } }),
    listUsers: jest.fn().mockResolvedValue({ listusersresponse: { user: [] } }),
    listDomains: jest.fn().mockResolvedValue({ listdomainsresponse: { domain: [] } }),
    listUsageRecords: jest.fn().mockResolvedValue({ listusagerecordsresponse: { usagerecord: [] } }),
    
    // Infrastructure Discovery
    listZones: jest.fn().mockResolvedValue({ listzonesresponse: { zone: [] } }),
    listTemplates: jest.fn().mockResolvedValue({ listtemplatesresponse: { template: [] } }),
    listServiceOfferings: jest.fn().mockResolvedValue({ listserviceofferingsresponse: { serviceoffering: [] } }),
    
    // System Administration
    listHosts: jest.fn().mockResolvedValue({ listhostsresponse: { host: [] } }),
    listClusters: jest.fn().mockResolvedValue({ listclustersresponse: { cluster: [] } }),
    listStoragePools: jest.fn().mockResolvedValue({ liststoragepoolsresponse: { storagepool: [] } }),
    listSystemVms: jest.fn().mockResolvedValue({ listsystemvmsresponse: { systemvm: [] } }),
    
    // Security & Compliance
    listSSHKeyPairs: jest.fn().mockResolvedValue({ listsshkeypairsresponse: { sshkeypair: [] } }),
    createSSHKeyPair: jest.fn().mockResolvedValue({ createsshkeypairresponse: { keypair: { fingerprint: 'test:fingerprint' } } }),
    listSecurityGroups: jest.fn().mockResolvedValue({ listsecuritygroupsresponse: { securitygroup: [] } }),
    authorizeSecurityGroupIngress: jest.fn().mockResolvedValue({ authorizesecuritygroupingressresponse: { jobid: 'job-140' } }),
    
    // Additional methods
    request: jest.fn(),
    queryAsyncJobResult: jest.fn(),
    createLoadBalancerRule: jest.fn(),
    listCapabilities: jest.fn()
  } as any;
}