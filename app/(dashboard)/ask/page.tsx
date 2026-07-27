'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const SUGGESTED_PROMPTS = [
  'What are users saying about onboarding?',
  'What features are requested most?',
  'Summarize negative feedback',
  'How is performance perception trending?',
];

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m LOOP, your AI customer feedback analyst. Ask me anything about your customer feedback, themes, and trends. I can help you find patterns, summarize insights, and answer questions about your data.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on your feedback data, here are some insights about "${content}":\n\n• The most mentioned aspect is performance optimization (342 mentions, +12.5% growth)\n• User experience improvements are the second priority (298 mentions, +8.3% growth)\n• Feature requests related to integrations are growing faster (5.2% growth)\n\nWould you like me to dive deeper into any of these areas?`,
        sources: ['Dashboard Analytics', 'Feedback Inbox', 'Theme Trends'],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Ask LOOP</h1>
        </div>
        <p className="text-muted-foreground">Chat with LOOP AI to analyze your customer feedback</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-4 p-4 bg-gradient-to-b from-muted/10 to-transparent rounded-lg border border-border">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Start a conversation with LOOP</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md lg:max-w-xl ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-lg rounded-br-none'
                      : 'bg-muted text-foreground rounded-lg rounded-bl-none'
                  } p-4`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-2">
                      {message.sources.map((source) => (
                        <Badge
                          key={source}
                          variant="secondary"
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg rounded-bl-none p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Prompts (when chat is empty) */}
      {messages.length === 1 && (
        <div className="mb-6 space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="text-left justify-start h-auto py-3"
                onClick={() => handleSendMessage(prompt)}
              >
                <span className="text-xs">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t border-border">
        <Input
          placeholder="Ask LOOP about your feedback..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputValue);
            }
          }}
          disabled={isLoading}
          className="bg-muted/50 border-muted"
        />
        <Button
          onClick={() => handleSendMessage(inputValue)}
          disabled={isLoading || !inputValue.trim()}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
