'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Send,
  Sparkles,
  FileText,
  Trash2,
  Copy,
  Check,
  Zap,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  RefreshCw,
  SquarePen,
} from 'lucide-react';

interface Citation {
  channel?: string;
  content: string;
  authorName?: string;
  sentiment?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Citation[];
  timestamp: string;
}

interface PromptCategory {
  title: string;
  icon: any;
  color: string;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    title: 'Customer Sentiment',
    icon: TrendingUp,
    color: 'text-blue-500',
    prompts: [
      'Summarize overall user sentiment across all channels',
      'What are the top positive highlights from recent reviews?',
      'Summarize negative feedback and churn drivers',
    ],
  },
  {
    title: 'Product & Features',
    icon: Zap,
    color: 'text-violet-500',
    prompts: [
      'What features are users requesting most frequently?',
      'What are users saying about our onboarding flow?',
      'Are there complaints about mobile usability?',
    ],
  },
  {
    title: 'Bugs & Performance',
    icon: BarChart3,
    color: 'text-amber-500',
    prompts: [
      'How is system performance perception trending?',
      'What bugs or technical glitches were reported recently?',
      'Summarize API and integration issues reported by users',
    ],
  },
];

const FOLLOW_UP_CHIPS: string[] = [
  'Elaborate on the key action items',
  'Give me specific user quotes',
  'Compare sentiment across channels',
  'What should the product team prioritize?',
];

function stripInlineIds(text: string): string {
  return text.replace(/\s*[\(\[](?:IDs?|ID):\s*[^\)\]]+[\)\]]/gi, '');
}

function parseInlineMarkdown(text: string) {
  const cleanText = stripInlineIds(text);
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = cleanText.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-[15px] leading-7">
      {paragraphs.map((paragraph, pIdx) => {
        const trimmed = paragraph.trim();

        if (trimmed.startsWith('#')) {
          const level = (trimmed.match(/^#+/) || [''])[0].length;
          const headerText = trimmed.replace(/^#+\s*/, '');
          const cls = level === 1
            ? 'text-xl font-bold text-foreground mt-2 mb-1'
            : level === 2
            ? 'text-lg font-semibold text-foreground mt-2 mb-1'
            : 'text-base font-semibold text-foreground mt-1';
          return <p key={pIdx} className={cls}>{parseInlineMarkdown(headerText)}</p>;
        }

        const lines = paragraph.split('\n').filter((l) => l.trim().length > 0);
        const isBulletList = lines.length > 0 && lines.every((line) =>
          line.trim().startsWith('- ') || line.trim().startsWith('* ')
        );
        const isNumberedList = lines.length > 0 && lines.every((line) =>
          /^\d+\.\s/.test(line.trim())
        );

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 my-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0 mt-[0.6rem]" />
                  <span className="flex-1 text-foreground/90">
                    {parseInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={pIdx} className="space-y-1.5 my-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3">
                  <span className="text-muted-foreground text-sm shrink-0 mt-0.5 tabular-nums w-5 text-right">
                    {lIdx + 1}.
                  </span>
                  <span className="flex-1 text-foreground/90">
                    {parseInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ''))}
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={pIdx} className="text-foreground/90">
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {parseInlineMarkdown(line)}
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'user', content, timestamp: ts }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer || 'No answer generated.',
          sources: Array.isArray(data.citedItems)
            ? data.citedItems.map((item: any) => ({
                channel: item.channel || 'Feedback',
                content: item.content || '',
                sentiment: item.sentiment || 'NEUTRAL',
              }))
            : [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Something went wrong connecting to the AI. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setExpandedSources({});
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleSources = (id: string) =>
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-9.5rem)] max-h-[calc(100vh-8.5rem)] lg:max-h-[calc(100vh-9.5rem)] overflow-hidden">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-foreground text-sm">Ask LOOP</span>
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Groq GPT OSS 120B
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <SquarePen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 gap-4 sm:gap-6 my-auto">
            <div className="text-center space-y-2 max-w-lg">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">How can I help?</h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Ask me anything about your customer feedback. I'll retrieve the most relevant items and give you grounded, accurate answers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-5xl">
              {PROMPT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.title} className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 space-y-2 sm:space-y-3 hover:border-border transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span className="text-xs font-semibold text-foreground">{cat.title}</span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {cat.prompts.map((p) => (
                        <button
                          key={p}
                          onClick={() => handleSendMessage(p)}
                          className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer leading-snug"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 w-full">
            {messages.map((message) => {
              const isAssistant = message.type === 'assistant';
              return (
                <div key={message.id} className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isAssistant ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 min-w-0 ${isAssistant ? '' : 'flex flex-col items-end'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {isAssistant ? 'LOOP AI' : 'You'}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50" suppressHydrationWarning>
                        {message.timestamp}
                      </span>
                    </div>

                    <div
                      className={`group relative ${
                        isAssistant
                          ? 'text-foreground'
                          : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-[15px] leading-7 max-w-[80%]'
                      }`}
                    >
                      {isAssistant ? (
                        <>
                          <FormattedMarkdown content={message.content} />

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            {copiedId === message.id ? (
                              <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>

                          {/* Cited Sources */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <button
                                onClick={() => toggleSources(message.id)}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                {message.sources.length} source{message.sources.length !== 1 ? 's' : ''} used
                                {expandedSources[message.id]
                                  ? <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                                  : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                              </button>

                              {expandedSources[message.id] && (
                                <div className="mt-3 space-y-2">
                                  {message.sources.map((src, i) => (
                                    <div key={i} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono uppercase text-[10px] font-bold tracking-wider text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                                          {src.channel}
                                        </span>
                                        {src.sentiment && (
                                          <span className={`text-[10px] font-semibold uppercase ${
                                            src.sentiment === 'POSITIVE' ? 'text-emerald-500'
                                            : src.sentiment === 'NEGATIVE' ? 'text-rose-500'
                                            : 'text-amber-500'
                                          }`}>
                                            {src.sentiment}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground italic leading-relaxed line-clamp-3">
                                        "{src.content}"
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-1 h-6">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Follow-up chips — only when chatting */}
      {messages.length > 0 && !isLoading && (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {FOLLOW_UP_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip)}
              className="shrink-0 text-xs text-muted-foreground border border-border/60 rounded-full px-3 py-1.5 hover:bg-muted/60 hover:text-foreground hover:border-border transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-0 pt-2">
        <div className="relative flex items-end gap-2 border border-border/80 rounded-2xl bg-card shadow-sm focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/5 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Message Ask LOOP..."
            className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[52px] max-h-[200px] overflow-y-auto"
          />
          <div className="flex items-center gap-1 pr-2 pb-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg hover:bg-muted/60"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
          Answers are grounded in your real customer feedback data via vector search
        </p>
      </div>
    </div>
  );
}
