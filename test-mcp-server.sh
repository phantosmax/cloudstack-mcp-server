#!/bin/bash

echo "🚀 Testing CloudStack MCP Server..."
echo ""
echo "This will test the MCP server using the stdio transport."
echo "The server will start and you can send test requests."
echo ""
echo "Example test request (copy and paste after server starts):"
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
echo ""
echo "To test a specific tool:"
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "list_zones"}, "id": 2}'
echo ""
echo "Press Ctrl+C to exit"
echo ""
echo "----------------------------------------"
echo ""

# Run the server
node build/index.js