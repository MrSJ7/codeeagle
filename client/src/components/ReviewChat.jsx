import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Code2,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { EagleEmblem } from './CodeEagleLogo.jsx';
import { sendReviewChatApi } from '../services/reviewApi.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import { cn } from '@/lib/utils';

export function ReviewChat({
  code = '',
  filename = 'source.js',
  selectedIssue = null,
  reviewData = null,
  className = '',
}) {
  const { isLight, isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I'm **CodeEagle AI**. I've analyzed \`${filename}\` and have full context on the deterministic AST findings and code semantics.\n\nAsk me anything: why a finding is hazardous, how to write unit tests, or how to refactor complex logic!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState('peer'); // 'peer' | 'mentor' | 'assertive'
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt = null) => {
    const query = (customPrompt || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendReviewChatApi({
        code,
        filename,
        issue: selectedIssue,
        question: query,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        tone,
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: res.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Unable to complete chat request:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async (id, text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (e) {}
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Chat cleared. Ask me anything about \`${filename}\`!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className={cn("h-full flex flex-col overflow-hidden font-sans", className)}>
      {/* 1. Header Bar */}
      <div className={cn(
        "px-4 py-3 border-b flex items-center justify-between gap-4 select-none shrink-0",
        isLight ? "bg-white border-slate-200" : "bg-obsidian-900 border-obsidian-800"
      )}>
        <div className="flex items-center gap-2.5">
          <EagleEmblem size={24} dark={isDark} />
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold text-xs tracking-tight", isLight ? "text-slate-900" : "text-obsidian-100")}>
                Ask CodeEagle
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 font-semibold">
                AI Copilot
              </span>
            </div>
            {selectedIssue && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400">
                Focus: {selectedIssue.rule} (line {selectedIssue.line})
              </span>
            )}
          </div>
        </div>

        {/* Tone Selector & Clear */}
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={cn(
              "text-[11px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer outline-none",
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-obsidian-950 border-obsidian-750 text-obsidian-300 hover:bg-obsidian-850"
            )}
            title="Review Tone Style"
          >
            <option value="quiet">Style: Quiet (High-Signal)</option>
            <option value="chill">Style: Chill (Constructive)</option>
            <option value="assertive">Style: Assertive (Strict)</option>
          </select>

          <button
            type="button"
            onClick={handleClearChat}
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer",
              isLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-800"
            )}
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Messages Canvas */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4",
        isLight ? "bg-slate-50/60" : "bg-[#09090B]"
      )}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 max-w-2xl",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <EagleEmblem size={22} dark={isDark} />
                )}
              </div>

              <div className={cn(
                "rounded-[10px] p-3 text-xs leading-relaxed space-y-2 shadow-xs group relative",
                isUser
                  ? isLight
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-brand-500 text-obsidian-950 font-medium rounded-tr-none"
                  : isLight
                  ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                  : "bg-obsidian-900 border border-obsidian-750 text-obsidian-200 rounded-tl-none shadow-md"
              )}>
                <div className="whitespace-pre-wrap break-words font-sans">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-70 font-mono">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100 flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 mr-auto text-xs font-mono text-slate-500 dark:text-obsidian-400">
            <EagleEmblem size={20} dark={isDark} />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
              <span>CodeEagle is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Chips */}
      <div className={cn(
        "px-4 py-2 border-t flex items-center gap-2 overflow-x-auto text-[11px] font-mono shrink-0 select-none",
        isLight ? "bg-white border-slate-200" : "bg-obsidian-950 border-obsidian-800"
      )}>
        <span className="text-[10px] uppercase text-slate-400 dark:text-obsidian-500 font-bold shrink-0">
          Quick Ask:
        </span>
        <button
          type="button"
          onClick={() => handleSend("Explain the root cause of these findings and why they matter in production.")}
          className={cn(
            "px-2.5 py-1 rounded-[4px] border shrink-0 transition-colors cursor-pointer flex items-center gap-1",
            isLight
              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              : "bg-obsidian-900 hover:bg-obsidian-800 border-obsidian-750 text-obsidian-300"
          )}
        >
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Explain Root Cause</span>
        </button>

        <button
          type="button"
          onClick={() => handleSend("Write a robust unit test covering all edge cases for this file.")}
          className={cn(
            "px-2.5 py-1 rounded-[4px] border shrink-0 transition-colors cursor-pointer flex items-center gap-1",
            isLight
              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              : "bg-obsidian-900 hover:bg-obsidian-800 border-obsidian-750 text-obsidian-300"
          )}
        >
          <Code2 className="w-3 h-3 text-blue-500" />
          <span>Generate Unit Test</span>
        </button>

        <button
          type="button"
          onClick={() => handleSend("What is the security blast radius if this code runs in production?")}
          className={cn(
            "px-2.5 py-1 rounded-[4px] border shrink-0 transition-colors cursor-pointer flex items-center gap-1",
            isLight
              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              : "bg-obsidian-900 hover:bg-obsidian-800 border-obsidian-750 text-obsidian-300"
          )}
        >
          <ShieldAlert className="w-3 h-3 text-red-500" />
          <span>Security Blast Radius</span>
        </button>
      </div>

      {/* 4. Chat Input Box */}
      <div className={cn(
        "p-3 border-t shrink-0",
        isLight ? "bg-white border-slate-200" : "bg-obsidian-900 border-obsidian-800"
      )}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CodeEagle anything about this code or findings..."
            disabled={isLoading}
            className={cn(
              "flex-1 px-3 py-2 text-xs rounded-[6px] border outline-none font-sans transition-colors",
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white"
                : "bg-obsidian-950 border-obsidian-750 text-obsidian-100 focus:border-brand-500 focus:bg-obsidian-900"
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
