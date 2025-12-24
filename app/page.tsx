'use client';

import { useRef, useEffect, useState, useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { LLM_CONFIG } from '@/lib/llm-config';
import { UI_CONFIG } from '@/lib/ui-config';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// Helper function to convert JSON to markdown format (outside component for stability)
function jsonToMarkdown(obj: any): string {
  if (!obj || typeof obj !== 'object') return '';
  
  if (obj.greeting) return obj.greeting;
  if (obj.analysis) return obj.analysis;
  
  let markdown = '';
  Object.entries(obj).forEach(([key, value]) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    if (typeof value === 'string') {
      markdown += `**${label}:**\n${value}\n\n`;
    } else if (Array.isArray(value)) {
      markdown += `**${label}:**\n`;
      value.forEach((item: any) => {
        markdown += `- ${typeof item === 'string' ? item : JSON.stringify(item)}\n`;
      });
      markdown += '\n';
    } else {
      markdown += `**${label}:**\n${JSON.stringify(value)}\n\n`;
    }
  });
  return markdown;
}

// Memoized message part renderer
const MessagePartRenderer = memo(function MessagePartRenderer({ part, index }: { part: any; index: number }) {
  // Handle direct text parts
  if ('text' in part && part.text) {
    return (
      <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
        {part.text}
      </ReactMarkdown>
    );
  }

  // Handle tool outputs
  if (part.type === 'dynamic-tool' && 'output' in part && part.output) {
    const output = part.output as any;
    const toolName = 'toolName' in part ? part.toolName : 'Unknown Tool';
    const content = useMemo(() => {
      if (!output.content || !Array.isArray(output.content)) return null;
      return output.content.map((contentItem: any, contentIndex: number) => {
        if (contentItem.type === 'text' && contentItem.text) {
          try {
            const parsed = JSON.parse(contentItem.text);
            const markdown = jsonToMarkdown(parsed);
            return markdown ? (
              <ReactMarkdown key={`${index}-${contentIndex}`} remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            ) : null;
          } catch {
            return (
              <ReactMarkdown key={`${index}-${contentIndex}`} remarkPlugins={[remarkGfm]}>
                {contentItem.text}
              </ReactMarkdown>
            );
          }
        }
        return null;
      });
    }, [output, index]);

    return (
      <div key={index} className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-2.5 py-0.5">
          <span className="font-medium">🔧</span>
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{toolName}</code>
        </div>
        {content}
      </div>
    );
  }

  return null;
});

// Memoized message component
const MessageBubble = memo(function MessageBubble({ message }: { message: any }) {
  const partsContent = useMemo(() => {
    return message.parts?.map((part: any, index: number) => (
      <MessagePartRenderer key={index} part={part} index={index} />
    ));
  }, [message.parts]);

  return (
    <div className="flex gap-3">
      <Avatar
        size="sm"
        className={cn(
          'flex-shrink-0 mt-0.5',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        {message.role === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {message.role === 'user' ? 'You' : 'Assistant'}
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
          {partsContent}
        </div>
      </div>
    </div>
  );
});

interface Conversation {
  id: string;
  title: string;
  messages: any[];
}

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedMessagesRef = useRef<any[]>([]);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Extract requirements from messages
  const requirements = useMemo(() => {
    const reqs: string[] = [];
    messages.forEach((message) => {
      if (message.role === 'assistant' && message.parts) {
        message.parts.forEach((part: any) => {
          if (part.type === 'dynamic-tool' && part.toolName === 'discuss-requirements' && part.output?.content) {
            part.output.content.forEach((contentItem: any) => {
              if (contentItem.type === 'text' && contentItem.text) {
                try {
                  const parsed = JSON.parse(contentItem.text);
                  if (parsed.requirements && Array.isArray(parsed.requirements)) {
                    reqs.push(...parsed.requirements);
                  }
                } catch {
                  // Skip if not valid JSON
                }
              }
            });
          }
        });
      }
    });
    return reqs;
  }, [messages]);

  // Check if the last assistant message has visible content
  const lastAssistantHasContent = useMemo(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return false;
    if (!lastMsg.parts || lastMsg.parts.length === 0) return false;
    
    return lastMsg.parts.some((part: any) => {
      if ('text' in part && part.text && part.text.length > 0) return true;
      if (part.type === 'dynamic-tool' && 'output' in part && part.output) return true;
      return false;
    });
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming' || 
    (status === 'ready' && messages[messages.length - 1]?.role === 'assistant' && !lastAssistantHasContent);
  
  // Track progress indicator state changes
  useEffect(() => {
    if (isLoading) {
      console.log('[Progress Indicator] Appeared - status:', status, 'hasContent:', lastAssistantHasContent);
    } else if (status === 'ready' && messages.length > 0) {
      console.log('[Progress Indicator] Disappeared - status:', status, 'hasContent:', lastAssistantHasContent);
      console.log('[Response] Complete at', new Date().toISOString());
    }
  }, [isLoading, status, messages.length, lastAssistantHasContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only log and scroll when not streaming
    if (status !== 'streaming') {
      console.log('[Messages Changed]', {
        count: messages.length,
        status,
        lastMessage: messages[messages.length - 1]?.id
      });
      scrollToBottom();
    } else {
      // Log only when assistant response first appears during streaming
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant' && lastMsg.parts?.length > 0) {
        const hasContent = lastMsg.parts.some(p => 'text' in p && p.text?.length > 0);
        if (hasContent) {
          console.log('[Response] First content appeared');
        }
      }
    }
  }, [messages, status]);

  // Save messages to active conversation
  useEffect(() => {
    // Skip save entirely during streaming to avoid running every 25ms
    if (status === 'streaming') return;

    const startTime = performance.now();
    if (activeConversationId && messages.length > 0) {
      // Only save if messages actually changed (avoid saving same messages multiple times)
      // Use lightweight comparison: check if message count or last message ID changed
      const lastSaved = lastSavedMessagesRef.current;
      const shouldSave = messages.length !== lastSaved.length || 
        (messages.length > 0 && messages[messages.length - 1]?.id !== lastSaved[lastSaved.length - 1]?.id);
      
      if (shouldSave) {
        lastSavedMessagesRef.current = messages;
        
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            let title = c.title === 'New Chat' ? 'New Chat' : c.title;
            if (title === 'New Chat' && messages.length > 0) {
              const firstPart = messages[0]?.parts?.[0];
              if (firstPart && 'text' in firstPart) {
                title = firstPart.text.slice(0, 50) + (firstPart.text.length > 50 ? '...' : '');
              }
            }
            return { ...c, messages, title };
          }
          return c;
        }));
      }
    }
  }, [messages, activeConversationId, status]);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([]);
  };

  const switchConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setActiveConversationId(id);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status !== 'ready') return;

    // Create new conversation if none exists
    if (!activeConversationId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        messages: [],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }

    sendMessage({ text: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} className="border-r border-border">
        <SidebarHeader className="border-b border-border">
          <h1 className="text-base font-semibold flex-1">Conversations</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewConversation}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => activeConversationId && deleteConversation(activeConversationId)}
            disabled={!activeConversationId}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(true)}
            className="h-8 w-8"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4">
              Start a new conversation to see it here
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => switchConversation(conversation.id)}
                  className={cn(
                    'w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-accent/20',
                    activeConversationId === conversation.id &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-xs">{conversation.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-border">
          <div className="flex items-center gap-3 w-full p-2.5 rounded-md bg-secondary/30">
            <div className={cn("h-8 w-8 rounded-md flex items-center justify-center text-xs font-semibold", UI_CONFIG.user.avatarColor)}>
              <span className="text-white">{UI_CONFIG.user.avatarInitial}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium truncate">{UI_CONFIG.user.name}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Collapsed sidebar toggle */}
        {sidebarCollapsed && (
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="h-8 w-8"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] flex-1">
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">What's on your mind today?</h2>
                  <p className="text-muted-foreground text-sm">
                    How can I help you?
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl mb-8">
                  {UI_CONFIG.suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-left px-4 py-3 rounded-md border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-xs leading-relaxed text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Area for empty state */}
                <Card className="p-4 shadow-sm w-full max-w-xl">
                  <form onSubmit={handleSubmit}>
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Send a message..."
                      className="min-h-[80px] max-h-[300px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none text-sm"
                      rows={1}
                    />
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs">{LLM_CONFIG.displayName}</span>
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={status !== 'ready' || !input.trim()}
                        className="h-8 w-8 rounded-md"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            ) : (
              <>
                <div className="space-y-7 flex-1">
                  {messages.map((message, index) => {
                    // Skip rendering the last assistant message if it has no content yet
                    const isLastMessage = index === messages.length - 1;
                    if (isLastMessage && message.role === 'assistant' && !lastAssistantHasContent) {
                      return null;
                    }
                    return <MessageBubble key={message.id} message={message} />;
                  })}
                  {isLoading && (messages[messages.length - 1]?.role !== 'assistant' || !lastAssistantHasContent) && (
                    <div className="flex gap-4">
                      <Avatar size="sm" className="bg-secondary text-secondary-foreground flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4" />
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Assistant</p>
                        <div className="flex space-x-1 pt-1">
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex gap-4">
                      <Avatar size="sm" className="bg-destructive text-destructive-foreground flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4" />
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-destructive">Error</p>
                        <p className="text-xs text-muted-foreground">Sorry, an error occurred. Please try again.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} className="pt-4" />

                {/* Current Requirements */}
                {requirements.length > 0 && (
                  <div className="ml-11 mb-4">
                    <button
                      onClick={() => setRequirementsExpanded(!requirementsExpanded)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-md border border-border bg-card hover:bg-secondary/30 transition-all text-xs"
                    >
                      <ChevronDown
                        className={cn('h-4 w-4 flex-shrink-0 transition-transform', {
                          'rotate-180': requirementsExpanded,
                        })}
                      />
                      <span className="font-medium flex-1 text-left">Current Requirements ({requirements.length})</span>
                    </button>
                    {requirementsExpanded && (
                      <div className="mt-2 space-y-2 pl-4">
                        {requirements.map((req, index) => (
                          <div key={index} className="text-xs text-foreground py-1">
                            • {req}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Input Area for chat state */}
                <Card className="p-4 shadow-sm mt-auto ml-11">
                  <form onSubmit={handleSubmit}>
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Send a message..."
                      className="min-h-[80px] max-h-[300px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none text-sm"
                      rows={1}
                    />
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs">{LLM_CONFIG.displayName}</span>
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={status !== 'ready' || !input.trim()}
                        className="h-8 w-8 rounded-md"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
