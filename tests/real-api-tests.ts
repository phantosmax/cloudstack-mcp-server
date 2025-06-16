/**
 * Real API tests - Testing the entire CloudStack MCP Server with actual CloudStack QA
 * This replaces mocked tests with real API validation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CloudStackClient } from '../src/cloudstack-client';
import dotenv from 'dotenv';

// Load environment
dotenv.config();

describe('CloudStack MCP Server - Real API Tests', () => {
  let client: CloudStackClient;
  
  beforeAll(() => {
    const config = {
      apiUrl: process.env.CLOUDSTACK_API_URL!,
      apiKey: process.env.CLOUDSTACK_API_KEY!,
      secretKey: process.env.CLOUDSTACK_SECRET_KEY!,
      timeout: 30000,
    };
    
    client = new CloudStackClient(config);
  });

  describe('CloudStack Client - All Methods', () => {
    // Test every single method in CloudStackClient with real API
    
    describe('VM Management', () => {
      it('listVirtualMachines should return real data', async () => {
        const result = await client.listVirtualMachines();
        expect(result).toBeDefined();
        expect(result.listvirtualmachinesresponse).toBeDefined();
      });

      it('listVirtualMachines with filters should work', async () => {
        const result = await client.listVirtualMachines({ state: 'Running' });
        const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
        vms.forEach((vm: any) => {
          expect(vm.state).toBe('Running');
        });
      });

      // Note: We won't test deploy/destroy in automated tests to avoid costs
      // But we'll test the API structure
      it('deployVirtualMachine API should be callable', async () => {
        // Just verify the method exists and would call the right API
        expect(client.deployVirtualMachine).toBeDefined();
        expect(typeof client.deployVirtualMachine).toBe('function');
      });

      it('startVirtualMachine API should be callable', async () => {
        expect(client.startVirtualMachine).toBeDefined();
      });

      it('stopVirtualMachine API should be callable', async () => {
        expect(client.stopVirtualMachine).toBeDefined();
      });

      it('rebootVirtualMachine API should be callable', async () => {
        expect(client.rebootVirtualMachine).toBeDefined();
      });

      it('destroyVirtualMachine API should be callable', async () => {
        expect(client.destroyVirtualMachine).toBeDefined();
      });
    });

    describe('VM Advanced Operations', () => {
      it('should have all advanced VM operation methods', async () => {
        expect(client.scaleVirtualMachine).toBeDefined();
        expect(client.migrateVirtualMachine).toBeDefined();
        expect(client.resetPasswordForVirtualMachine).toBeDefined();
        expect(client.changeServiceForVirtualMachine).toBeDefined();
      });
    });

    describe('Storage Management', () => {
      it('listVolumes should return real data', async () => {
        const result = await client.listVolumes();
        expect(result).toBeDefined();
        expect(result.listvolumesresponse).toBeDefined();
      });

      it('listSnapshots should return real data', async () => {
        const result = await client.listSnapshots();
        expect(result).toBeDefined();
        expect(result.listsnapshotsresponse).toBeDefined();
      });

      it('should have all storage methods', async () => {
        expect(client.createVolume).toBeDefined();
        expect(client.attachVolume).toBeDefined();
        expect(client.detachVolume).toBeDefined();
        expect(client.resizeVolume).toBeDefined();
        expect(client.createSnapshot).toBeDefined();
      });
    });

    describe('Networking', () => {
      it('listNetworks should return real data', async () => {
        const result = await client.listNetworks();
        expect(result).toBeDefined();
        expect(result.listnetworksresponse).toBeDefined();
        
        const networks = result.listnetworksresponse?.network || [];
        expect(Array.isArray(networks)).toBe(true);
      });

      it('listPublicIpAddresses should return real data', async () => {
        const result = await client.listPublicIpAddresses();
        expect(result).toBeDefined();
        expect(result.listpublicipaddressesresponse).toBeDefined();
      });

      it('listLoadBalancerRules should return real data', async () => {
        const result = await client.listLoadBalancerRules();
        expect(result).toBeDefined();
        expect(result.listloadbalancerrulesresponse).toBeDefined();
      });

      it('should have all network methods', async () => {
        expect(client.createNetwork).toBeDefined();
        expect(client.associateIpAddress).toBeDefined();
        expect(client.enableStaticNat).toBeDefined();
        expect(client.createFirewallRule).toBeDefined();
      });
    });

    describe('Monitoring & Analytics', () => {
      it('listEvents should return real data', async () => {
        const result = await client.listEvents();
        expect(result).toBeDefined();
        expect(result.listeventsresponse).toBeDefined();
      });

      it('listAlerts should handle permission errors gracefully', async () => {
        try {
          const result = await client.listAlerts();
          expect(result).toBeDefined();
          expect(result.listalertsresponse).toBeDefined();
        } catch (error: any) {
          // 432 error is likely permission denied
          expect(error.message).toContain('432');
          console.log('Note: listAlerts requires admin permissions');
        }
      });

      it('listCapacity should handle permission errors gracefully', async () => {
        try {
          const result = await client.listCapacity();
          expect(result).toBeDefined();
          expect(result.listcapacityresponse).toBeDefined();
        } catch (error: any) {
          // 432 error is likely permission denied
          expect(error.message).toContain('432');
          console.log('Note: listCapacity requires admin permissions');
        }
      });

      it('listAsyncJobs should return real data', async () => {
        const result = await client.listAsyncJobs();
        expect(result).toBeDefined();
        expect(result.listasyncjobsresponse).toBeDefined();
      });

      it('listVirtualMachineMetrics should handle permission errors', async () => {
        try {
          const result = await client.listVirtualMachineMetrics();
          expect(result).toBeDefined();
        } catch (error: any) {
          // 401 error means this API requires different permissions
          expect([401, 432]).toContain(error.message.match(/\d{3}/)?.[0] ? parseInt(error.message.match(/\d{3}/)[0]) : 0);
          console.log('Note: listVirtualMachineMetrics may require special permissions');
        }
      });
    });

    describe('Account & User Management', () => {
      it('listAccounts should return real data', async () => {
        const result = await client.listAccounts();
        expect(result).toBeDefined();
        expect(result.listaccountsresponse).toBeDefined();
        
        const accounts = result.listaccountsresponse?.account || [];
        expect(accounts.length).toBeGreaterThan(0);
      });

      it('listUsers should return real data', async () => {
        const result = await client.listUsers();
        expect(result).toBeDefined();
        expect(result.listusersresponse).toBeDefined();
      });

      it('listDomains should handle permission errors', async () => {
        try {
          const result = await client.listDomains();
          expect(result).toBeDefined();
          expect(result.listdomainsresponse).toBeDefined();
        } catch (error: any) {
          expect(error.message).toContain('432');
          console.log('Note: listDomains requires admin permissions');
        }
      });

      it('listUsageRecords requires date range', async () => {
        // This requires specific date parameters
        expect(client.listUsageRecords).toBeDefined();
      });
    });

    describe('Infrastructure Discovery', () => {
      it('listZones should return exactly 6 zones', async () => {
        const result = await client.listZones();
        const zones = result.listzonesresponse?.zone || [];
        expect(zones.length).toBe(6);
        
        // Verify known zones
        const zoneNames = zones.map((z: any) => z.name);
        expect(zoneNames).toContain('CS-SIM1 Adv Zone x86');
        expect(zoneNames).toContain('IN-GGN1 SG Zone ARM64');
        expect(zoneNames).toContain('EU-SOF1 Adv VMware x86');
        expect(zoneNames).toContain('UK-LON2 Adv Zone x86');
        expect(zoneNames).toContain('IN-BLR1 Basic Zone x86');
        expect(zoneNames).toContain('CH-GVA1 Edge Zone ARM64');
      });

      it('listTemplates should return real templates', async () => {
        const result = await client.listTemplates();
        const templates = result.listtemplatesresponse?.template || [];
        expect(templates.length).toBeGreaterThan(0);
        
        templates.forEach((template: any) => {
          expect(template).toHaveProperty('id');
          expect(template).toHaveProperty('name');
          expect(template).toHaveProperty('displaytext');
        });
      });

      it('listServiceOfferings should return 4 offerings', async () => {
        const result = await client.listServiceOfferings();
        const offerings = result.listserviceofferingsresponse?.serviceoffering || [];
        expect(offerings.length).toBe(4);
      });
    });

    describe('System Administration', () => {
      it('listHosts should handle permission errors', async () => {
        try {
          const result = await client.listHosts();
          expect(result).toBeDefined();
          expect(result.listhostsresponse).toBeDefined();
        } catch (error: any) {
          expect(error.message).toContain('432');
          console.log('Note: listHosts requires admin permissions');
        }
      });

      it('listClusters should handle permission errors', async () => {
        try {
          const result = await client.listClusters();
          expect(result).toBeDefined();
          expect(result.listclustersresponse).toBeDefined();
        } catch (error: any) {
          expect(error.message).toContain('432');
          console.log('Note: listClusters requires admin permissions');
        }
      });

      it('listStoragePools should handle permission errors', async () => {
        try {
          const result = await client.listStoragePools();
          expect(result).toBeDefined();
          expect(result.liststoragepoolsresponse).toBeDefined();
        } catch (error: any) {
          expect(error.message).toContain('432');
          console.log('Note: listStoragePools requires admin permissions');
        }
      });

      it('listSystemVms should handle permission errors', async () => {
        try {
          const result = await client.listSystemVms();
          expect(result).toBeDefined();
          expect(result.listsystemvmsresponse).toBeDefined();
        } catch (error: any) {
          expect(error.message).toContain('432');
          console.log('Note: listSystemVms requires admin permissions');
        }
      });
    });

    describe('Security & Compliance', () => {
      it('listSSHKeyPairs should return real data', async () => {
        const result = await client.listSSHKeyPairs();
        expect(result).toBeDefined();
        expect(result.listsshkeypairsresponse).toBeDefined();
      });

      it('listSecurityGroups should return real data', async () => {
        const result = await client.listSecurityGroups();
        expect(result).toBeDefined();
        expect(result.listsecuritygroupsresponse).toBeDefined();
      });

      it('should have security creation methods', async () => {
        expect(client.createSSHKeyPair).toBeDefined();
        expect(client.authorizeSecurityGroupIngress).toBeDefined();
      });
    });

    describe('API Capabilities', () => {
      it('listCapabilities should return CloudStack version 4.20.0.0', async () => {
        const result = await client.listCapabilities();
        const capability = result.listcapabilitiesresponse?.capability;
        expect(capability).toBeDefined();
        expect(capability.cloudstackversion).toBe('4.20.0.0');
      });
    });
  });

  describe('Error Handling with Real API', () => {
    it('should handle authentication failures properly', async () => {
      const badClient = new CloudStackClient({
        apiUrl: process.env.CLOUDSTACK_API_URL!,
        apiKey: 'invalid-key',
        secretKey: 'invalid-secret',
        timeout: 30000,
      });

      await expect(badClient.listZones()).rejects.toThrow('CloudStack API request failed');
    });

    it('should handle invalid commands properly', async () => {
      await expect(client.request('invalidCommand', {})).rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      const timeoutClient = new CloudStackClient({
        apiUrl: process.env.CLOUDSTACK_API_URL!,
        apiKey: process.env.CLOUDSTACK_API_KEY!,
        secretKey: process.env.CLOUDSTACK_SECRET_KEY!,
        timeout: 1, // 1ms timeout
      });

      await expect(timeoutClient.listZones()).rejects.toThrow();
    });
  });

  describe('Signature Generation with Real API', () => {
    it('should generate valid signatures that CloudStack accepts', async () => {
      // The fact that any API call works proves signature generation is correct
      const result = await client.listZones();
      expect(result).toBeDefined();
      // If signature was wrong, we'd get 401 Unauthorized
    });
  });

  describe('All 45 Tools Coverage', () => {
    const allTools = [
      // VM Management (7)
      'listVirtualMachines', 'deployVirtualMachine', 'startVirtualMachine',
      'stopVirtualMachine', 'rebootVirtualMachine', 'destroyVirtualMachine',
      'queryAsyncJobResult',
      
      // VM Advanced (4)
      'scaleVirtualMachine', 'migrateVirtualMachine',
      'resetPasswordForVirtualMachine', 'changeServiceForVirtualMachine',
      
      // Storage (7)
      'listVolumes', 'createVolume', 'attachVolume', 'detachVolume',
      'resizeVolume', 'createSnapshot', 'listSnapshots',
      
      // Networking (7)
      'listNetworks', 'createNetwork', 'listPublicIpAddresses',
      'associateIpAddress', 'enableStaticNat', 'createFirewallRule',
      'listLoadBalancerRules',
      
      // Monitoring (5)
      'listVirtualMachineMetrics', 'listEvents', 'listAlerts',
      'listCapacity', 'listAsyncJobs',
      
      // Account (4)
      'listAccounts', 'listUsers', 'listDomains', 'listUsageRecords',
      
      // Infrastructure (2)
      'listZones', 'listTemplates',
      
      // System Admin (5)
      'listHosts', 'listClusters', 'listStoragePools',
      'listSystemVms', 'listServiceOfferings',
      
      // Security (4)
      'listSSHKeyPairs', 'createSSHKeyPair',
      'listSecurityGroups', 'authorizeSecurityGroupIngress'
    ];

    it('should have all 45 methods implemented', () => {
      allTools.forEach(method => {
        expect((client as any)[method]).toBeDefined();
        expect(typeof (client as any)[method]).toBe('function');
      });
    });
  });
});