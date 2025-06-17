import { CloudStackClient } from '../cloudstack-client.js';

export class StorageHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListVolumes(args: any) {
    const result = await this.cloudStackClient.listVolumes(args);
    const volumes = result.listvolumesresponse?.volume || [];
    
    const volumeList = volumes.map((volume: Record<string, any>) => ({
      id: volume.id,
      name: volume.name,
      type: volume.type,
      size: volume.size,
      state: volume.state,
      virtualmachineid: volume.virtualmachineid,
      zonename: volume.zonename,
      created: volume.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${volumeList.length} volumes:\n\n${volumeList
            .map(
              (volume: Record<string, any>) =>
                `• ${volume.name} (${volume.id})\n  Type: ${volume.type}\n  Size: ${Math.round(volume.size / 1024 / 1024 / 1024)}GB\n  State: ${volume.state}\n  Zone: ${volume.zonename}\n  Created: ${volume.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleCreateVolume(args: any) {
    const result = await this.cloudStackClient.createVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume creation initiated. Job ID: ${result.createvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  async handleAttachVolume(args: any) {
    const result = await this.cloudStackClient.attachVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} attachment initiated. Job ID: ${result.attachvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  async handleDetachVolume(args: any) {
    const result = await this.cloudStackClient.detachVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} detachment initiated. Job ID: ${result.detachvolumeresponse?.jobid}`,
        },
      ],
    };
  }

  async handleResizeVolume(args: any) {
    const result = await this.cloudStackClient.resizeVolume(args);
    return {
      content: [
        {
          type: 'text',
          text: `Volume ${args.id} resize to ${args.size}GB initiated. Job ID: ${result.resizevolumeresponse?.jobid}`,
        },
      ],
    };
  }

  async handleCreateSnapshot(args: any) {
    const result = await this.cloudStackClient.createSnapshot(args);
    return {
      content: [
        {
          type: 'text',
          text: `Snapshot creation initiated for volume ${args.volumeid}. Job ID: ${result.createsnapshotresponse?.jobid}`,
        },
      ],
    };
  }

  async handleListSnapshots(args: any) {
    const result = await this.cloudStackClient.listSnapshots(args);
    const snapshots = result.listsnapshotsresponse?.snapshot || [];
    
    const snapshotList = snapshots.map((snapshot: Record<string, any>) => ({
      id: snapshot.id,
      name: snapshot.name,
      volumeid: snapshot.volumeid,
      volumename: snapshot.volumename,
      state: snapshot.state,
      snapshottype: snapshot.snapshottype,
      created: snapshot.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${snapshotList.length} snapshots:\n\n${snapshotList
            .map(
              (snapshot: Record<string, any>) =>
                `• ${snapshot.name} (${snapshot.id})\n  Volume: ${snapshot.volumename}\n  Type: ${snapshot.snapshottype}\n  State: ${snapshot.state}\n  Created: ${snapshot.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }
}