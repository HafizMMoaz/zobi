#!/usr/bin/env node


/**
 * Zobi MCP (Model Context Protocol) Server Runner
 *
 * OVERVIEW:
 * This Node.js wrapper script provides an npx-compatible entry point for the Zobi MCP service.
 * It acts as a bridge between npm/npx tooling and the Python-based MCP server implementation.
 *
 * FUNCTIONALITY:
 * - Detects and validates Python environment and Zobi installation
 * - Supports both stdio (Claude Desktop integration) and HTTP transport modes
 * - Handles command-line argument parsing and environment variable configuration
 * - Manages Python subprocess lifecycle with proper signal handling
 * - Provides comprehensive help documentation and error diagnostics
 *
 * USAGE PATTERNS (DEVELOPMENT - Not yet published to npm):
 * - Direct execution: node zobi/mcp_service/bin/zobi-mcp.js --stdio
 * - HTTP server: node zobi/mcp_service/bin/zobi-mcp.js --http --port 6000
 * - Development debugging: node zobi/mcp_service/bin/zobi-mcp.js --debug
 *
 * FUTURE USAGE (Once published to npm registry):
 * - npx @zobi.dev/mcp-server --stdio
 * - npx @zobi.dev/mcp-server --http --port 6000
 *
 * ARCHITECTURE:
 * This wrapper enables the MCP service to be distributed as an npm package while
 * maintaining the core Python implementation, bridging Node.js tooling with Python execution.
 *
 * PACKAGE STATUS (as of 2025-01-10):
 * - NOT YET PUBLISHED to npm registry
 * - Package name reserved: @zobi.dev/mcp-server
 * - Requires package.json with proper metadata and "bin" field for npx execution
 * - Will need to be published to npm registry before npx commands work
 *
 * TODO FOR NPM PUBLISHING:
 * 1. Create package.json with name "@zobi.dev/mcp-server"
 * 2. Add "bin" field pointing to this file
 * 3. Set version, description, repository, license
 * 4. Run npm publish with appropriate access rights
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const isStdio = args.includes('--stdio') || process.env.FASTMCP_TRANSPORT === 'stdio';
const isDebug = args.includes('--debug') || process.env.MCP_DEBUG === '1';
const showHelp = args.includes('--help') || args.includes('-h');

// Configuration
const DEFAULT_PORT = process.env.MCP_PORT || '5008';
const DEFAULT_HOST = process.env.MCP_HOST || '127.0.0.1';

// Show help
if (showHelp) {
    console.log(`
Zobi MCP Server

Usage:
  Development: node zobi/mcp_service/bin/zobi-mcp.js [options]
  Future (npm): npx @zobi.dev/mcp-server [options]

Options:
  --stdio       Run in stdio mode for direct Claude Desktop integration
  --http        Run in HTTP mode (default)
  --port PORT   HTTP port to bind to (default: ${DEFAULT_PORT})
  --host HOST   HTTP host to bind to (default: ${DEFAULT_HOST})
  --debug       Enable debug mode
  --help        Show this help message

Environment Variables:
  FASTMCP_TRANSPORT     Transport mode (stdio or http)
  MCP_PORT              HTTP port (default: ${DEFAULT_PORT})
  MCP_HOST              HTTP host (default: ${DEFAULT_HOST})
  MCP_DEBUG             Enable debug (set to 1)
  PYTHONPATH            Python path including Zobi root
  ZOBI_CONFIG_PATH  Path to zobi_config.py

Examples (Development):
  # Run in stdio mode for Claude Desktop
  node zobi/mcp_service/bin/zobi-mcp.js --stdio

  # Run in HTTP mode on custom port
  node zobi/mcp_service/bin/zobi-mcp.js --http --port 6000

  # Run with debug output
  node zobi/mcp_service/bin/zobi-mcp.js --debug

  # Or use the Python CLI directly:
  zobi mcp run --host 127.0.0.1 --port 6000
`);
    process.exit(0);
}

// Find Zobi root directory
function findZobiRoot() {
    // Start from the mcp_service directory
    let currentDir = path.resolve(__dirname, '..');

    // Walk up until we find the zobi root (contains setup.py or pyproject.toml)
    while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(path.join(currentDir, 'pyproject.toml')) ||
            fs.existsSync(path.join(currentDir, 'setup.py'))) {
            // Check if it's actually the zobi root (has zobi directory)
            if (fs.existsSync(path.join(currentDir, 'zobi'))) {
                return currentDir;
            }
        }
        currentDir = path.dirname(currentDir);
    }

    // Fallback to environment variable
    if (process.env.PYTHONPATH) {
        return process.env.PYTHONPATH;
    }

    throw new Error('Could not find Zobi root directory. Please set PYTHONPATH environment variable.');
}

// Find Python executable
function findPython() {
    // Check for virtual environment in common locations
    const zobiRoot = findZobiRoot();
    const venvPaths = [
        path.join(zobiRoot, 'venv', 'bin', 'python'),
        path.join(zobiRoot, '.venv', 'bin', 'python'),
        path.join(zobiRoot, 'venv', 'Scripts', 'python.exe'),
        path.join(zobiRoot, '.venv', 'Scripts', 'python.exe'),
    ];

    for (const venvPath of venvPaths) {
        if (fs.existsSync(venvPath)) {
            return venvPath;
        }
    }

    // Check if python3 is available
    try {
        execSync('python3 --version', { stdio: 'ignore' });
        return 'python3';
    } catch (e) {
        // Fall back to python
        return 'python';
    }
}

// Check Python and Zobi installation
function checkEnvironment() {
    const python = findPython();
    const zobiRoot = findZobiRoot();

        console.error(`Using Python: ${python}`);
        console.error(`Zobi root: ${zobiRoot}`);

    // Check if Zobi is installed
    try {
        execSync(`${python} -c "import zobi"`, {
            env: { ...process.env, PYTHONPATH: zobiRoot },
            stdio: 'ignore'
        });
    } catch (e) {
        console.error(`
Error: Zobi is not installed or not accessible.

Please ensure:
1. You have activated your virtual environment
2. Zobi is installed (pip install -e .)
3. PYTHONPATH is set correctly

Current PYTHONPATH: ${zobiRoot}
`);
        process.exit(1);
    }

    return { python, zobiRoot };
}

// Main execution
function main() {
    const { python, zobiRoot } = checkEnvironment();

    // Prepare environment variables
    const env = {
        ...process.env,
        PYTHONPATH: zobiRoot,
        FASTMCP_TRANSPORT: isStdio ? 'stdio' : 'http',
    };

    if (!env.ZOBI_CONFIG_PATH) {
        const configPath = path.join(zobiRoot, 'zobi_config.py');
        if (fs.existsSync(configPath)) {
            env.ZOBI_CONFIG_PATH = configPath;
        }
    }

    if (isDebug) {
        env.MCP_DEBUG = '1';
    }

    // Prepare command and arguments
    let pythonArgs;
    if (isStdio) {
        console.error('Starting Zobi MCP server in STDIO mode...');
        pythonArgs = ['-m', 'zobi.mcp_service'];
    } else {
        console.error(`Starting Zobi MCP server in HTTP mode on ${DEFAULT_HOST}:${DEFAULT_PORT}...`);

        // Parse port and host from arguments
        const portIndex = args.indexOf('--port');
        const port = portIndex !== -1 && args[portIndex + 1] ? args[portIndex + 1] : DEFAULT_PORT;

        const hostIndex = args.indexOf('--host');
        const host = hostIndex !== -1 && args[hostIndex + 1] ? args[hostIndex + 1] : DEFAULT_HOST;

        pythonArgs = [
            '-m', 'zobi',
            'mcp', 'run',
            '--host', host,
            '--port', port
        ];

        if (isDebug) {
            pythonArgs.push('--debug');
        }
    }

    // Spawn the Python process
    const pythonProcess = spawn(python, pythonArgs, {
        env,
        stdio: isStdio ? ['inherit', 'inherit', 'inherit'] : 'inherit',
        cwd: zobiRoot
    });

    // Handle process events
    pythonProcess.on('error', (err) => {
        console.error('Failed to start MCP server:', err);
        process.exit(1);
    });

    pythonProcess.on('exit', (code, signal) => {
        if (signal) {
            console.error(`MCP server terminated by signal: ${signal}`);
        } else if (code !== 0) {
            console.error(`MCP server exited with code: ${code}`);
        }
        process.exit(code || 0);
    });

    // Handle termination signals
    process.on('SIGINT', () => {
        pythonProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        pythonProcess.kill('SIGTERM');
    });
}

// Run the main function
main();
