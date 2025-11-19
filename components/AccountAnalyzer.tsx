
import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2, ShieldAlert, ShieldCheck, TrendingUp, AlertTriangle, BarChart3, Target, Layout, Swords, Crown, ArrowRight, ScanLine, Binary } from 'lucide-react';
import { analyzeAccountProfile, compareAccounts } from '../services/geminiService';
import { AccountAnalysis, CompetitorComparison } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const AccountAnalyzer: React.FC = () => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'audit' | 'battle'>('audit');
  
  // Audit State
  const [username, setUsername] = useState('');
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<AccountAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'swot' | 'strategy'>('overview');

  // Battle State
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [comparison, setComparison] = useState<CompetitorComparison | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    setAnalysis(null);
    
    const result = await analyzeAccountProfile(username, context, language);
    setAnalysis(result);
    setLoading(false);
    setActiveTab('overview');
  };

  const handleBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1 || !user2) return;
    setLoading(true);
    setComparison(null);
    
    // Simulation of steps for High End feel
    const steps = ["Initialising Neural Net...", `Scanning @${user1}...`, `Scanning @${user2}...`, "Comparing Engagement Matrices...", "Simulating Growth Strategies...", "Finalizing Report..."];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
        setLoadingStep(steps[stepIndex]);
        stepIndex = (stepIndex + 1) % steps.length;
    }, 800);

    const result = await compareAccounts(user1, user2, language);
    
    clearInterval(interval);
    setComparison(result);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      
      {/* Mode Toggle Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h2 className="text-5xl font-black text-white flex items-center gap-4 tracking-tighter">
            {mode === 'audit' ? <Target className="text-pink-500 w-12 h-12" /> : <Swords className="text-purple-500 w-12 h-12" />}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                {mode === 'audit' ? t.analyzer.auditTitle : t.analyzer.battleTitle}
            </span>
            </h2>
            <p className="text-slate-400 mt-3 text-xl max-w-2xl font-light">
            {mode === 'audit' 
                ? t.analyzer.auditDesc
                : t.analyzer.battleDesc}
            </p>
        </div>
        <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex shadow-xl">
            <button 
                onClick={() => setMode('audit')}
                className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'audit' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}
            >
                {t.analyzer.auditMode}
            </button>
            <button 
                onClick={() => setMode('battle')}
                className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'battle' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-500 hover:text-white'}`}
            >
                {t.analyzer.battleMode}
            </button>
        </div>
      </div>

      {/* === AUDIT MODE UI === */}
      {mode === 'audit' && (
          <>
            {/* Search Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 mb-12 shadow-2xl shadow-black/50 transition-all focus-within:border-pink-500/50 focus-within:shadow-pink-900/10">
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1 group">
                        <span className="absolute left-5 top-4 text-slate-500 font-bold text-xl group-focus-within:text-pink-500 transition-colors">@</span>
                        <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-transparent text-white text-lg placeholder-slate-600 font-medium py-4 pl-12 pr-4 outline-none border-none focus:ring-0 rounded-xl"
                        placeholder={t.analyzer.placeholderUser}
                        />
                    </div>
                    <div className="h-px md:h-auto md:w-px bg-slate-800 my-2 md:my-3"></div>
                    <input 
                        type="text" 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="flex-1 bg-transparent text-white text-lg placeholder-slate-600 py-4 px-6 outline-none border-none focus:ring-0"
                        placeholder={t.analyzer.placeholderContext}
                        />
                    <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-pink-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                    {loading ? <Loader2 className="animate-spin" /> : t.analyzer.startAudit}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full"></div>
                        <div className="w-24 h-24 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin relative z-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <ScanLine className="text-cyan-500 animate-ping" size={32} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{t.analyzer.scanning}</h3>
                    <p className="text-cyan-500 mt-2 font-mono text-sm">{t.analyzer.extracting}</p>
                </div>
            )}

            {!loading && analysis && (
                <div className="space-y-8 animate-slide-up">
                    
                    {/* Header Stats HUD */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-pink-500/30 transition-colors">
                            <div className="absolute -right-6 -top-6 bg-slate-800 rounded-full w-24 h-24 opacity-50 blur-xl group-hover:bg-pink-500/20 transition-colors"></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.analyzer.profile}</p>
                            <h3 className="text-2xl font-bold text-white truncate">@{analysis.username}</h3>
                            <div className="mt-4 flex gap-2">
                            {analysis.sources.length > 0 && <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> {t.analyzer.verified}</span>}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.analyzer.followers}</p>
                            <h3 className="text-4xl font-black text-cyan-400">{analysis.metrics.followers}</h3>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.analyzer.engagement}</p>
                            <h3 className="text-4xl font-black text-pink-500">{analysis.metrics.engagement}</h3>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.analyzer.niche}</p>
                            <h3 className="text-2xl font-bold text-white truncate">{analysis.metrics.niche}</h3>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-6 border-b border-slate-800 pb-1 overflow-x-auto">
                        {[
                            { id: 'overview', label: t.analyzer.tabs.overview, icon: Layout },
                            { id: 'swot', label: t.analyzer.tabs.swot, icon: BarChart3 },
                            { id: 'strategy', label: t.analyzer.tabs.strategy, icon: TrendingUp }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                                }`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
                                    <h3 className="text-2xl font-bold text-white mb-6 relative z-10">{t.analyzer.summary}</h3>
                                    <p className="text-slate-300 leading-relaxed text-xl relative z-10 font-light">{analysis.profileSummary}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2"><Globe size={16}/> {t.analyzer.sources}</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysis.sources.map((src, idx) => (
                                                <li key={idx}>
                                                    <a href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                                                        <div className="bg-slate-900 group-hover:bg-cyan-500 text-slate-400 group-hover:text-black p-3 rounded-lg transition-colors">
                                                            <ExternalLink size={20} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-bold text-slate-200 truncate">{src.title}</p>
                                                            <p className="text-xs text-slate-500 truncate mt-0.5">{src.uri}</p>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                </div>
                            </div>
                        )}

                        {/* SWOT TAB */}
                        {activeTab === 'swot' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <SwotCard title={t.vision.strengths} items={analysis.swot.strengths} icon={ShieldCheck} color="text-green-400" bg="bg-green-500/5" border="border-green-500/20" />
                                <SwotCard title="Weaknesses" items={analysis.swot.weaknesses} icon={AlertTriangle} color="text-orange-400" bg="bg-orange-500/5" border="border-orange-500/20" />
                                <SwotCard title="Opportunities" items={analysis.swot.opportunities} icon={TrendingUp} color="text-cyan-400" bg="bg-cyan-500/5" border="border-cyan-500/20" />
                                <SwotCard title="Threats" items={analysis.swot.threats} icon={ShieldAlert} color="text-red-400" bg="bg-red-500/5" border="border-red-500/20" />
                            </div>
                        )}

                        {/* STRATEGY TAB */}
                        {activeTab === 'strategy' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 animate-fade-in">
                                <div className="prose prose-invert max-w-none">
                                    {analysis.strategy.split('\n').map((line, i) => {
                                        if (line.startsWith('## ')) return <h3 key={i} className="text-3xl font-black text-cyan-400 mt-10 mb-6 flex items-center gap-3">{line.replace('## ', '')}</h3>;
                                        if (line.startsWith('### ')) return <h4 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('### ', '')}</h4>;
                                        if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-6 list-disc marker:text-cyan-500 mb-3 text-lg">{line.replace('- ', '')}</li>;
                                        if (line.trim() === '') return <br key={i} />;
                                        return <p key={i} className="text-slate-300 leading-relaxed text-lg mb-2">{line}</p>;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </>
      )}

      {/* === BATTLE MODE UI === */}
      {mode === 'battle' && (
          <div className="animate-slide-up">
             <div className="bg-slate-900/80 border border-purple-500/30 rounded-3xl p-8 mb-12 shadow-2xl shadow-purple-900/10 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                 
                 <form onSubmit={handleBattle} className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                    <div className="flex-1 w-full">
                         <label className="text-xs text-purple-400 font-bold uppercase ml-2 mb-2 block">{t.analyzer.challenger1}</label>
                         <div className="relative">
                            <input 
                                type="text" 
                                required
                                value={user1}
                                onChange={(e) => setUser1(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none text-lg transition-all"
                                placeholder="@username1"
                            />
                         </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-black italic border border-slate-700 shadow-lg z-10">VS</div>
                    </div>

                    <div className="flex-1 w-full">
                         <label className="text-xs text-purple-400 font-bold uppercase ml-2 mb-2 block">{t.analyzer.challenger2}</label>
                         <div className="relative">
                            <input 
                                type="text" 
                                required
                                value={user2}
                                onChange={(e) => setUser2(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none text-lg transition-all"
                                placeholder="@username2"
                            />
                         </div>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full lg:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/30 whitespace-nowrap hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 h-[60px]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : t.analyzer.initiateBattle}
                    </button>
                 </form>
             </div>

             {loading && (
                <div className="text-center py-32 relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-900">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>
                    <div className="relative z-10">
                        <Swords size={80} className="text-purple-500 animate-pulse mx-auto mb-8" />
                        <h3 className="text-3xl font-black text-white mb-2">{loadingStep}</h3>
                        <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
                            <div className="h-full bg-purple-500 animate-progress"></div>
                        </div>
                        <div className="flex justify-center gap-8 mt-8 font-mono text-slate-500 text-xs">
                            <span className="flex items-center gap-2"><Binary size={12}/> {t.analyzer.processing}</span>
                            <span className="flex items-center gap-2"><Globe size={12}/> {t.analyzer.searching}</span>
                        </div>
                    </div>
                </div>
             )}

             {!loading && comparison && (
                 <div className="space-y-8 animate-slide-up">
                     {/* Winner Banner */}
                     <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 border border-purple-500/50 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-purple-900/40">
                         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-slate-900/0 to-slate-900/0"></div>
                         <div className="relative z-10">
                             <div className="inline-block p-4 bg-black/30 rounded-full backdrop-blur-md mb-6 border border-white/10">
                                <Crown size={48} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                             </div>
                             <h3 className="text-sm font-bold text-purple-200 uppercase tracking-[0.2em] mb-4">{t.analyzer.winner}</h3>
                             <h2 className="text-6xl font-black text-white mb-6 tracking-tighter">@{comparison.winner}</h2>
                             <p className="text-purple-100 max-w-3xl mx-auto text-xl leading-relaxed font-light">"{comparison.winnerReason}"</p>
                         </div>
                     </div>

                     {/* Comparison Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* User 1 Card */}
                         <div className={`rounded-3xl p-8 border-2 transition-all ${comparison.winner === comparison.user1.username ? 'bg-purple-900/10 border-purple-500 shadow-lg shadow-purple-900/10 transform scale-[1.02]' : 'bg-slate-900 border-slate-800 opacity-80'}`}>
                             <div className="flex justify-between items-start mb-8">
                                 <h3 className="text-3xl font-bold text-white">@{comparison.user1.username}</h3>
                                 <div className="text-right">
                                     <span className="text-xs text-slate-500 uppercase font-bold">{t.analyzer.score}</span>
                                     <p className="text-5xl font-black text-white">{comparison.user1.score}</p>
                                 </div>
                             </div>
                             <div className="bg-slate-950 rounded-2xl p-6 mb-4 border border-slate-800">
                                 <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">{t.analyzer.superpower}</span>
                                 <p className="text-purple-400 font-bold text-lg">{comparison.user1.strength}</p>
                             </div>
                         </div>

                         {/* User 2 Card */}
                         <div className={`rounded-3xl p-8 border-2 transition-all ${comparison.winner === comparison.user2.username ? 'bg-purple-900/10 border-purple-500 shadow-lg shadow-purple-900/10 transform scale-[1.02]' : 'bg-slate-900 border-slate-800 opacity-80'}`}>
                             <div className="flex justify-between items-start mb-8">
                                 <h3 className="text-3xl font-bold text-white">@{comparison.user2.username}</h3>
                                 <div className="text-right">
                                     <span className="text-xs text-slate-500 uppercase font-bold">{t.analyzer.score}</span>
                                     <p className="text-5xl font-black text-white">{comparison.user2.score}</p>
                                 </div>
                             </div>
                             <div className="bg-slate-950 rounded-2xl p-6 mb-4 border border-slate-800">
                                 <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">{t.analyzer.superpower}</span>
                                 <p className="text-purple-400 font-bold text-lg">{comparison.user2.strength}</p>
                             </div>
                         </div>
                     </div>

                     {/* Detailed Breakdown */}
                     <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                         <div className="p-8 border-b border-slate-800 bg-slate-900">
                             <h3 className="text-2xl font-bold text-white">{t.analyzer.breakdown}</h3>
                         </div>
                         <div className="divide-y divide-slate-800">
                             {comparison.comparisonPoints.map((point, idx) => (
                                 <div key={idx} className="grid grid-cols-3 p-6 items-center hover:bg-slate-800/30 transition-colors">
                                     <div className={`text-lg font-medium ${point.advantage === 'user1' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                         {point.user1Value}
                                     </div>
                                     <div className="text-center px-4">
                                         <span className="text-xs font-bold text-slate-400 uppercase bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                                             {point.metric}
                                         </span>
                                     </div>
                                     <div className={`text-lg font-medium text-right ${point.advantage === 'user2' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                         {point.user2Value}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Strategy Box */}
                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <TrendingUp className="text-green-400" /> {t.analyzer.advice}
                        </h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 text-lg leading-relaxed">{comparison.tacticalAdvice}</p>
                        </div>
                     </div>
                 </div>
             )}
          </div>
      )}

      {!loading && !analysis && !comparison && (
          <div className="text-center py-32 opacity-50">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 mb-8">
                  {mode === 'audit' ? <Search size={40} className="text-slate-600" /> : <Swords size={40} className="text-slate-600" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-500">
                  {mode === 'audit' ? t.analyzer.waitingAudit : t.analyzer.waitingBattle}
              </h3>
          </div>
      )}
    </div>
  );
};

const SwotCard: React.FC<{ title: string, items: string[], icon: any, color: string, bg: string, border: string }> = ({ title, items, icon: Icon, color, bg, border }) => (
    <div className={`p-8 rounded-3xl border ${border} ${bg} backdrop-blur-sm transition-transform hover:-translate-y-1 duration-300`}>
        <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl ${bg} border ${border}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <h4 className={`text-xl font-black ${color} uppercase tracking-widest`}>{title}</h4>
        </div>
        <ul className="space-y-4">
            {items.length > 0 ? items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-200 text-base">
                    <span className={`mt-2 w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} flex-shrink-0`}></span>
                    <span className="leading-snug">{item}</span>
                </li>
            )) : <li className="text-slate-500 italic">...</li>}
        </ul>
    </div>
);
