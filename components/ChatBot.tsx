
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: language === 'de' ? "Hallo! Ich bin dein KI-Strategie-Assistent. Wie kann ich dir heute helfen, viral zu gehen?" : "Hello! I am your AI Strategy Assistant. How can I help you go viral today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Pass history (excluding the message we just added locally, technically the service handles the turn)
    // However, for stateless simulation or new chat instance each time, passing full history is best.
    const responseText = await sendChatMessage(messages, userMsg.text, language);

    if (responseText) {
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } else {
      // Error handling visual
      const errorMsg: ChatMessage = { role: 'model', text: language === 'de' ? "Entschuldigung, ich konnte das nicht verarbeiten. Bitte versuche es erneut." : "Sorry, I couldn't process that. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto pb-4">
      
      <header className="mb-6 px-4">
          <h2 className="text-5xl font-black text-white flex items-center gap-4 tracking-tighter">
              <MessageCircle className="text-emerald-400 w-12 h-12" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">
                  {t.chat.title}
              </span>
          </h2>
          <p className="text-slate-400 mt-3 text-xl max-w-2xl font-light">
              {t.chat.subtitle}
          </p>
      </header>

      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm shadow-2xl shadow-emerald-900/10 mx-4">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                          {msg.role === 'user' ? <User size={20} className="text-slate-300" /> : <Bot size={20} className="text-emerald-400" />}
                      </div>
                      <div className={`max-w-[80%] p-5 rounded-2xl text-lg leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-slate-800 text-slate-200 rounded-tr-sm' 
                          : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-sm shadow-lg'
                      }`}>
                          <div className="prose prose-invert max-w-none">
                              {msg.text.split('\n').map((line, i) => (
                                  <p key={i} className="mb-1 last:mb-0">{line}</p>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
              {loading && (
                  <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 animate-pulse">
                          <Sparkles size={20} className="text-emerald-400" />
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
                          <Loader2 size={18} className="text-emerald-400 animate-spin" />
                          <span className="text-slate-400 text-sm font-mono">{t.chat.thinking}</span>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                  <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t.chat.placeholder}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-6 pr-14 text-white text-lg placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                  />
                  <button 
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="absolute right-2 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-slate-800"
                  >
                      <Send size={20} />
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};
