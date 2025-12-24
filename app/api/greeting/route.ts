import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { LLM_CONFIG } from '@/lib/llm-config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await generateText({
      model: openai(LLM_CONFIG.model),
      prompt: 'Provide one concise, catchy heading to start the chat with the user. This is for a chatbot user interface. Only return the heading. Do not include any additional text, formatting, or other details.',
    });

    return Response.json({ greeting: result.text });
  } catch (error) {
    console.error('Failed to generate greeting:', error);
    return Response.json(
      { greeting: 'Hello there!' },
      { status: 200 } // Return default greeting instead of error
    );
  }
}
