# MCP Integration Guide

This document explains how to complete the MCP (Model Context Protocol) integration in this Next.js chatbot application.

## Current Status

The application has all the infrastructure for MCP integration:
- ✅ MCP client implementation (`lib/mcp-client.ts`)
- ✅ Configuration loader (`lib/mcp-config.ts`)
- ✅ Type definitions (`types/mcp.ts`)
- ✅ Configuration file (`mcp.config.json`)
- ⏸️ MCP tool integration (commented out in API route)

## Completing the Integration

To enable full MCP tool support, follow these steps:

### Step 1: Prepare Your MCP Server

Ensure your MCP server:
1. Responds to JSON-RPC 2.0 requests via stdin/stdout
2. Implements the `initialize` method
3. Implements the `tools/list` method
4. Implements the `tools/call` method
5. Returns responses in the correct format

### Step 2: Update the Configuration

Edit `mcp.config.json` with your server details:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-key-here"
      },
      "description": "My custom MCP server"
    }
  },
  "defaultServer": "my-server"
}
```

### Step 3: Enable MCP in the Chat Route

In `app/api/chat/route.ts`, uncomment and complete the MCP integration:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getMCPClient } from '@/lib/mcp-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get MCP client and available tools
    const mcpClient = await getMCPClient();
    const mcpTools = await mcpClient.listTools();

    // Convert MCP tools to Vercel AI SDK format
    const tools: Record<string, any> = {};
    
    for (const mcpTool of mcpTools) {
      const toolName = mcpTool.name;
      
      // Simple tool definition without execute function
      // The AI SDK will handle tool calling differently in v3+
      tools[toolName] = {
        description: mcpTool.description || `Tool: ${toolName}`,
        parameters: mcpTool.inputSchema,
      };
    }

    // Stream the response
    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
      // Note: Tool integration API may vary based on AI SDK version
      // Check the latest Vercel AI SDK documentation
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Step 4: Handle Tool Calls

The Vercel AI SDK v3+ uses a different approach for tool calling. You may need to:

1. Use the `onToolCall` callback in `streamText`
2. Manually handle tool execution
3. Return tool results back to the stream

Example pattern:

```typescript
const result = streamText({
  model: openai('gpt-4-turbo'),
  messages,
  onToolCall: async ({ toolName, args }) => {
    // Execute the tool via MCP
    const mcpResult = await mcpClient.callTool(toolName, args);
    // Return the result
    return mcpResult.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');
  },
});
```

## Testing the Integration

### 1. Test MCP Server Independently

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node path/to/server.js
```

Expected response:
```json
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","serverInfo":{...}}}
```

### 2. Test Tool Listing

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node path/to/server.js
```

Expected response with list of tools.

### 3. Run the Chatbot

```bash
npm run dev
```

Try asking the chatbot to use one of your tools.

## Troubleshooting

### MCP Server Not Connecting

- Check that the command and args in `mcp.config.json` are correct
- Verify the MCP server executable has proper permissions
- Check console output for error messages

### Tools Not Being Called

- Verify tool descriptions are clear and specific
- Check that the AI model supports function calling (GPT-4 does)
- Review the AI SDK documentation for the correct tool integration pattern

### Tool Execution Errors

- Validate tool parameter schemas match what your MCP server expects
- Check MCP server logs for error details
- Ensure tool results are returned in the expected format

## Reference Links

- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/protocol)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

## Example MCP Servers

You can find example MCP servers at:
- https://github.com/modelcontextprotocol/servers

Or create your own following the MCP specification.
