import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-hot-toast';
import { Send, Bot, User, Trash2, RefreshCw, Moon, Sun } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Alice() {
  const { settings, toggleTheme } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey || import.meta.env.VITE_API_KEY}`
        },
        body: JSON.stringify({
          message: input,
          context: {
            githubToken: settings.githubToken || import.meta.env.VITE_GITHUB_TOKEN,
            environment: settings.defaultEnvironment
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Failed to get response from Alice');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white/50 backdrop-blur-sm border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-primary">Alice Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-100"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-100"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 dark:scrollbar-thumb-zinc-700 light:scrollbar-thumb-zinc-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-500 light:text-zinc-400 space-y-2">
            <Bot className="w-12 h-12" />
            <p className="text-center">How can I help you today?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-primary' : 'bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-200'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white dark:text-white light:text-zinc-700" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-100 dark:text-zinc-100 light:text-zinc-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white dark:text-white light:text-zinc-700" />
              </div>
              <div className="bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-100 dark:text-zinc-100 light:text-zinc-900 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Alice something..."
            className="flex-1 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-100 dark:text-zinc-100 light:text-zinc-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
} 