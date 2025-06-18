import { virtualMachineTools } from './virtual-machine-tools.js';
import { storageTools } from './storage-tools.js';
import { networkTools } from './network-tools.js';
import { monitoringTools } from './monitoring-tools.js';
import { adminTools } from './admin-tools.js';
import { securityTools } from './security-tools.js';

export const allToolDefinitions = [
  ...virtualMachineTools,
  ...storageTools,
  ...networkTools,
  ...monitoringTools,
  ...adminTools,
  ...securityTools,
];

export {
  virtualMachineTools,
  storageTools,
  networkTools,
  monitoringTools,
  adminTools,
  securityTools,
};