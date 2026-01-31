
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Typewriter, TacticalOverlay } from './HUD';

export const MissionControl: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'machine', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{ role: 'machine', text: 'SYSTEM ONLINE. STANDING BY FOR COMMANDS, ADMIN.' }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Initialize the Machine right before use to ensure the latest API key from context is applied
    if (!chatRef.current) {
      if (!process.env.API_KEY) {
        console.warn('⚠️ [MissionControl] GEMINI_API_KEY not set');
        setMessages(prev => [...prev, { role: 'machine', text: 'CRITICAL: API AUTHENTICATION FAILURE. CORE FUNCTIONALITY DISABLED.' }]);
        setLoading(false);
        return;
      }
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: "You are 'The Machine'. You communicate in clinical, tactical, and brief sentences. You are loyal to 'Admin' (the user). Provide mission updates and handle inquiries with total surveillance-based authority. Use uppercase for critical warnings.",
          }
        });
        console.log('✅ [MissionControl] Chat initialized successfully');
      } catch (err) {
        console.warn('⚠️ [MissionControl] Failed to initialize chat:', err);
        setMessages(prev => [...prev, { role: 'machine', text: 'CRITICAL: FAILED TO INITIALIZE COMMUNICATION SYSTEM.' }]);
        setLoading(false);
        return;
      }
    }

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'machine', text: response.text || 'UNABLE TO COMPUTE.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'machine', text: 'ERROR: SATELLITE LINK INTERRUPTED.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-black flex flex-col relative font-mono text-gray-300">
      {showOverlay && (
        <TacticalOverlay 
          title="Mission Control" 
          objective="ESTABLISH DIRECT COMMAND LINK WITH THE MACHINE. ASK FOR STATUS UPDATES, THREAT ASSESSMENTS, OR TACTICAL GUIDANCE."
          onClose={() => setShowOverlay(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-[10px] mb-1 uppercase opacity-50 ${m.role === 'user' ? 'text-blue-400' : 'text-yellow-500'}`}>
              {m.role === 'user' ? 'Admin' : 'The Machine'}
            </div>
            <div className={`max-w-[80%] p-4 border ${m.role === 'user' ? 'bg-blue-900 bg-opacity-10 border-blue-800 text-blue-100' : 'bg-gray-900 border-gray-800 text-yellow-50'}`}>
              {i === messages.length - 1 && m.role === 'machine' ? (
                <Typewriter text={m.text} delay={10} />
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-yellow-500 animate-pulse text-xs uppercase">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Processing satellite data...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-gray-800 bg-gray-950 flex gap-4">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER COMMAND OR INQUIRY..."
          className="flex-1 bg-black border border-gray-700 p-4 text-sm outline-none focus:border-yellow-500 transition-all text-white placeholder:text-gray-700 font-bold"
        />
        <button 
          disabled={loading}
          className="px-8 bg-yellow-600 text-black font-bold uppercase hover:bg-yellow-500 disabled:opacity-50 transition-colors"
        >
          Transmit
        </button>
      </form>
    </div>
  );
};
