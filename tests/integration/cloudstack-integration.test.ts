/**
 * Integration tests using real CloudStack QA environment
 * These tests actually hit the CloudStack API to verify real functionality
 */

import { CloudStackClient } from '../../src/cloudstack-client';
import dotenv from 'dotenv';

// Load test environment
dotenv.config();

// Skip these tests if no credentials are provided
const hasCredentials = !!(
  process.env.CLOUDSTACK_API_URL &&
  process.env.CLOUDSTACK_API_KEY &&
  process.env.CLOUDSTACK_SECRET_KEY
);

const describeIf = hasCredentials ? describe : describe.skip;

describeIf('CloudStack Integration Tests (Real API)', () => {
  let client: CloudStackClient;

  beforeAll(() => {
    client = new CloudStackClient({
      apiUrl: process.env.CLOUDSTACK_API_URL!,
      apiKey: process.env.CLOUDSTACK_API_KEY!,
      secretKey: process.env.CLOUDSTACK_SECRET_KEY!,
      timeout: 30000,
    });
  });

  describe('Basic Connectivity', () => {
    it('should connect to CloudStack and get capabilities', async () => {
      const result = await client.listCapabilities();
      expect(result.listcapabilitiesresponse).toBeDefined();
      expect(result.listcapabilitiesresponse.capability).toBeDefined();
      
      const capability = result.listcapabilitiesresponse.capability;
      expect(capability.cloudstackversion).toBe('4.20.0.0');
    });

    it('should handle authentication errors gracefully', async () => {
      const badClient = new CloudStackClient({
        apiUrl: process.env.CLOUDSTACK_API_URL!,
        apiKey: 'invalid-key',
        secretKey: 'invalid-secret',
        timeout: 30000,
      });

      await expect(badClient.listZones()).rejects.toThrow();
    });
  });

  describe('Zone Operations', () => {
    it('should list all zones', async () => {
      const result = await client.listZones();
      const zones = result.listzonesresponse?.zone || [];
      
      expect(zones.length).toBeGreaterThan(0);
      expect(zones.length).toBe(6); // QA has 6 zones
      
      // Verify zone structure
      zones.forEach((zone: any) => {
        expect(zone).toHaveProperty('id');
        expect(zone).toHaveProperty('name');
        expect(zone).toHaveProperty('networktype');
      });
    });

    it('should list only available zones', async () => {
      const result = await client.listZones({ available: true });
      const zones = result.listzonesresponse?.zone || [];
      
      zones.forEach((zone: any) => {
        expect(zone.allocationstate).toBe('Enabled');
      });
    });
  });

  describe('Template Operations', () => {
    it('should list featured templates', async () => {
      const result = await client.listTemplates();
      const templates = result.listtemplatesresponse?.template || [];
      
      expect(templates.length).toBeGreaterThan(0);
      
      templates.forEach((template: any) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('displaytext');
      });
    });

    it('should list templates with specific filter', async () => {
      const result = await client.listTemplates({ templatefilter: 'featured' });
      expect(result.listtemplatesresponse).toBeDefined();
    });
  });

  describe('Service Offering Operations', () => {
    it('should list service offerings', async () => {
      const result = await client.listServiceOfferings();
      const offerings = result.listserviceofferingsresponse?.serviceoffering || [];
      
      expect(offerings.length).toBe(4); // QA has 4 offerings
      
      offerings.forEach((offering: any) => {
        expect(offering).toHaveProperty('id');
        expect(offering).toHaveProperty('name');
        // Custom offerings may not have cpunumber/memory
        if (!offering.iscustomized) {
          expect(offering).toHaveProperty('cpunumber');
          expect(offering).toHaveProperty('memory');
        }
      });
    });
  });

  describe('Virtual Machine Operations', () => {
    it('should list virtual machines', async () => {
      const result = await client.listVirtualMachines();
      expect(result.listvirtualmachinesresponse).toBeDefined();
      
      // May or may not have VMs in QA
      const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
      expect(Array.isArray(vms)).toBe(true);
    });

    it('should filter VMs by state', async () => {
      const result = await client.listVirtualMachines({ state: 'Running' });
      const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
      
      vms.forEach((vm: any) => {
        expect(vm.state).toBe('Running');
      });
    });

    // Note: We don't test VM deployment/destruction in integration tests
    // to avoid creating real resources in QA environment
  });

  describe('Network Operations', () => {
    it('should list networks', async () => {
      const result = await client.listNetworks();
      expect(result.listnetworksresponse).toBeDefined();
      
      const networks = result.listnetworksresponse?.network || [];
      expect(Array.isArray(networks)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid command parameters', async () => {
      await expect(
        client.request('invalidCommand', {})
      ).rejects.toThrow();
    });

    it('should handle API errors with proper error messages', async () => {
      try {
        await client.request('invalidCommand', {});
      } catch (error: any) {
        expect(error.message).toContain('CloudStack API');
      }
    });
  });

  describe('Performance', () => {
    it('should complete requests within timeout', async () => {
      const start = Date.now();
      await client.listZones();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000); // Should be much faster than timeout
    });

    it('should handle concurrent requests', async () => {
      const promises = [
        client.listZones(),
        client.listTemplates(),
        client.listServiceOfferings(),
      ];
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});