
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';
import { formatCurrency } from '../constants';
import ProductCard from '../components/ProductCard';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  suggestedProducts?: Product[];
  sources?: { title: string; uri: string }[];
}

interface AIChatPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const AIChatPage: React.FC<AIChatPageProps> = ({ products, onSelectProduct }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const parseRecommendations = (text: string, allProducts: Product[]) => {
    const recommended: Product[] = [];
    const matches = text.match(/\[ID:\s*([\w-]+)\]/g);
    if (matches) {
      matches.forEach(match => {
        const id = match.replace(/\[ID:\s*/, '').replace(']', '').trim();
        const product = allProducts.find(p => p.id === id);
        if (product && !recommended.find(r => r.id === id)) {
          recommended.push(product);
        }
      });
    }
    return recommended;
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', text: userText, timestamp: new Date() }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const inventoryContext = products.length > 0 
        ? products.map(p => `[ID: ${p.id}] ${p.name} - KES ${p.price} in ${p.location}`).join('\n')
        : "No items currently listed in the store.";

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `You are the HarMarket Assistant for Nakuru and Egerton University.
          
          CURRENT MARKET INVENTORY:
          ${inventoryContext}
          
          MISSION:
          - Help users find items in our Nakuru/Egerton inventory.
          - If you recommend an item, YOU MUST USE THE FORMAT: [ID: product-id].
          - If a user asks for something not in stock, use Google Search to find current market prices in Kenya or nearby shops.
          - Be conversational, friendly, and helpful. Mention specific campus spots like Egerton Main, Njoro, or Nakuru CBD.
          - Bold prices like **KES 1,200**.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const responseText = response.text || "I'm looking that up for you. One moment.";
      
      // Extract Google Search chunks
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Source',
          uri: chunk.web.uri
        }));

      const suggested = parseRecommendations(responseText, products);

      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        suggestedProducts: suggested.length > 0 ? suggested : undefined,
        sources: sources.length > 0 ? sources : undefined
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered a slight issue connecting to the market brain. Please check your internet and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    // Hide IDs from the displayed text
    const cleanText = text.replace(/\[ID:\s*[\w-]+\]/g, '');
    
    return cleanText.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const isHeader = line.startsWith('##') || line.startsWith('###');
      const isList = line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
      
      const processLine = (content: string) => {
        const parts = content.split(/(\*\*.*?\*\*|KES\s?\d+(?:,\d+)*)/g);
        return parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (/KES\s?\d+/.test(part)) {
            return <span key={j} className="text-blue-600 font-bold">{part}</span>;
          }
          return part;
        });
      };

      if (isHeader) {
        return <h3 key={i} className="text-base font-bold text-indigo-700 mt-4 mb-2 tracking-tight">{line.replace(/#+/, '').trim()}</h3>;
      }

      return (
        <p key={i} className={`${isList ? 'pl-5 relative' : ''} text-[14.5px] leading-relaxed text-slate-600 mb-1.5`}>
          {isList && <span className="absolute left-0 text-indigo-400 font-bold">•</span>}
          {processLine(isList ? line.trim().replace(/^[\*\-\d\.]+\s*/, '') : line)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full relative overflow-hidden bg-transparent antialiased">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-8 px-6 pb-40 no-scrollbar scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fadeIn space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl border border-white/20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">HarMarket Assistant</h2>
              <p className="text-slate-500 text-base font-medium leading-relaxed">
                I help you navigate the local market. Ask me about gadgets, prices in Nakuru, or what's currently in stock at Egerton.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {["Check Phone Prices", "Laptops in Egerton", "Search Nakuru Shops"].map(hint => (
                <button 
                  key={hint}
                  onClick={() => handleSendMessage(hint)}
                  className="px-4 py-2 bg-white border border-indigo-50 rounded-full text-[10px] font-bold text-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10 max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-slideUp`}>
                <div className={`group relative max-w-[90%] md:max-w-[75%] p-5 rounded-[2rem] transition-all duration-500 ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/10 rounded-tr-none' 
                    : 'bg-white/90 backdrop-blur-xl border border-indigo-50/50 text-slate-800 shadow-xl shadow-indigo-500/5 rounded-tl-none ring-1 ring-white/50'
                }`}>
                  <div className="text-[15px] leading-relaxed">
                    {formatText(m.text)}
                  </div>

                  {m.sources && (
                    <div className="mt-5 pt-4 border-t border-indigo-50/50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Web Citations</p>
                      <div className="flex flex-wrap gap-2">
                        {m.sources.map((s, idx) => (
                          <a 
                            key={idx} 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all line-clamp-1 max-w-[150px]"
                          >
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {m.suggestedProducts && (
                  <div className="mt-6 w-full flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x">
                    {m.suggestedProducts.map(p => (
                      <div key={p.id} className="w-[190px] shrink-0 snap-start transform hover:-translate-y-2 transition-transform duration-300">
                        <ProductCard product={p} onClick={onSelectProduct} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start max-w-3xl mx-auto animate-fadeIn mt-8">
            <div className="bg-white/60 backdrop-blur-md border border-indigo-100 p-5 rounded-[2rem] rounded-bl-none flex items-center gap-4 shadow-sm ring-1 ring-white/50">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Analyzing Market...</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="relative flex items-center bg-white/95 backdrop-blur-3xl border border-indigo-100 p-1.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.15)] ring-1 ring-white/50 group focus-within:ring-4 ring-indigo-500/10 transition-all duration-300"
          >
            <div className="flex-1 px-5">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about the local market..."
                className="w-full bg-transparent py-4 text-[16px] font-medium focus:outline-none text-slate-900 placeholder-slate-400"
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-full shadow-lg hover:brightness-110 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center shrink-0 active:scale-95 group"
            >
              <svg className="w-6 h-6 transform group-active:translate-x-1 group-active:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.35em]">Google AI Powered Search Grounding</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
