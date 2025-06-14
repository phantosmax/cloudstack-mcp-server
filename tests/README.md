# CloudStack MCP Server Test Suite

This directory contains comprehensive tests for the CloudStack MCP Server, ensuring all 45 functions work correctly and the server is production-ready.

## Test Structure

```
tests/
├── README.md                    # This documentation
├── setup.ts                     # Test setup and global configuration
├── test-utils.ts               # Shared utilities and test helpers
├── cloudstack-client.test.ts   # CloudStack client unit tests
└── server.test.ts              # MCP server integration tests
```

## Test Categories

### 1. Unit Tests (`cloudstack-client.test.ts`)

Tests the CloudStack API client implementation:

- **Constructor & Configuration**: Validates client initialization
- **VM Management Functions**: Tests all 8 VM lifecycle operations
- **VM Advanced Operations**: Tests scaling, migration, password reset, service offering changes
- **Storage Management**: Tests volume operations and snapshots
- **Infrastructure Discovery**: Tests zone and template listing
- **Error Handling**: Validates proper error handling and response parsing
- **Signature Generation**: Ensures API requests are properly signed

### 2. Integration Tests (`server.test.ts`)

Tests the MCP server integration and function availability:

- **Function Availability**: Validates all 45 functions are present
- **CloudStack Client Integration**: Ensures all required client methods exist
- **Safety Mechanisms**: Verifies destructive operations require confirmation
- **Environment Configuration**: Tests environment variable validation
- **Function Categories**: Validates function organization and naming conventions

### 3. Test Utilities (`test-utils.ts`)

Provides shared testing infrastructure:

- **Mock Configuration**: Standardized CloudStack test configuration
- **Mock Responses**: Template responses for different API operations
- **Test Parameters**: Pre-defined parameters for testing various operations
- **Validation Helpers**: Utility functions for asserting API calls
- **Constants**: Function categories, counts, and expected tool names

## Running Tests

### Jest Tests (Preferred)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npx jest cloudstack-client.test.ts
```

### Custom Validation Script

```bash
# Run comprehensive validation
node scripts/validate-functions.js
```

## Test Configuration

### Environment Variables

Tests use mock environment variables:
```env
CLOUDSTACK_API_URL=http://test.example.com/client/api
CLOUDSTACK_API_KEY=test-api-key
CLOUDSTACK_SECRET_KEY=test-secret-key
CLOUDSTACK_TIMEOUT=30000
```

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## Function Coverage

All 45 CloudStack MCP Server functions are tested:

### ✅ VM Management (7 functions)
- `list_virtual_machines`
- `get_virtual_machine`
- `start_virtual_machine`
- `stop_virtual_machine`
- `reboot_virtual_machine`
- `destroy_virtual_machine`
- `deploy_virtual_machine`

### ✅ VM Advanced Operations (4 functions)
- `scale_virtual_machine`
- `migrate_virtual_machine`
- `reset_password_virtual_machine`
- `change_service_offering_virtual_machine`

### ✅ Storage Management (7 functions)
- `list_volumes`
- `create_volume`
- `attach_volume`
- `detach_volume`
- `resize_volume`
- `create_snapshot`
- `list_snapshots`

### ✅ Networking (7 functions)
- `list_networks`
- `create_network`
- `list_public_ip_addresses`
- `associate_ip_address`
- `enable_static_nat`
- `create_firewall_rule`
- `list_load_balancer_rules`

### ✅ Monitoring & Analytics (5 functions)
- `list_virtual_machine_metrics`
- `list_events`
- `list_alerts`
- `list_capacity`
- `list_async_jobs`

### ✅ Account & User Management (4 functions)
- `list_accounts`
- `list_users`
- `list_domains`
- `list_usage_records`

### ✅ Infrastructure Discovery (2 functions)
- `list_zones`
- `list_templates`

### ✅ System Administration (5 functions)
- `list_hosts`
- `list_clusters`
- `list_storage_pools`
- `list_system_vms`
- `list_service_offerings`

### ✅ Security & Compliance (4 functions)
- `list_ssh_key_pairs`
- `create_ssh_key_pair`
- `list_security_groups`
- `create_security_group_rule`

## Safety Testing

The test suite validates safety mechanisms for destructive operations:

- **Confirmation Required**: `destroy_virtual_machine`, `scale_virtual_machine`, `migrate_virtual_machine`, `reset_password_virtual_machine`, `detach_volume`, `resize_volume`
- **Parameter Validation**: All required parameters are validated
- **Error Handling**: Comprehensive error scenario testing

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

1. **Build Validation**: Ensures TypeScript compilation succeeds
2. **Unit Testing**: Validates individual component functionality
3. **Integration Testing**: Verifies component interactions
4. **Function Validation**: Custom script validates all functions are implemented
5. **Documentation Sync**: Ensures README matches actual implementation

## Writing New Tests

When adding new functions:

1. **Add to `test-utils.ts`**: Update `TOOL_NAMES` and function counts
2. **Add Unit Tests**: Test the CloudStack client method in `cloudstack-client.test.ts`
3. **Add Integration Tests**: Verify MCP tool definition in `server.test.ts`
4. **Update Validation Script**: Add to `scripts/validate-functions.js`
5. **Update Documentation**: Sync with README.md

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all imports use relative paths
2. **Mock Failures**: Verify mock data matches expected API responses
3. **Build Errors**: Run `npm run build` before running custom validation script
4. **Environment Issues**: Check that test environment variables are set correctly

### Debug Mode

Enable verbose test output:
```bash
npm test -- --verbose
```

Run tests with Node.js debug output:
```bash
DEBUG=* npm test
```

## Performance Considerations

- Tests use mocked CloudStack API calls to avoid network latency
- Test utilities provide pre-configured mock responses
- Custom validation script performs static analysis for speed
- Jest parallel execution is enabled for faster test runs