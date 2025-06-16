# CloudStack API Permissions

Based on real API testing with the QA environment, here's what we've learned about permissions:

## APIs Available to Regular Users ✅

These APIs work with standard user credentials:

### VM Management
- `listVirtualMachines` - List VMs you have access to
- `deployVirtualMachine` - Deploy new VMs
- `startVirtualMachine` - Start VMs
- `stopVirtualMachine` - Stop VMs
- `rebootVirtualMachine` - Reboot VMs
- `destroyVirtualMachine` - Destroy VMs

### Storage
- `listVolumes` - List storage volumes
- `listSnapshots` - List snapshots
- `createVolume`, `attachVolume`, `detachVolume` - Volume operations
- `createSnapshot` - Create snapshots

### Networking
- `listNetworks` - List networks
- `listPublicIpAddresses` - List public IPs
- `listLoadBalancerRules` - List load balancer rules
- Network creation and firewall rules

### General
- `listZones` - List all zones (6 in QA)
- `listTemplates` - List VM templates
- `listServiceOfferings` - List service offerings (4 in QA)
- `listEvents` - List events
- `listAsyncJobs` - List async jobs
- `listAccounts` - List accounts
- `listUsers` - List users
- `listSSHKeyPairs` - List SSH keys
- `listSecurityGroups` - List security groups
- `listCapabilities` - Get CloudStack version (4.20.0.0)

## APIs Requiring Admin Permissions ❌

These APIs return 432 (Forbidden) errors with regular user credentials:

### System Administration
- `listHosts` - Physical hosts (admin only)
- `listClusters` - Host clusters (admin only)
- `listStoragePools` - Storage pools (admin only)
- `listSystemVms` - System VMs (admin only)

### Monitoring
- `listAlerts` - System alerts (admin only)
- `listCapacity` - System capacity (admin only)
- `listDomains` - Domain management (admin only)

### Special APIs
- `listVirtualMachineMetrics` - Returns 401 (may require special metrics permissions)

## Key Findings

1. **Most functionality works with regular user accounts** - VM management, storage, networking, and basic infrastructure discovery all work fine.

2. **Admin APIs are properly restricted** - System-level APIs correctly return 432 errors for non-admin users.

3. **The QA environment has**:
   - 6 zones (various architectures)
   - 4 service offerings (custom offerings)
   - CloudStack version 4.20.0.0

4. **Error codes**:
   - 401: Authentication/special permission required
   - 432: Forbidden (admin-only API)

## Recommendations for MCP Server

1. **Handle permission errors gracefully** - Don't fail if admin APIs return 432
2. **Document which tools require admin access** in tool descriptions
3. **Test with both regular and admin accounts** if possible
4. **Focus on user-level APIs** for most use cases

## Testing Strategy

For production use:
- Use regular user credentials for safety
- Test admin APIs only with dedicated admin test accounts
- Always handle 432/401 errors gracefully
- Document permission requirements in tool help text