import { createMCPClient } from '@ai-sdk/mcp';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { ToolSet } from 'ai';
import { loadMCPConfig } from '@/lib/mcp-config';
import type { MCPTransport } from '@/types/mcp';

interface MCPClientCache {
  client: Awaited<ReturnType<typeof createMCPClient>> | null;
  tools: ToolSet | null;
  initialized: boolean;
  error: Error | null;
}

// Singleton cache for MCP client and tools across requests
let cache: MCPClientCache = {
  client: null,
  tools: null,
  initialized: false,
  error: null,
};

export async function getMCPClientAndTools(): Promise<{
  client: Awaited<ReturnType<typeof createMCPClient>> | null;
  tools: ToolSet | null;
}> {
  // Return cached result if already initialized
  if (cache.initialized) {
    return {
      client: cache.client,
      tools: cache.tools,
    };
  }

  try {
    const config = loadMCPConfig();
    const serverName = config.defaultServer;

    if (!serverName) {
      cache.initialized = true;
      return { client: null, tools: null };
    }

    const serverConfig = config.mcpServers[serverName];
    if (!serverConfig) {
      cache.initialized = true;
      return { client: null, tools: null };
    }

    console.log(`Connecting to MCP server: ${serverName}`);

    let mcpClient: Awaited<ReturnType<typeof createMCPClient>>;

    // Map streamable-http to http for the SDK, or use stdio transport
    if (serverConfig.transport === 'streamable-http') {
      mcpClient = await createMCPClient({
        transport: {
          type: 'http',
          url: serverConfig.url!,
        },
      });
    } else if (serverConfig.transport === 'stdio') {
      mcpClient = await createMCPClient({
        transport: new StdioClientTransport({
          command: serverConfig.command!,
          args: serverConfig.args,
        }),
      });
    } else {
      throw new Error(`Unsupported transport type: ${serverConfig.transport}`);
    }

    // Get tools once and cache them
    const tools = await mcpClient.tools();
    console.log('Available MCP tools:', Object.keys(tools));

    cache.client = mcpClient;
    cache.tools = tools;
    cache.initialized = true;

    return { client: mcpClient, tools };
  } catch (error) {
    console.warn('Failed to connect to MCP server, continuing without tools:', error);
    cache.error = error instanceof Error ? error : new Error(String(error));
    cache.initialized = true;
    return { client: null, tools: null };
  }
}

export async function closeMCPClient(): Promise<void> {
  if (cache.client) {
    try {
      await cache.client.close();
    } catch (error) {
      console.error('Error closing MCP client:', error);
    }
  }
  // Reset cache
  cache = {
    client: null,
    tools: null,
    initialized: false,
    error: null,
  };
}
