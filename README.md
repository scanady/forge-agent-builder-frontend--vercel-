# Forge Agent Builder Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **modern AI chatbot frontend** built with **Next.js** 15 and **React** 19, powered by **Vercel AI SDK** and **OpenAI API**. Seamlessly **integrates with Model Context Protocol (MCP) servers** for extensible tool support, enabling AI agents to interact with external tools and data sources.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Commands](#commands)
- [Technologies Used](#technologies-used)
- [Development Notes](#development-notes)

## Features

- 🤖 **AI-Powered Chatbot**: Built with AI for intelligent conversations
- 🔌 **MCP Server Integration**: Connect with Model Context Protocol servers for extensible tool support
- ⚡ **Real-Time Streaming**: Message responses stream in real-time for responsive UX
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 🛠️ **Configurable**: JSON-based configuration for MCP servers and LLM settings
- 📦 **Production-Ready**: Built on Next.js 15 with React 19 and TypeScript
- 💾 **Stateful Conversations**: Maintain conversation history with chat management features
- 🔧 **Tool Support**: AI can invoke external tools through MCP servers

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- OpenAI API key
- (Optional) An MCP server for extended functionality

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/scanady/forge-agent-builder-frontend.git
cd forge-agent-builder-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root with your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
OPENAI_API_KEY=your_openai_api_key_here
MCP_CONFIG_PATH=mcp.config.json
```

### Step 4: Configure MCP Server (Optional)

If you want to use MCP tools, configure your server in `mcp.config.json`:

```json
{
  "mcpServers": {
    "requirements-analyst": {
      "transport": "streamable-http",
      "url": "http://localhost:8000/mcp",
      "timeout": 120000,
      "description": "Requirements Analyst - MCP Server for requirements elicitation and analysis"
    }
  },
  "defaultServer": "requirements-analyst"
}
```

## Usage

Start the application in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can now:

- Send messages and receive AI-powered responses
- View real-time streaming of responses
- Start new conversations using the sidebar
- Clear conversation history as needed

For production deployment:

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `MCP_CONFIG_PATH` | Path to MCP configuration file | `mcp.config.json` |

### LLM Configuration

Edit [lib/llm-config.ts](lib/llm-config.ts) to customize the language model:

```typescript
export const LLM_CONFIG = {
  model: 'gpt-5-mini',
  displayName: 'GPT-5 Mini',
} as const;
```

## Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code with ESLint
npm run lint
```

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | React framework with App Router for server-side rendering |
| **React 19** | UI library for building interactive components |
| **TypeScript** | Type-safe JavaScript for better development experience |
| **Vercel AI SDK** | SDK for AI integration and streaming responses |
| **OpenAI** | GPT-5 Mini language model for conversational AI |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **Model Context Protocol** | Standard protocol for AI-tool integration |
| **Radix UI** | Headless UI components for accessibility |
| **React Markdown** | Markdown rendering with GitHub Flavored Markdown support |

## Development Notes

### Extending MCP Capabilities

1. Create or configure your MCP server
2. Update [mcp.config.json](mcp.config.json) with the server details
3. The tools are automatically discovered and made available to the AI

---

**Current Branch**: `master` | **Default Branch**: `main`

For more information, see [docs/MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md).
