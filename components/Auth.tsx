
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Auth: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(t.auth.checkEmail);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10 animate-fade-in">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-2xl shadow-cyan-500/20">
              <Activity className="w-8 h-8 text-cyan-400" />
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              TrendPulse <span className="text-pink-500">AI</span>
           </h1>
           <p className="text-slate-400 text-lg">{t.auth.subtitle}</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl animate-slide-up">
           
           {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={16} /> {error}
             </div>
           )}

           {message && (
             <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={16} /> {message}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.auth.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
                      placeholder="creator@example.com"
                    />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.auth.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 mt-6 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                   <>
                     {isLogin ? t.auth.signIn : t.auth.signUp} <ArrowRight size={18} />
                   </>
                )}
              </button>
           </form>

           <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
              >
                {isLogin ? t.auth.noAccount : t.auth.hasAccount} <span className="text-cyan-400 font-bold underline decoration-cyan-500/30">{isLogin ? t.auth.signUpShort : t.auth.signInShort}</span>
              </button>
           </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-600">
           Secured by Supabase • 256-bit Encryption
        </div>
      </div>
    </div>
  );
}
