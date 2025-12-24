import { openai } from '@ai-sdk/openai';
import { streamText, type ToolSet, convertToModelMessages, type UIMessage } from 'ai';
import { getMCPClientAndTools } from '@/lib/mcp-client-cache';
import { LLM_CONFIG } from '@/lib/llm-config';
import { CHAT_CONFIG } from '@/lib/ui-config';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Get cached MCP client and tools (initialized once at server startup)
    const { client: mcpClient, tools } = await getMCPClientAndTools();

    const hasTools = tools && Object.keys(tools).length > 0;

    // Add system message when tools are available
    const systemMessage = hasTools && tools
      ? 'You are a helpful AI assistant with access to the following tools: ' +
        Object.keys(tools).join(', ') +
        '. Use these tools when appropriate to help the user. For requirements-related tasks, use the requirements analyst tools to guide the conversation.'
      : 'You are a helpful AI assistant.';

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: openai(LLM_CONFIG.model),
      system: systemMessage,
      messages: await convertToModelMessages(messages),
      ...(hasTools ? { tools, maxSteps: CHAT_CONFIG.maxSteps } : {}),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
