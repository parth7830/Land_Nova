'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendAIChatMessage } from '@/lib/api';
import { AIChatMessage } from '@/types';

interface ChatWidgetProps {
  currentLocationName?: string;
  currentLocationContext?: any;
  userPersona?: string;
}

export default function ChatWidget({
  currentLocationName = 'Sector 62, Noida',
  currentLocationContext,
  userPersona = 'home_buyer'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your **LandNova AI Location Advisor**. Ask me anything about **${currentLocationName}** — livability, schools, metro connectivity, air quality, or due-diligence risks.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model_used: 'LandNova Grounded Engine'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChatMessage(
        q,
        currentLocationName,
        undefined,
        currentLocationContext
      );

      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model_used: res.model_used,
        verified_facts: res.verified_facts,
        warnings: res.warnings,
        is_demo: res.is_demo
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach the location intelligence advisor at this moment. Please check your network or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          warnings: ['Network request interrupted']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Is this location suitable for young families with toddlers?',
    'What is the walking distance to the nearest metro station?',
    'Are there seasonal flooding or monsoon waterlogging concerns?',
    'What statutory RERA checks should I verify before booking?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full shadow-lg border border-emerald-500/30 transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm">Ask Location AI</span>
        </button>
      )}

      {/* Expanded Chat Drawer (Clean Light Mode) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  LandNova AI Advisor
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                    Gemini
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                  Context: {currentLocationName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-50/50 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              >
                {q.length > 28 ? q.slice(0, 28) + '...' : q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/30">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}>
                    <div className="whitespace-pre-line">{m.content}</div>

                    {/* Verified Facts cited */}
                    {m.verified_facts && m.verified_facts.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-800 block flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Grounded Verified Metrics:
                        </span>
                        {m.verified_facts.map((vf, vi) => (
                          <div key={vi} className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {vf}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Caution Warnings */}
                    {m.warnings && m.warnings.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-0.5">
                        {m.warnings.map((wn, wi) => (
                          <div key={wi} className="text-[10px] text-amber-800 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-2.5 h-2.5 shrink-0 text-amber-600" /> {wn}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
                      <span>{m.timestamp}</span>
                      {m.model_used && <span className="opacity-75">{m.model_used}</span>}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-500">
                <div className="w-6 h-6 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                </div>
                <span className="italic">Analyzing verified location metrics...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
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
                placeholder={`Ask about ${currentLocationName}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Zero-hallucination policy • Grounded in OSM & Open-Meteo metrics
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
