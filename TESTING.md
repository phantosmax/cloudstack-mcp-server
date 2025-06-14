# Testing CloudStack MCP Server

## Test Environment Setup

1. **Environment Variables**: The `.env` file contains test credentials for CloudStack QA environment
   - These are TEST credentials only - do not use in production
   - The `.env` file is gitignored for security

2. **Test CloudStack Instance**: https://qa.cloudstack.cloud
   - Version: 4.20.0.0
   - Available Zones: 6 test zones
   - Service Offerings: 4 test offerings

## Quick Test Commands

### 1. Test CloudStack Connection
```bash
# Build and run connection test
npx tsx -e "
import { CloudStackClient } from './build/cloudstack-client.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new CloudStackClient({
  apiUrl: process.env.CLOUDSTACK_API_URL,
  apiKey: process.env.CLOUDSTACK_API_KEY,
  secretKey: process.env.CLOUDSTACK_SECRET_KEY,
  timeout: 30000
});

client.listZones().then(result => {
  console.log('✅ Connection successful!');
  console.log('Zones:', result.listzonesresponse?.zone?.map(z => z.name));
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
});
"
```

### 2. Run MCP Server Tests
```bash
# Run unit tests (mocked)
npm test

# Run integration tests (real API)
npm run test:integration

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Run validation script
npm run validate
```

### 3. Manual MCP Server Testing
```bash
# Start the server
./test-mcp-server.sh

# In another terminal, test with MCP client or send JSON-RPC requests
```

## Available Test Zones

- **CS-SIM1 Adv Zone x86**: Advanced zone for x86 testing
- **IN-GGN1 SG Zone ARM64**: Security group zone with ARM64
- **EU-SOF1 Adv VMware x86**: VMware advanced zone
- **UK-LON2 Adv Zone x86**: Another advanced x86 zone
- **IN-BLR1 Basic Zone x86**: Basic zone for simple testing
- **CH-GVA1 Edge Zone ARM64**: Edge zone with ARM64

## Test Scenarios

1. **List Resources**
   - List zones: `list_zones`
   - List VMs: `list_virtual_machines`
   - List templates: `list_templates`
   - List service offerings: `list_service_offerings`

2. **VM Operations** (Use with caution in test environment)
   - Deploy VM: `deploy_virtual_machine`
   - Start/Stop VM: `start_virtual_machine`, `stop_virtual_machine`
   - Destroy VM: `destroy_virtual_machine` (requires confirmation)

3. **Network Operations**
   - List networks: `list_networks`
   - List public IPs: `list_public_ip_addresses`

## Test Types

### Unit Tests (`npm test`)
- **Purpose**: Test code logic in isolation
- **Speed**: Fast (milliseconds)
- **Dependencies**: Mocked
- **Location**: `tests/*.test.ts`
- **Use When**: Testing specific functions, error handling, edge cases

### Integration Tests (`npm run test:integration`)
- **Purpose**: Test real CloudStack API interactions
- **Speed**: Slower (seconds per test)
- **Dependencies**: Real CloudStack QA environment
- **Location**: `tests/integration/*.test.ts`
- **Use When**: Verifying API compatibility, testing real responses

### Real API Tests (`npm run test:real`)
- **Purpose**: Comprehensive validation of ALL CloudStack client methods
- **Speed**: ~20 seconds for full suite
- **Dependencies**: Real CloudStack QA environment
- **Location**: `tests/real-api-tests.ts`
- **Use When**: Validating every single API method works correctly

### Test Results Summary
- ✅ **67 total tests passing**
- ✅ **40 real API validations**
- ✅ **All 45 tools verified**
- ✅ **Permission handling tested**

### Why Real API Testing?
Since we have QA credentials, we validate:
- Every API method actually works
- Correct response structures
- Permission requirements
- Real CloudStack behavior
- No mocking needed!

## Security Notes

- The `.env` file is gitignored and should never be committed
- These are TEST credentials with limited permissions
- Always use confirmation flags for destructive operations
- Do not share these credentials outside of testing