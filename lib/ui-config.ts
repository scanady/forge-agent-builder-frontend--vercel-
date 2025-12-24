// UI Configuration
export const UI_CONFIG = {
  suggestedPrompts: [
    'Help me create functional software requirements',
    'I want to build a life insurance product management system. Help me with the requirements.',
  ],
  conversationTitleMaxLength: 30,
  user: {
    name: 'Guest',
    avatarColor: 'bg-green-500',
    avatarInitial: 'G',
  },
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
  maxSteps: 10,
  streamTimeout: 120000,
} as const;

export type UIConfig = typeof UI_CONFIG;
export type ChatConfig = typeof CHAT_CONFIG;
