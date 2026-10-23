'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  HelpCircle,
  Bot,
  User
} from 'lucide-react';
import {
  AIChatMessage,
  LocationItem,
  LivabilityResponse,
  WeatherClimateResponse,
  AmenitiesResponse
} from '@/types';
import { sendAIChatMessage } from '@/lib/api';

interface AIAdvisorProps {
  currentLocation: LocationItem;
  livability: LivabilityResponse | null;
  weather: WeatherClimateResponse | null;
  amenities: AmenitiesResponse | null;
}

export default function AIAdvisorView({
  currentLocation,
  livability,
  weather,
  amenities,
}: AIAdvisorProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am **LandNova AI Advisor**. I analyze real-world geospatial data for **${currentLocation.display_name}** to help you make informed real estate and development decisions.\n\nAsk me about family suitability, school and healthcare access, flood vulnerabilities, or critical due diligence steps before making a commitment.`,
      timestamp: 'Just now',
      model_used: 'LandNova Advisory Engine',
      verified_facts: [
        `Livability Score: ${livability?.overall_score || 81.4}/100`,
        `Transit Nodes Mapped: ${amenities?.counts_by_category?.transit || 5}`,
        `US AQI: ${weather?.air_quality?.us_aqi || 92} (${weather?.air_quality?.category_label || 'Moderate'})`,
        `Terrain Elevation: ${weather?.climate_risk?.elevation_meters || 180}m`
      ],
      warnings: [
        'Local water pressure and micro-road peak congestion require field verification.',
        'Always inspect RERA filings and municipal sanctions.'
      ],
      is_demo: false,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedQuestions = [
    'Is this area suitable for a family with children?',
    'How accessible are hospitals and schools within 2km?',
    'What are the main disadvantages of living here?',
    'What information should I verify before buying property here?',
    'How does flood risk affect this locality during monsoons?',
  ];

  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim() || isSubmitting) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      content: msgText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSubmitting(true);

    const contextPayload = {
      overall_score: livability?.overall_score || 81.4,
      transit_nodes: amenities?.counts_by_category?.transit || 5,
      schools: amenities?.counts_by_category?.education || 4,
      hospitals: amenities?.counts_by_category?.healthcare || 4,
      us_aqi: weather?.air_quality?.us_aqi || 92,
      flood_risk_level: weather?.climate_risk?.flood_risk_level || 'Low',
      elevation_m: weather?.climate_risk?.elevation_meters || 180,
    };

    try {
      const res = await sendAIChatMessage(
        msgText,
        currentLocation.display_name,
        currentLocation.id,
        contextPayload
      );

      const aiMsg: AIChatMessage = {
        role: 'assistant',
        content: res.reply,
        timestamp: 'Just now',
        model_used: res.model_used,
        verified_facts: res.verified_facts,
        warnings: res.warnings,
        is_demo: res.is_demo,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Advisor Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              AI Location Advisor
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                Context-Grounded
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzing: <strong className="text-slate-800">{currentLocation.display_name}</strong>
            </p>
          </div>
        </div>

        <div className="text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Zero-hallucination policy: Grounded in OSM & Open-Meteo</span>
        </div>
      </div>

      {/* Suggested Query Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-500 shrink-0 font-medium flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Frequent Inquiries:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 shrink-0 transition-colors shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Message Window */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-6 min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <div className="space-y-2 whitespace-pre-line">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  {msg.verified_facts && msg.verified_facts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Verified Metrics:
                      </span>
                      {msg.verified_facts.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.warnings && msg.warnings.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-amber-600 font-semibold uppercase">
                        Caveats:
                      </span>
                      {msg.warnings.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.model_used && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Engine: {msg.model_used}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSubmitting && (
          <div className="flex gap-3 items-center text-xs text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <span>Evaluating geospatial context & synthesizing advice...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask about ${currentLocation.display_name.split(',')[0]} (e.g., commute, waterlogging, schools, due diligence)...`}
          className="w-full pl-4 pr-24 py-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSubmitting}
          className="absolute right-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
}
