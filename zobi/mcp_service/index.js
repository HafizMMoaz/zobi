
/**
 * Zobi MCP Server
 *
 * Entry point for the MCP server when used as a Node.js module.
 */

const { spawn } = require('child_process');
const path = require('path');

class ZobiMCPServer {
    constructor(options = {}) {
        this.options = {
            transport: options.transport || 'http',
            host: options.host || '127.0.0.1',
            port: options.port || 5008,
            debug: options.debug || false,
            pythonPath: options.pythonPath || null,
            zobiRoot: options.zobiRoot || null,
            configPath: options.configPath || null,
        };
        this.process = null;
    }

    start() {
        const runner = require('./bin/zobi-mcp.js');
        // The bin script handles the execution
    }

    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}

module.exports = ZobiMCPServer;
