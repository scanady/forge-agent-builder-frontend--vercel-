import fs from 'fs';
import path from 'path';
import { MCPConfig } from '@/types/mcp';

let cachedConfig: MCPConfig | null = null;

export function loadMCPConfig(): MCPConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = process.env.MCP_CONFIG_PATH || 'mcp.config.json';
  const fullPath = path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`MCP configuration file not found at: ${fullPath}`);
  }

  const configContent = fs.readFileSync(fullPath, 'utf-8');
  cachedConfig = JSON.parse(configContent);

  return cachedConfig as MCPConfig;
}
