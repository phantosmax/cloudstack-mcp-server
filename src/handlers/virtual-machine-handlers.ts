import { CloudStackClient } from '../cloudstack-client.js';

export class VirtualMachineHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListVirtualMachines(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines(args);
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
    
    const vmList = vms.map((vm: any) => ({
      id: vm.id,
      name: vm.name,
      displayname: vm.displayname,
      state: vm.state,
      zonename: vm.zonename,
      templatename: vm.templatename,
      serviceofferingname: vm.serviceofferingname,
      cpunumber: vm.cpunumber,
      memory: vm.memory,
      networkkbsread: vm.networkkbsread,
      networkkbswrite: vm.networkkbswrite,
      diskioread: vm.diskioread,
      diskiowrite: vm.diskiowrite,
      disksize: vm.disksize,
      created: vm.created,
      ipaddress: vm.nic?.[0]?.ipaddress,
      hostname: vm.hostname
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${vmList.length} virtual machines:\n\n${vmList
            .map((vm: any) => 
              `• ${vm.name} (${vm.id})\n  Display Name: ${vm.displayname}\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n  Template: ${vm.templatename}\n  Service Offering: ${vm.serviceofferingname}\n  CPUs: ${vm.cpunumber}, RAM: ${vm.memory}MB\n  IP Address: ${vm.ipaddress}\n  Created: ${vm.created}\n`
            )
            .join('\n')}`
        }
      ]
    };
  }

  async handleGetVirtualMachine(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines({ id: args.id });
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
    
    if (vms.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Virtual machine with ID ${args.id} not found.`
          }
        ]
      };
    }

    const vm = vms[0];
    return {
      content: [
        {
          type: 'text',
          text: `Virtual Machine Details:\n\nID: ${vm.id}\nName: ${vm.name}\nDisplay Name: ${vm.displayname}\nState: ${vm.state}\nZone: ${vm.zonename}\nTemplate: ${vm.templatename}\nService Offering: ${vm.serviceofferingname}\nCPUs: ${vm.cpunumber}\nMemory: ${vm.memory}MB\nIP Address: ${vm.nic?.[0]?.ipaddress}\nHostname: ${vm.hostname}\nCreated: ${vm.created}\nHypervisor: ${vm.hypervisor}\nRoot Device Type: ${vm.rootdevicetype}\nSecurityGroups: ${vm.securitygroup?.map((sg: any) => sg.name).join(', ') || 'None'}`
        }
      ]
    };
  }

  async handleStartVirtualMachine(args: any) {
    const result = await this.cloudStackClient.startVirtualMachine({ id: args.id });
    
    return {
      content: [
        {
          type: 'text',
          text: `Started virtual machine ${args.id}. Job ID: ${result.startvirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleStopVirtualMachine(args: any) {
    const result = await this.cloudStackClient.stopVirtualMachine({
      id: args.id,
      forced: args.forced || false
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Stopped virtual machine ${args.id}. Job ID: ${result.stopvirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleRebootVirtualMachine(args: any) {
    const result = await this.cloudStackClient.rebootVirtualMachine({ id: args.id });
    
    return {
      content: [
        {
          type: 'text',
          text: `Rebooted virtual machine ${args.id}. Job ID: ${result.rebootvirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleDestroyVirtualMachine(args: any) {
    try {
      // First, check current VM state
      const vmResult = await this.cloudStackClient.listVirtualMachines({ id: args.id });
      const vms = vmResult.listvirtualmachinesresponse?.virtualmachine || [];
      
      if (vms.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Virtual machine with ID ${args.id} not found.`
            }
          ]
        };
      }

      const vm = vms[0];
      const vmName = vm.name || vm.displayname || args.id;
      let steps = [`Starting destruction process for VM: ${vmName} (${args.id})`];
      
      // Step 1: Stop the VM if it's running (unless it's in Error state)
      if (vm.state === 'Running') {
        steps.push('Step 1: Stopping VM...');
        const stopResult = await this.cloudStackClient.stopVirtualMachine({
          id: args.id,
          forced: true
        });
        steps.push(`✓ Stop job initiated: ${stopResult.stopvirtualmachineresponse?.jobid}`);
        
        // Wait a moment for the stop to process
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (vm.state === 'Stopped' || vm.state === 'Error') {
        steps.push(`Step 1: VM is already in ${vm.state} state, proceeding to destroy...`);
      } else {
        steps.push(`Step 1: VM is in ${vm.state} state, attempting to destroy...`);
      }
      
      // Step 2: Destroy the VM
      steps.push('Step 2: Destroying VM...');
      const destroyResult = await this.cloudStackClient.destroyVirtualMachine({
        id: args.id,
        expunge: args.expunge || false
      });
      steps.push(`✓ Destroy job initiated: ${destroyResult.destroyvirtualmachineresponse?.jobid}`);
      
      // Step 3: Note about expunge (handled by destroy with expunge=true)
      if (args.expunge) {
        steps.push('Step 3: VM will be expunged (permanently deleted) automatically');
      }
      
      steps.push(`\n🗑️ VM destruction process completed for ${vmName}`);
      if (args.expunge) {
        steps.push('⚠️ VM has been permanently deleted and cannot be recovered');
      } else {
        steps.push('ℹ️ VM is destroyed but not expunged - it can still be recovered');
      }

      return {
        content: [
          {
            type: 'text',
            text: steps.join('\n')
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error destroying virtual machine ${args.id}: ${error.message}`
          }
        ]
      };
    }
  }

  async handleDeployVirtualMachine(args: any) {
    const result = await this.cloudStackClient.deployVirtualMachine(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Deployed virtual machine. Job ID: ${result.deployvirtualmachineresponse?.jobid}\nVM ID: ${result.deployvirtualmachineresponse?.id}`
        }
      ]
    };
  }

  async handleScaleVirtualMachine(args: any) {
    const result = await this.cloudStackClient.scaleVirtualMachine(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Scaled virtual machine ${args.id}. Job ID: ${result.scalevirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleMigrateVirtualMachine(args: any) {
    const result = await this.cloudStackClient.migrateVirtualMachine(args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Migrated virtual machine ${args.id}. Job ID: ${result.migratevirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleResetPasswordVirtualMachine(args: any) {
    const result = await this.cloudStackClient.resetPasswordForVirtualMachine({ id: args.id });
    
    return {
      content: [
        {
          type: 'text',
          text: `Reset password for virtual machine ${args.id}. Job ID: ${result.resetpasswordforvirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleChangeServiceOfferingVirtualMachine(args: any) {
    const result = await this.cloudStackClient.changeServiceForVirtualMachine({
      id: args.id,
      serviceofferingid: args.serviceofferingid
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Changed service offering for virtual machine ${args.id}. Job ID: ${result.changeserviceforvirtualmachineresponse?.jobid}`
        }
      ]
    };
  }

  async handleListVirtualMachineMetrics(args: any) {
    const result = await this.cloudStackClient.listVirtualMachineMetrics(args);
    const metrics = result.listvirtualmachinemetricsresponse?.virtualmachine || [];
    
    const metricsList = metrics.map((vm: any) => ({
      id: vm.id,
      name: vm.name,
      state: vm.state,
      cpuused: vm.cpuused,
      networkkbsread: vm.networkkbsread,
      networkkbswrite: vm.networkkbswrite,
      diskioread: vm.diskioread,
      diskiowrite: vm.diskiowrite,
      disksize: vm.disksize,
      memory: vm.memory,
      cpunumber: vm.cpunumber
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${metricsList.length} virtual machine metrics:\n\n${metricsList
            .map((vm: any) => 
              `• ${vm.name} (${vm.id})\n  State: ${vm.state}\n  CPU Used: ${vm.cpuused}%\n  Memory: ${vm.memory}MB\n  CPUs: ${vm.cpunumber}\n  Disk Size: ${vm.disksize}GB\n  Network Read: ${vm.networkkbsread}KB\n  Network Write: ${vm.networkkbswrite}KB\n  Disk Read: ${vm.diskioread}KB\n  Disk Write: ${vm.diskiowrite}KB\n`
            )
            .join('\n')}`
        }
      ]
    };
  }
}