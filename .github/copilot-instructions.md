# Copilot Instructions for Next.js MCP Chatbot

## Core Principles

1. **Use AI SDK patterns exclusively.** Always use Vercel AI SDK's built-in patterns (`useChat`, `streamText`, `convertToModelMessages`, etc.) over custom implementations. Never create custom stream parsers, message state management, or API clients—the SDK handles all of this correctly and efficiently.

2. **Implement complete, working code.** Every code change must be complete and executable. When adding functionality that requires variables, imports, types, or dependencies, include ALL of them in the same change. Never reference undefined variables, missing imports, or nonexistent dependencies. Test logic mentally before implementing—if a variable is used, it must be declared; if a function is called, it must exist or be imported; if a hook is referenced, it must be initialized.

3. **Refactor over supplement.** Prioritize clean, maintainable code. When modifying functionality, refactor existing code rather than adding workarounds. Remove obsolete logic, dead code, and unused imports immediately. Every change should leave the codebase cleaner than before.

4. **Fail gracefully.** MCP servers and streaming connections can fail. Always handle errors at boundaries, show meaningful feedback to users, and ensure resources (like MCP clients) are properly closed in all code paths.

5. **Type everything.** Leverage TypeScript fully—no `any` types, no implicit returns. MCP tool schemas flow through the system; strong typing catches integration issues at compile time.

6. **Single responsibility.** Each file and function should do one thing well. API routes handle HTTP concerns, lib modules handle business logic, types stay in `types/`. Resist the urge to bundle unrelated functionality.

7. **Keep dependencies minimal.** Evaluate necessity before adding packages. This project uses Vercel AI SDK for MCP—prefer its patterns over introducing competing abstractions.

8. **Externalize configuration.** LLM model names, API endpoints, timeouts, and other tunables belong in configuration files (like `mcp.config.json`) or environment variables—never hardcoded in source files.

## Architecture Overview

This is a **Next.js 15 + React 19** AI chatbot that connects to MCP (Model Context Protocol) servers via the **Vercel AI SDK Core** (`ai`) and **AI SDK UI** (`@ai-sdk/react`) libraries. The core data flow:

1. Client ([app/page.tsx](app/page.tsx)) sends messages to `/api/chat` with streaming response handling
2. API route ([app/api/chat/route.ts](app/api/chat/route.ts)) loads MCP config, creates client, discovers tools, and streams OpenAI responses
3. MCP configuration loaded from `mcp.config.json` via [lib/mcp-config.ts](lib/mcp-config.ts)

## Commands

```bash
npm run dev    # Development at localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

## Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=<key>
MCP_CONFIG_PATH=mcp.config.json  # optional, defaults to this
```

## Code Conventions

- **Client-side**: Always use `useChat` hook from `@ai-sdk/react` with `DefaultChatTransport` for chat interfaces. Never implement custom message state management or streaming parsers.
- **API routes**: 
  - Accept `UIMessage[]` and use `convertToModelMessages()` to transform for LLM
  - Return `toUIMessageStreamResponse()` for proper AI SDK UI streaming format
  - Use `export const runtime = 'nodejs'` and `maxDuration = 120` for long MCP operations
- **Error handling**: Return JSON with `{ error, details }` structure in API routes
- **Styling**: Tailwind CSS only, no component libraries
- **TypeScript**: Strict mode, use `@/` alias for imports from lib/types directories

## AI SDK UI Patterns

**Client Side (page.tsx):**
```typescript
const { messages, sendMessage, status, error } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});

// Render messages with message.parts
messages.map(message => 
  message.parts.map(part => 
    part.type === 'text' && <p>{part.text}</p>
  )
)
```

**Server Side (API route):**
```typescript
const { messages }: { messages: UIMessage[] } = await req.json();
const result = streamText({
  model: openai(LLM_CONFIG.model),
  system: 'Your system prompt',
  messages: await convertToModelMessages(messages),
  tools,
  maxSteps: 10,
});
return result.toUIMessageStreamResponse();
```

## When Adding New MCP Features

1. Add transport/config types to `types/mcp.ts`
2. Update transport handling switch in `app/api/chat/route.ts`
3. MCP tools are auto-discovered via `mcpClient.tools()` - no manual registration needed
4. Set `maxSteps` in `streamText()` to control multi-step tool usage (currently 10)
