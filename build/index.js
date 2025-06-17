#!/usr/bin/env node
import dotenv from 'dotenv';
// Load environment variables first - try multiple paths
dotenv.config();
dotenv.config({ path: '.env' });
dotenv.config({ path: '../.env' });
// Debug: check if variables are loaded
if (!process.env.CLOUDSTACK_API_URL) {
    console.error('Environment variables not loaded. Current working directory:', process.cwd());
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('CLOUDSTACK')));
}
// Then import and start the server
import './server.js';
//# sourceMappingURL=index.js.map