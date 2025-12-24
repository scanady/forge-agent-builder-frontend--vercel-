export const LLM_CONFIG = {
  model: 'gpt-5-mini',
  displayName: 'GPT-5 Mini',
} as const;

export type LLMConfig = typeof LLM_CONFIG;
