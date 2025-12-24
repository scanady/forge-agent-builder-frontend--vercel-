# Next.js MCP Chatbot

A Next.js AI chatbot application powered by the Vercel AI SDK with Model Context Protocol (MCP) server integration.

## Features

- 🤖 AI-powered chatbot using OpenAI GPT-4
- 🔌 MCP server integration ready (configurable for extensible tool support)
- ⚡ Real-time streaming responses
- 🎨 Modern UI with Tailwind CSS
- 🛠️ Configurable via JSON configuration file
- 📦 Built with Next.js 15 and React 19

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key
- An MCP server (optional - see MCP Integration section)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
MCP_CONFIG_PATH=mcp.config.json
```

3. Configure your MCP server in `mcp.config.json`:

```json
{
  "mcpServers": {
    "example-server": {
      "command": "node",
      "args": ["path/to/your/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      },
      "description": "Example MCP server configuration"
    }
  },
  "defaultServer": "example-server"
}
```

### Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the chatbot interface.

## MCP Integration

### What is MCP?

Model Context Protocol (MCP) is a standard for connecting AI applications with external tools and data sources. This chatbot is designed to integrate with MCP servers to extend its capabilities.

### Setting Up MCP Tools

The application currently runs without MCP tools but is fully prepared for integration. To enable MCP tools:

1. **Configure your MCP server** in `mcp.config.json` with the correct command and arguments
2. **Enable MCP integration** in [app/api/chat/route.ts](app/api/chat/route.ts#L9-L13) by uncommenting the MCP client code:

```typescript
// Uncomment these lines to enable MCP:
const mcpClient = await getMCPClient();
const mcpTools = await mcpClient.listTools();
```

3. **Add tool conversion logic** to convert MCP tools to Vercel AI SDK format (see the commented code in the route file)

### Example MCP Server

You can create a simple MCP server or use existing ones. Here's a basic example structure:

```javascript
// Simple MCP server that responds to JSON-RPC requests
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    
    if (request.method === 'initialize') {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'example-server', version: '1.0.0' }
        }
      }));
    } else if (request.method === 'tools/list') {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: [
            {
              name: 'get_weather',
              description: 'Get the weather for a location',
              inputSchema: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'The city name' }
                },
                required: ['location']
              }
            }
          ]
        }
      }));
    }
  } catch (e) {
    console.error('Error:', e);
  }
});
```

## MCP Configuration

The application uses a `mcp.config.json` file to configure MCP servers. Each server configuration includes:

- **command**: The command to start the MCP server (e.g., `node`, `python`, `npx`)
- **args**: Command-line arguments for the server
- **env**: Environment variables to pass to the server
- **description**: Human-readable description of the server

You can configure multiple MCP servers and specify which one to use as the default.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Chat API endpoint (MCP integration point)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main chat interface
│   └── globals.css            # Global styles
├── lib/
│   ├── mcp-client.ts          # MCP client implementation
│   └── mcp-config.ts          # MCP configuration loader
├── types/
│   └── mcp.ts                 # TypeScript types for MCP
├── mcp.config.json            # MCP server configuration
├── .env.local                 # Environment variables (create from .env.example)
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Project dependencies
```

## How It Works

1. **User Interface**: React-based chat interface with real-time message streaming
2. **API Route**: Next.js API route handles chat requests
3. **AI Processing**: Messages are sent to OpenAI's GPT-4 via the Vercel AI SDK
4. **MCP Integration** (when enabled): 
   - Connects to configured MCP servers
   - Fetches available tools
   - AI can call tools through the MCP server
   - Results are incorporated into the conversation
5. **Streaming Response**: Responses stream back to the UI in real-time

## Technologies Used

- **Next.js 15**: React framework with App Router
- **Vercel AI SDK**: For AI integration and streaming
- **OpenAI**: GPT-4 language model
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Model Context Protocol**: For extensible tool integration

## Development Notes

### Adding MCP Tool Support

To fully enable MCP tool support:

1. Uncomment the MCP client code in `app/api/chat/route.ts`
2. Add the tool conversion logic (see the git history for the full implementation)
3. Install the `zod` package if not already installed (already in package.json)
4. Test with your MCP server

### Debugging MCP Connections

- Check the server console for MCP server error messages
- Verify your MCP server is responding to JSON-RPC requests
- Test your MCP server independently before integrating

## License

MIT
