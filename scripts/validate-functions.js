#!/usr/bin/env node

/**
 * CloudStack MCP Server Function Validation Script
 * 
 * This comprehensive validation script verifies that all CloudStack MCP Server
 * functions are properly implemented and documented. It performs multiple checks
 * including function mapping, documentation accuracy, and build verification.
 * 
 * Usage: node scripts/validate-functions.js
 */

import { readFileSync } from 'fs';
import { CloudStackClient } from '../build/cloudstack-client.js';

// Configuration constants
const CONFIG = {
  TOTAL_EXPECTED_FUNCTIONS: 45,
  CATEGORIES: {
    'Virtual Machine Management': 7,
    'VM Advanced Operations': 4,
    'Storage Management': 7,
    'Networking': 7,
    'Monitoring & Analytics': 5,
    'Account & User Management': 4,
    'Infrastructure Discovery': 2,
    'System Administration': 5,
    'Security & Compliance': 4
  },
  FILES: {
    SERVER: './src/server.ts',
    CLIENT: './src/cloudstack-client.ts',
    README: './README.md',
    BUILD_INDEX: 'build/index.js',
    BUILD_SERVER: 'build/server.js',
    BUILD_CLIENT: 'build/cloudstack-client.js'
  }
};

// Expected tool definitions
const EXPECTED_TOOLS = [
  // VM Management (7)
  'list_virtual_machines', 'get_virtual_machine', 'start_virtual_machine',
  'stop_virtual_machine', 'reboot_virtual_machine', 'destroy_virtual_machine',
  'deploy_virtual_machine',
  
  // VM Advanced Operations (4)
  'scale_virtual_machine', 'migrate_virtual_machine',
  'reset_password_virtual_machine', 'change_service_offering_virtual_machine',
  
  // Storage Management (7)
  'list_volumes', 'create_volume', 'attach_volume', 'detach_volume',
  'resize_volume', 'create_snapshot', 'list_snapshots',
  
  // Networking (7)
  'list_networks', 'create_network', 'list_public_ip_addresses',
  'associate_ip_address', 'enable_static_nat', 'create_firewall_rule',
  'list_load_balancer_rules',
  
  // Monitoring & Analytics (5)
  'list_virtual_machine_metrics', 'list_events', 'list_alerts',
  'list_capacity', 'list_async_jobs',
  
  // Account & User Management (4)
  'list_accounts', 'list_users', 'list_domains', 'list_usage_records',
  
  // Infrastructure Discovery (2)
  'list_zones', 'list_templates',
  
  // System Administration (5)
  'list_hosts', 'list_clusters', 'list_storage_pools',
  'list_system_vms', 'list_service_offerings',
  
  // Security & Compliance (4)
  'list_ssh_key_pairs', 'create_ssh_key_pair',
  'list_security_groups', 'create_security_group_rule'
];

// Required CloudStack client methods
const REQUIRED_CLIENT_METHODS = [
  'listVirtualMachines', 'deployVirtualMachine', 'startVirtualMachine',
  'stopVirtualMachine', 'rebootVirtualMachine', 'destroyVirtualMachine',
  'scaleVirtualMachine', 'migrateVirtualMachine', 'resetPasswordForVirtualMachine',
  'changeServiceForVirtualMachine', 'listVolumes', 'createVolume',
  'attachVolume', 'detachVolume', 'resizeVolume', 'createSnapshot',
  'listSnapshots', 'listNetworks', 'createNetwork', 'listPublicIpAddresses',
  'associateIpAddress', 'enableStaticNat', 'createFirewallRule',
  'listLoadBalancerRules', 'listVirtualMachineMetrics', 'listEvents',
  'listAlerts', 'listCapacity', 'listAsyncJobs', 'listAccounts',
  'listUsers', 'listDomains', 'listUsageRecords', 'listZones',
  'listTemplates', 'listServiceOfferings', 'listHosts', 'listClusters',
  'listStoragePools', 'listSystemVms', 'listSSHKeyPairs',
  'createSSHKeyPair', 'listSecurityGroups', 'authorizeSecurityGroupIngress'
];

/**
 * Main validation function
 */
async function validateFunctions() {
  console.log('🧪 CloudStack MCP Server Function Validation\n');
  console.log('=' .repeat(60) + '\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Test 1: CloudStack Client Methods
    await runTest(results, 'CloudStack Client Methods', testCloudStackClient);

    // Test 2: MCP Server Tool Definitions
    await runTest(results, 'MCP Server Tool Definitions', testMCPServerTools);

    // Test 3: Documentation Accuracy
    await runTest(results, 'Documentation Accuracy', testDocumentation);

    // Test 4: Build Artifacts
    await runTest(results, 'Build Artifacts', testBuildArtifacts);

    // Test 5: Function Count Validation
    await runTest(results, 'Function Count Validation', testFunctionCounts);

    // Display final results
    displayResults(results);

  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    process.exit(1);
  }
}

/**
 * Runs a single test and records the result
 */
async function runTest(results, testName, testFunction) {
  console.log(`📋 Test: ${testName}`);
  
  try {
    const testResult = await testFunction();
    results.passed++;
    results.tests.push({ name: testName, status: 'PASSED', details: testResult });
    console.log(`✅ ${testName}: PASSED`);
    if (testResult) {
      console.log(`   ${testResult}`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ ${testName}: FAILED`);
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Test 1: Verify CloudStack Client has all required methods
 */
function testCloudStackClient() {
  const testConfig = {
    apiUrl: 'http://test.example.com/client/api',
    apiKey: 'test-key',
    secretKey: 'test-secret'
  };
  
  const client = new CloudStackClient(testConfig);
  const missingMethods = [];
  
  REQUIRED_CLIENT_METHODS.forEach(method => {
    if (typeof client[method] !== 'function') {
      missingMethods.push(method);
    }
  });
  
  if (missingMethods.length > 0) {
    throw new Error(`Missing methods: ${missingMethods.join(', ')}`);
  }
  
  return `All ${REQUIRED_CLIENT_METHODS.length} required methods present`;
}

/**
 * Test 2: Verify MCP server tool definitions and handlers
 */
function testMCPServerTools() {
  const serverContent = readFileSync(CONFIG.FILES.SERVER, 'utf8');
  const missingTools = [];
  const missingHandlers = [];
  
  EXPECTED_TOOLS.forEach(tool => {
    if (!serverContent.includes(`name: '${tool}'`)) {
      missingTools.push(tool);
    }
    
    if (!serverContent.includes(`case '${tool}':`)) {
      missingHandlers.push(tool);
    }
  });
  
  if (missingTools.length > 0) {
    throw new Error(`Missing tool definitions: ${missingTools.join(', ')}`);
  }
  
  if (missingHandlers.length > 0) {
    throw new Error(`Missing tool handlers: ${missingHandlers.join(', ')}`);
  }
  
  return `All ${EXPECTED_TOOLS.length} tools defined and handled`;
}

/**
 * Test 3: Verify README documentation accuracy
 */
function testDocumentation() {
  const readmeContent = readFileSync(CONFIG.FILES.README, 'utf8');
  const errors = [];
  
  // Check total function count
  if (!readmeContent.includes(`## Available Tools (${CONFIG.TOTAL_EXPECTED_FUNCTIONS} Tools)`)) {
    errors.push(`Incorrect total tool count in README`);
  }
  
  // Check category counts
  Object.entries(CONFIG.CATEGORIES).forEach(([category, count]) => {
    const categoryPattern = new RegExp(`### .*${category}.*\\(${count} Tools\\)`, 'i');
    if (!categoryPattern.test(readmeContent)) {
      errors.push(`Incorrect count for ${category}: expected ${count} tools`);
    }
  });
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return `Documentation accurately reflects ${CONFIG.TOTAL_EXPECTED_FUNCTIONS} functions across ${Object.keys(CONFIG.CATEGORIES).length} categories`;
}

/**
 * Test 4: Verify build artifacts exist
 */
function testBuildArtifacts() {
  const missingFiles = [];
  
  Object.values(CONFIG.FILES).forEach(file => {
    if (file.startsWith('build/')) {
      try {
        readFileSync(file);
      } catch {
        missingFiles.push(file);
      }
    }
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Missing build files: ${missingFiles.join(', ')}`);
  }
  
  return `All required build artifacts present`;
}

/**
 * Test 5: Validate function counts match expectations
 */
function testFunctionCounts() {
  const errors = [];
  
  // Verify total count matches expected tools array
  if (EXPECTED_TOOLS.length !== CONFIG.TOTAL_EXPECTED_FUNCTIONS) {
    errors.push(`Expected tools array length (${EXPECTED_TOOLS.length}) doesn't match total (${CONFIG.TOTAL_EXPECTED_FUNCTIONS})`);
  }
  
  // Verify category counts sum to total
  const categorySum = Object.values(CONFIG.CATEGORIES).reduce((sum, count) => sum + count, 0);
  if (categorySum !== CONFIG.TOTAL_EXPECTED_FUNCTIONS) {
    errors.push(`Category counts sum (${categorySum}) doesn't match total (${CONFIG.TOTAL_EXPECTED_FUNCTIONS})`);
  }
  
  // Check for duplicate tool names
  const uniqueTools = new Set(EXPECTED_TOOLS);
  if (uniqueTools.size !== EXPECTED_TOOLS.length) {
    errors.push(`Duplicate tool names detected`);
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return `Function counts validated: ${CONFIG.TOTAL_EXPECTED_FUNCTIONS} total across ${Object.keys(CONFIG.CATEGORIES).length} categories`;
}

/**
 * Display comprehensive test results
 */
function displayResults(results) {
  console.log('=' .repeat(60));
  console.log('📊 VALIDATION RESULTS');
  console.log('=' .repeat(60));
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log(`\n✅ ${results.passed} tests completed successfully`);
    console.log(`\n🚀 CloudStack MCP Server is ready for deployment!`);
    
    console.log('\n📋 Summary:');
    results.tests.forEach(test => {
      console.log(`   ✅ ${test.name}: ${test.details || 'PASSED'}`);
    });
    
  } else {
    console.log('❌ VALIDATION FAILED!');
    console.log(`\n❌ ${results.failed} test(s) failed`);
    console.log(`✅ ${results.passed} test(s) passed`);
    
    console.log('\n📋 Test Results:');
    results.tests.forEach(test => {
      if (test.status === 'PASSED') {
        console.log(`   ✅ ${test.name}: ${test.details || 'PASSED'}`);
      } else {
        console.log(`   ❌ ${test.name}: ${test.error}`);
      }
    });
    
    process.exit(1);
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Run validation if this script is executed directly
validateFunctions().catch(error => {
  console.error('💥 Validation script error:', error);
  process.exit(1);
});