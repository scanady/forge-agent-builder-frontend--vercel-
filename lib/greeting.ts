import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { LLM_CONFIG } from '@/lib/llm-config';

export async function generateGreeting(): Promise<string> {
  try {
    const result = await generateText({
      model: openai(LLM_CONFIG.model),
      prompt: 'Provide one concise, catchy heading to start the chat with the user. This is for a chatbot user interface. Only return the heading. Do not include any additional text, formatting, or other details.',
    });
    return result.text;
  } catch (error) {
    console.error('Failed to generate greeting:', error);
    return 'Hello there!';
  }
}
