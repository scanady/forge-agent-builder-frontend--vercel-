export type MCPTransport = 'stdio' | 'streamable-http';

export interface MCPServerConfig {
  transport: MCPTransport;
  url?: string;
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  timeout?: number;
  description?: string;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
  defaultServer?: string;
}
