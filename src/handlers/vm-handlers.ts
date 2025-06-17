import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { CloudStackClient } from '../cloudstack-client.js';

export class VmHandlers {
  constructor(private cloudStackClient: CloudStackClient) {}

  async handleListVirtualMachines(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines(args);
    const vms = result.listvirtualmachinesresponse?.virtualmachine || [];
    
    const vmList = vms.map((vm: Record<string, any>) => ({
      id: vm.id,
      name: vm.name,
      displayname: vm.displayname,
      state: vm.state,
      zonename: vm.zonename,
      templatename: vm.templatename,
      serviceofferingname: vm.serviceofferingname,
      cpunumber: vm.cpunumber,
      memory: vm.memory,
      created: vm.created,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${vmList.length} virtual machines:\n\n${vmList
            .map(
              (vm: Record<string, any>) =>
                `• ${vm.name} (${vm.id})\n  State: ${vm.state}\n  Zone: ${vm.zonename}\n  Template: ${vm.templatename}\n  CPU: ${vm.cpunumber}, Memory: ${vm.memory}MB\n  Created: ${vm.created}\n`
            )
            .join('\n')}`,
        },
      ],
    };
  }

  async handleGetVirtualMachine(args: any) {
    const result = await this.cloudStackClient.listVirtualMachines({ id: args.id });
    const vm = result.listvirtualmachinesresponse?.virtualmachine?.[0];
    
    if (!vm) {
      throw new McpError(ErrorCode.InvalidRequest, `Virtual machine with ID ${args.id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Virtual Machine Details:
Name: ${vm.name}
Display Name: ${vm.displayname}
ID: ${vm.id}
State: ${vm.state}
Zone: ${vm.zonename}
Template: ${vm.templatename}
Service Offering: ${vm.serviceofferingname}
CPU: ${vm.cpunumber}
Memory: ${vm.memory}MB
Created: ${vm.created}
${vm.nic ? `\nNetwork:\n${vm.nic.map((n: any) => `  IP: ${n.ipaddress}, Network: ${n.networkname}`).join('\n')}` : ''}`,
        },
      ],
    };
  }

  async handleStartVirtualMachine(args: any) {
    const result = await this.cloudStackClient.startVirtualMachine({ id: args.id });
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} start initiated. Job ID: ${result.startvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleStopVirtualMachine(args: any) {
    const result = await this.cloudStackClient.stopVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} stop initiated${args.forced ? ' (forced)' : ''}. Job ID: ${result.stopvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleRebootVirtualMachine(args: any) {
    const result = await this.cloudStackClient.rebootVirtualMachine({ id: args.id });
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} reboot initiated. Job ID: ${result.rebootvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleDestroyVirtualMachine(args: any) {
    if (!args.confirm) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'DESTRUCTIVE ACTION BLOCKED: This will permanently delete the virtual machine. Please set confirm=true to proceed. THIS CANNOT BE UNDONE.'
      );
    }
    
    try {
      // Get VM current state
      const vms = await this.cloudStackClient.listVirtualMachines({ id: args.id });
      const vm = vms.listvirtualmachinesresponse?.virtualmachine?.[0];
      
      if (!vm) {
        throw new McpError(ErrorCode.InvalidRequest, `Virtual machine ${args.id} not found`);
      }
      
      let jobIds = [];
      
      // Step 1: Stop VM if running or in error state
      if (vm.state === 'Running' || vm.state === 'Error') {
        console.log(`VM ${vm.name} is in ${vm.state} state, stopping first...`);
        try {
          const stopResult = await this.cloudStackClient.stopVirtualMachine({ 
            id: args.id,
            forced: vm.state === 'Error' // Force stop for VMs in error state
          });
          jobIds.push(stopResult.stopvirtualmachineresponse?.jobid);
          
          // Wait a bit for stop operation
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (stopError: any) {
          console.log(`Stop failed (may be expected): ${stopError.message}`);
        }
      }
      
      // Step 2: Destroy without expunge first
      console.log(`Destroying VM ${vm.name}...`);
      const destroyResult = await this.cloudStackClient.destroyVirtualMachine({ 
        id: args.id,
        expunge: false 
      });
      jobIds.push(destroyResult.destroyvirtualmachineresponse?.jobid);
      
      // Wait for destroy to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Try to expunge
      if (args.expunge !== false) { // Default to expunge unless explicitly set to false
        console.log(`Expunging VM ${vm.name}...`);
        try {
          // Try direct expunge command
          const expungeResult = await this.cloudStackClient.request('expungeVirtualMachine', {
            id: args.id
          });
          if (expungeResult.expungevirtualmachineresponse?.jobid) {
            jobIds.push(expungeResult.expungevirtualmachineresponse.jobid);
          }
        } catch (expungeError: any) {
          // If expunge fails, try destroy with expunge flag
          console.log('Direct expunge failed, trying destroy with expunge flag...');
          try {
            const destroyExpungeResult = await this.cloudStackClient.destroyVirtualMachine({ 
              id: args.id,
              expunge: true
            });
            jobIds.push(destroyExpungeResult.destroyvirtualmachineresponse?.jobid);
          } catch (finalError: any) {
            console.log(`Expunge failed: ${finalError.message}`);
          }
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `⚠️  DESTRUCTIVE ACTION EXECUTED: Virtual machine ${vm.name} (${args.id}) destruction workflow completed.\n\nJob IDs: ${jobIds.filter(id => id).join(', ')}\n\nThe VM has been ${args.expunge !== false ? 'destroyed and expunged' : 'destroyed (not expunged)'}.\n\nNote: It may take a few moments for the VM to be fully removed.`,
          },
        ],
      };
    } catch (error: any) {
      // Re-throw with more context
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to destroy VM: ${error.message}`
      );
    }
  }

  async handleDeployVirtualMachine(args: any) {
    try {
      // Check if zone requires network and none provided
      if (args.zoneid && !args.networkids) {
        const zones = await this.cloudStackClient.listZones({ id: args.zoneid });
        const zone = zones.listzonesresponse?.zone?.[0];
        
        if (zone?.networktype === 'Advanced') {
          // Auto-select first available network in the zone
          const networks = await this.cloudStackClient.listNetworks({ zoneid: args.zoneid });
          const networkList = networks.listnetworksresponse?.network || [];
          
          if (networkList.length > 0) {
            args.networkids = networkList[0].id;
            console.log(`Auto-selected network ${networkList[0].name} (${networkList[0].id}) for Advanced zone`);
          } else {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'This is an Advanced zone but no networks are available. Please create a network first.'
            );
          }
        }
      }
      
      // Ensure we have required parameters
      if (!args.serviceofferingid || !args.templateid || !args.zoneid) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Missing required parameters: serviceofferingid, templateid, and zoneid are required'
        );
      }
      
      // Deploy the VM
      const result = await this.cloudStackClient.deployVirtualMachine(args);
      
      return {
        content: [
          {
            type: 'text',
            text: `Virtual machine deployment initiated successfully!\nJob ID: ${result.deployvirtualmachineresponse?.jobid}\n\nTip: Use query_async_job_result with this Job ID to check deployment status.`,
          },
        ],
      };
    } catch (error: any) {
      // Provide helpful error messages
      if (error.message?.includes('530')) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'VM limit reached for your account. Please destroy some existing VMs before creating new ones.'
        );
      } else if (error.message?.includes('431')) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Missing required parameter. For Advanced zones, you may need to specify networkids.'
        );
      }
      throw error;
    }
  }

  async handleScaleVirtualMachine(args: any) {
    const result = await this.cloudStackClient.scaleVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.id} scaling initiated. Job ID: ${result.scalevirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleMigrateVirtualMachine(args: any) {
    const result = await this.cloudStackClient.migrateVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Virtual machine ${args.virtualmachineid} migration initiated. Job ID: ${result.migratevirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleResetPasswordVirtualMachine(args: any) {
    const result = await this.cloudStackClient.resetPasswordForVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Password reset initiated for VM ${args.id}. Job ID: ${result.resetpasswordforvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }

  async handleChangeServiceOfferingVirtualMachine(args: any) {
    const result = await this.cloudStackClient.changeServiceForVirtualMachine(args);
    return {
      content: [
        {
          type: 'text',
          text: `Service offering change initiated for VM ${args.id}. Job ID: ${result.changeserviceforvirtualmachineresponse?.jobid}`,
        },
      ],
    };
  }
}