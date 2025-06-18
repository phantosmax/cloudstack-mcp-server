import { CloudStackClient } from '../cloudstack-client.js';

export class StorageHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListVolumes(args: any) {
    const result = await this.cloudStackClient.listVolumes(args);
    const volumes = result.listvolumesresponse?.volume || [];
    
    const volumeList = volumes.map((volume: any) => ({
      id: volume.id,
      name: volume.name,
      type: volume.type,
      size: volume.size,
      state: volume.state,
      zonename: volume.zonename,
      vmname: volume.vmname,
      deviceid: volume.deviceid,
      diskofferingname: volume.diskofferingname,
      created: volume.created,
      path: volume.path
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${volumeList.length} volumes:\n\n${volumeList
            .map((vol: any) => 
              `• ${vol.name} (${vol.id})\n  Type: ${vol.type}\n  Size: ${vol.size}GB\n  State: ${vol.state}\n  Zone: ${vol.zonename}\n  VM: ${vol.vmname || 'Not attached'}\n  Device ID: ${vol.deviceid || 'N/A'}\n  Disk Offering: ${vol.diskofferingname}\n  Created: ${vol.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleCreateVolume(args: any) {
    const result = await this.cloudStackClient.createVolume(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created volume. Job ID: ${result.createvolumeresponse?.jobid}\nVolume ID: ${result.createvolumeresponse?.id}`
        }
      ]
    };
  }

  async handleAttachVolume(args: any) {
    const result = await this.cloudStackClient.attachVolume(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Attached volume ${args.id} to VM ${args.virtualmachineid}. Job ID: ${result.attachvolumeresponse?.jobid}`
        }
      ]
    };
  }

  async handleDetachVolume(args: any) {
    const result = await this.cloudStackClient.detachVolume({ id: args.id });
    
    return {
      content: [
        {
          type: 'text',
          text: `Detached volume ${args.id}. Job ID: ${result.detachvolumeresponse?.jobid}`
        }
      ]
    };
  }

  async handleResizeVolume(args: any) {
    const result = await this.cloudStackClient.resizeVolume(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Resized volume ${args.id}. Job ID: ${result.resizevolumeresponse?.jobid}`
        }
      ]
    };
  }

  async handleCreateSnapshot(args: any) {
    const result = await this.cloudStackClient.createSnapshot(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created snapshot of volume ${args.volumeid}. Job ID: ${result.createsnapshotresponse?.jobid}\nSnapshot ID: ${result.createsnapshotresponse?.id}`
        }
      ]
    };
  }

  async handleListSnapshots(args: any) {
    const result = await this.cloudStackClient.listSnapshots(args);
    const snapshots = result.listsnapshotsresponse?.snapshot || [];
    
    const snapshotList = snapshots.map((snapshot: any) => ({
      id: snapshot.id,
      name: snapshot.name,
      state: snapshot.state,
      volumeid: snapshot.volumeid,
      intervaltype: snapshot.intervaltype,
      created: snapshot.created,
      snapshottype: snapshot.snapshottype
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${snapshotList.length} snapshots:\n\n${snapshotList
            .map((snap: any) => 
              `• ${snap.name} (${snap.id})\n  State: ${snap.state}\n  Volume ID: ${snap.volumeid}\n  Type: ${snap.snapshottype}\n  Interval: ${snap.intervaltype}\n  Created: ${snap.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}