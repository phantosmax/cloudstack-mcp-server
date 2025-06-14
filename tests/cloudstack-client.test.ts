import { CloudStackClient } from '../src/cloudstack-client';
import axios from 'axios';
import {
  mockCloudStackConfig,
  mockResponses,
  mockParams,
  expectCloudStackCall,
  createAxiosError
} from './test-utils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CloudStackClient', () => {
  let client: CloudStackClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios);
    client = new CloudStackClient(mockCloudStackConfig);
  });

  describe('Constructor and Configuration', () => {
    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(CloudStackClient);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: mockCloudStackConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use default timeout when not specified', () => {
      const configWithoutTimeout = {
        apiUrl: mockCloudStackConfig.apiUrl,
        apiKey: mockCloudStackConfig.apiKey,
        secretKey: mockCloudStackConfig.secretKey
      };
      new CloudStackClient(configWithoutTimeout);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('VM Management Functions', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockResponses.virtualMachines);
    });

    it('should call listVirtualMachines', async () => {
      await client.listVirtualMachines(mockParams.vm.list);
      expectCloudStackCall(mockedAxios, 'listVirtualMachines', mockParams.vm.list);
    });

    it('should call deployVirtualMachine', async () => {
      mockedAxios.get.mockResolvedValue(mockResponses.job);
      await client.deployVirtualMachine(mockParams.vm.deploy);
      expectCloudStackCall(mockedAxios, 'deployVirtualMachine', mockParams.vm.deploy);
    });

    it('should call startVirtualMachine', async () => {
      await client.startVirtualMachine(mockParams.vm.start);
      expectCloudStackCall(mockedAxios, 'startVirtualMachine', mockParams.vm.start);
    });

    it('should call stopVirtualMachine', async () => {
      await client.stopVirtualMachine(mockParams.vm.stop);
      expectCloudStackCall(mockedAxios, 'stopVirtualMachine', mockParams.vm.stop);
    });

    it('should call rebootVirtualMachine', async () => {
      const params = { id: 'vm-123' };
      await client.rebootVirtualMachine(params);
      expectCloudStackCall(mockedAxios, 'rebootVirtualMachine', params);
    });

    it('should call destroyVirtualMachine', async () => {
      await client.destroyVirtualMachine(mockParams.vm.destroy);
      expectCloudStackCall(mockedAxios, 'destroyVirtualMachine', mockParams.vm.destroy);
    });
  });

  describe('VM Advanced Operations', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockResponses.job);
    });

    it('should call scaleVirtualMachine', async () => {
      const params = { id: 'vm-123', serviceofferingid: 'offering-456' };
      await client.scaleVirtualMachine(params);
      expectCloudStackCall(mockedAxios, 'scaleVirtualMachine', params);
    });

    it('should call migrateVirtualMachine', async () => {
      const params = { virtualmachineid: 'vm-123', hostid: 'host-456' };
      await client.migrateVirtualMachine(params);
      expectCloudStackCall(mockedAxios, 'migrateVirtualMachine', params);
    });

    it('should call resetPasswordForVirtualMachine', async () => {
      const params = { id: 'vm-123' };
      await client.resetPasswordForVirtualMachine(params);
      expectCloudStackCall(mockedAxios, 'resetPasswordForVirtualMachine', params);
    });

    it('should call changeServiceForVirtualMachine', async () => {
      const params = { id: 'vm-123', serviceofferingid: 'offering-456' };
      await client.changeServiceForVirtualMachine(params);
      expectCloudStackCall(mockedAxios, 'changeServiceForVirtualMachine', params);
    });
  });

  describe('Storage Management', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockResponses.job);
    });

    it('should call listVolumes', async () => {
      const params = { virtualmachineid: 'vm-123' };
      await client.listVolumes(params);
      expectCloudStackCall(mockedAxios, 'listVolumes', params);
    });

    it('should call createVolume', async () => {
      await client.createVolume(mockParams.volume.create);
      expectCloudStackCall(mockedAxios, 'createVolume', mockParams.volume.create);
    });

    it('should call attachVolume', async () => {
      await client.attachVolume(mockParams.volume.attach);
      expectCloudStackCall(mockedAxios, 'attachVolume', mockParams.volume.attach);
    });

    it('should call detachVolume', async () => {
      await client.detachVolume(mockParams.volume.detach);
      expectCloudStackCall(mockedAxios, 'detachVolume', mockParams.volume.detach);
    });

    it('should call resizeVolume', async () => {
      const params = { id: 'volume-123', size: 100 };
      await client.resizeVolume(params);
      expectCloudStackCall(mockedAxios, 'resizeVolume', params);
    });

    it('should call createSnapshot', async () => {
      const params = { volumeid: 'volume-123', name: 'test-snapshot' };
      await client.createSnapshot(params);
      expectCloudStackCall(mockedAxios, 'createSnapshot', params);
    });

    it('should call listSnapshots', async () => {
      const params = { volumeid: 'volume-123' };
      await client.listSnapshots(params);
      expectCloudStackCall(mockedAxios, 'listSnapshots', params);
    });
  });

  describe('Infrastructure Discovery', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockResponses.zones);
    });

    it('should call listZones', async () => {
      const params = { available: true };
      await client.listZones(params);
      expectCloudStackCall(mockedAxios, 'listZones', params);
    });

    it('should call listTemplates with default filter', async () => {
      mockedAxios.get.mockResolvedValue(mockResponses.templates);
      await client.listTemplates();
      expectCloudStackCall(mockedAxios, 'listTemplates', { templatefilter: 'featured' });
    });

    it('should call listServiceOfferings', async () => {
      const params = { name: 'test-offering' };
      await client.listServiceOfferings(params);
      expectCloudStackCall(mockedAxios, 'listServiceOfferings', params);
    });
  });

  describe('Error Handling', () => {
    it('should handle CloudStack API errors', async () => {
      mockedAxios.get.mockResolvedValue(mockResponses.error);

      await expect(client.listVirtualMachines()).rejects.toThrow(
        'CloudStack API Error: Test error message'
      );
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(client.listVirtualMachines()).rejects.toThrow('Network error');
    });

    it('should handle axios errors', async () => {
      const axiosError = createAxiosError('HTTP 401: Unauthorized', 401);
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(client.listVirtualMachines()).rejects.toThrow(
        'CloudStack API request failed: HTTP 401: Unauthorized'
      );
    });
  });

  describe('Signature Generation', () => {
    it('should generate valid requests with signatures', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      
      await client.listVirtualMachines({ zoneid: 'test-zone' });
      
      const call = mockedAxios.get.mock.calls[0];
      const params = call[1]?.params;
      
      expect(params).toHaveProperty('signature');
      expect(params.signature).toBeTruthy();
      expect(typeof params.signature).toBe('string');
    });
  });
});