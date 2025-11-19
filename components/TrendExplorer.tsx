
import React, { useState, useEffect, useRef } from 'react';
import { Music, Hash, RefreshCcw, Loader2, Radio, Zap, Target, ChevronRight, BrainCircuit, PauseCircle, PlayCircle, Plus, Users } from 'lucide-react';
import { fetchTrends, runViralPrediction } from '../services/geminiService';
import { Trend, TrendCategory, ViralPrediction } from '../types';
import { ContentFactory } from './ContentFactory';
import { useLanguage } from '../contexts/LanguageContext';

export const TrendExplorer: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'feed' | 'radar'>('feed');
  
  // Feed State
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>(TrendCategory.GENERAL);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrendForFactory, setSelectedTrendForFactory] = useState<Trend | null>(null);
  
  // Auto-Pilot State
  const [autoPilot, setAutoPilot] = useState(false);
  const [autoPilotLog, setAutoPilotLog] = useState<string>("System ready.");
  const autoPilotInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Radar State
  const [radarNiche, setRadarNiche] = useState('Business & Tech');
  const [predictions, setPredictions] = useState<ViralPrediction[]>([]);
  const [scanning, setScanning] = useState(false);

  const loadTrends = async (append = false) => {
    if (!append) setLoading(true);
    // Pass language
    const newTrends = await fetchTrends(selectedCategory, language);
    
    if (append) {
        // Deduplicate and prepend
        setTrends(prev => {
            const existingIds = new Set(prev.map(t => t.name)); // Simple dedup by name
            const uniqueNew = newTrends.filter(t => !existingIds.has(t.name));
            return [...uniqueNew, ...prev].slice(0, 20); // Keep max 20
        });
        setAutoPilotLog(`Found ${newTrends.length} new signals in ${selectedCategory}...`);
    } else {
        setTrends(newTrends);
    }
    
    if (!append) setLoading(false);
  };

  // Auto Pilot Logic
  useEffect(() => {
    if (autoPilot) {
        setAutoPilotLog("Initializing autonomous scanning sequence...");
        const categories = Object.values(TrendCategory);
        
        autoPilotInterval.current = setInterval(() => {
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            setSelectedCategory(randomCat);
            setAutoPilotLog(`Scanning sector: ${randomCat}...`);
            loadTrends(true);
        }, 8000); // Scan every 8 seconds
    } else {
        if (autoPilotInterval.current) clearInterval(autoPilotInterval.current);
        setAutoPilotLog("Auto-pilot disengaged.");
    }

    return () => {
        if (autoPilotInterval.current) clearInterval(autoPilotInterval.current);
    };
  }, [autoPilot]);

  // Initial Load or when language changes
  useEffect(() => {
    if (activeTab === 'feed' && !autoPilot) loadTrends();
  }, [activeTab, language]);

  const startRadarScan = async () => {
    setScanning(true);
    setPredictions([]);
    // Simulate scanning delay for effect
    await new Promise(r => setTimeout(r, 1500));
    const results = await runViralPrediction(radarNiche, language);
    setPredictions(results);
    setScanning(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 relative min-h-screen">
      
      {/* Tab Toggle */}
      <div className="flex justify-center mb-8 sticky top-0 z-40 pt-4 pb-2 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-full flex gap-1 shadow-xl">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  {t.trends.liveFeed}
              </button>
              <button 
                onClick={() => setActiveTab('radar')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'radar' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <Radio size={14} className={activeTab === 'radar' ? 'animate-pulse' : ''} /> {t.trends.viralRadar}
              </button>
          </div>
      </div>

      {/* === STANDARD FEED VIEW === */}
      {activeTab === 'feed' && (
        <>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="relative flex h-4 w-4">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoPilot ? 'bg-green-400' : 'bg-cyan-400'} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-4 w-4 ${autoPilot ? 'bg-green-500' : 'bg-cyan-500'}`}></span>
                        </span>
                        {t.trends.title}
                    </h2>
                    <p className="text-slate-400 mt-1 font-mono text-sm flex items-center gap-2">
                        <span className={autoPilot ? "text-green-400" : "text-slate-500"}>
                            {autoPilot ? `● LIVE: ${autoPilotLog}` : `● ${t.trends.systemStandby}`}
                        </span>
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setAutoPilot(!autoPilot)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border ${
                            autoPilot 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        {autoPilot ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        {autoPilot ? t.trends.autoPilotOn : t.trends.enableAutoPilot}
                    </button>

                    <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block"></div>

                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as TrendCategory)}
                        disabled={autoPilot}
                        className="bg-slate-950 text-white rounded-xl px-4 py-2.5 outline-none border border-slate-800 cursor-pointer font-medium hover:border-cyan-500/50 transition-colors disabled:opacity-50"
                    >
                        {Object.values(TrendCategory).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => loadTrends(false)}
                        disabled={loading || autoPilot}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-cyan-900/20"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {loading && !autoPilot ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : trends.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                    <p className="text-slate-400">No trends found. Start scan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {trends.map((trend, idx) => (
                        <TrendCard 
                            key={trend.id} 
                            trend={trend} 
                            isNew={idx < 3 && autoPilot} // Highlight new items in auto pilot
                            onGenerate={() => setSelectedTrendForFactory(trend)} 
                            labels={t.trends}
                        />
                    ))}
                </div>
            )}
        </>
      )}

      {/* === VIRAL RADAR VIEW === */}
      {activeTab === 'radar' && (
          <div className="animate-fade-in">
             <div className="text-center mb-12 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 blur-3xl rounded-full -z-10"></div>
                 <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-4 flex items-center justify-center gap-3">
                    <BrainCircuit size={48} className="text-pink-500" /> {t.trends.predictiveTitle}
                 </h2>
                 <p className="text-slate-400 max-w-lg mx-auto text-lg">
                     {t.trends.predictiveDesc}
                 </p>
             </div>

             {/* Radar Controls */}
             <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-700 rounded-3xl p-8 backdrop-blur-lg shadow-2xl mb-12 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-pink-400 uppercase ml-2 mb-2 block">{t.trends.targetSector}</label>
                        <input 
                            type="text" 
                            value={radarNiche}
                            onChange={(e) => setRadarNiche(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-lg placeholder-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none shadow-inner"
                            placeholder="e.g. Fitness, AI Tools, Cooking..."
                        />
                    </div>
                    <button 
                        onClick={startRadarScan}
                        disabled={scanning}
                        className="w-full md:w-auto bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-pink-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6 md:mt-0 transform hover:scale-105 active:scale-95"
                    >
                        {scanning ? <Loader2 className="animate-spin" /> : <Zap size={24} fill="currentColor" />}
                        {scanning ? t.trends.scanning : t.trends.predictButton}
                    </button>
                </div>
                
                {/* Background FX */}
                {scanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-pink-500/50 rounded-full animate-ping"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-500/50 rounded-full animate-ping animation-delay-200"></div>
                    </div>
                )}
             </div>

             {/* Results Grid */}
             <div className="grid grid-cols-1 gap-8">
                 {predictions.map((prediction) => (
                     <PredictionCard key={prediction.id} prediction={prediction} labels={t.trends} />
                 ))}
             </div>

             {!scanning && predictions.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-24 opacity-20">
                    <Target size={120} className="text-slate-600 mb-6" />
                    <p className="text-slate-500 font-bold text-xl">{t.trends.awaitingInput}</p>
                 </div>
             )}
          </div>
      )}

      {/* Content Factory Modal */}
      {selectedTrendForFactory && (
          <ContentFactory 
            trend={selectedTrendForFactory} 
            onClose={() => setSelectedTrendForFactory(null)} 
          />
      )}
    </div>
  );
};

const TrendCard: React.FC<{ trend: Trend, onGenerate: () => void, isNew?: boolean, labels: any }> = ({ trend, onGenerate, isNew, labels }) => {
    return (
        <div className={`bg-slate-900 border rounded-3xl p-0 overflow-hidden transition-all hover:shadow-2xl hover:shadow-cyan-900/10 group flex flex-col h-full relative ${isNew ? 'border-green-500/50 animate-pulse-subtle' : 'border-slate-800 hover:border-cyan-500/30'}`}>
            
            {isNew && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-black text-xs font-black px-2 py-1 rounded uppercase tracking-wide">
                    NEW
                </div>
            )}

            <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wide border border-slate-700">
                        {trend.category}
                    </span>
                    <div className="flex items-center gap-1 text-green-400 bg-green-900/20 px-4 py-1.5 rounded-full text-xs font-bold border border-green-500/20 shadow-lg shadow-green-900/20">
                       {trend.viralityScore}% Viral Score
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors leading-tight">{trend.name}</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3">{trend.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                         <div className="flex items-center gap-2 mb-2">
                            <Music size={14} className="text-cyan-400" />
                            <span className="text-xs text-slate-500 uppercase font-bold">Audio</span>
                         </div>
                         <p className="text-sm text-slate-200 truncate font-medium">{trend.soundName || "Trending Sound"}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                         <div className="flex items-center gap-2 mb-2">
                            <Hash size={14} className="text-pink-400" />
                            <span className="text-xs text-slate-500 uppercase font-bold">Tags</span>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                             {trend.hashtags?.slice(0, 3).map((tag, i) => (
                                 <span key={i} className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 truncate max-w-full">
                                     {tag}
                                 </span>
                             ))}
                         </div>
                    </div>
                </div>

                {/* UGC Examples Section */}
                {trend.ugcExamples && trend.ugcExamples.length > 0 && (
                    <div className="mb-6 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Users size={14} className="text-indigo-400" /> {labels.ugc}
                        </h4>
                        <ul className="space-y-2">
                            {trend.ugcExamples.slice(0, 3).map((ex, i) => (
                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                    <span className="text-indigo-500 mt-0.5">•</span> {ex}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h4 className="text-xs font-bold text-cyan-500 uppercase mb-2 flex items-center gap-2">
                        💡 {labels.concept}
                    </h4>
                    <p className="text-sm text-slate-300 italic font-medium">"{trend.exampleIdea}"</p>
                </div>
            </div>

            <button 
                onClick={onGenerate}
                className="w-full py-5 bg-slate-800 hover:bg-slate-700 border-t border-slate-700 text-white font-bold tracking-wide flex items-center justify-center gap-3 transition-all group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:border-transparent uppercase text-sm"
            >
                <Plus size={18} /> {labels.createContent}
            </button>
        </div>
    )
}

const PredictionCard: React.FC<{ prediction: ViralPrediction, labels: any }> = ({ prediction, labels }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-900/10">
            <div className="p-8 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-black text-purple-400 uppercase tracking-widest border border-purple-500/30 px-2 py-0.5 rounded">{labels.prediction}</span>
                            {prediction.momentum === 'rising' && <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-green-500/20">{labels.rising}</span>}
                            {prediction.momentum === 'peaking' && <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-orange-500/20">{labels.peaking}</span>}
                        </div>
                        <h3 className="text-3xl font-bold text-white">{prediction.topic}</h3>
                    </div>
                    <div className="flex items-center gap-6">
                         <div className="text-right hidden md:block">
                            <p className="text-slate-500 text-xs uppercase font-bold mb-1">{labels.estReach}</p>
                            <p className="text-white font-bold font-mono text-xl">{prediction.estimatedViews}</p>
                         </div>
                         <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative bg-slate-900">
                             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" strokeDasharray={`${prediction.predictionScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                             </svg>
                             <span className="text-lg font-black text-white">{prediction.predictionScore}</span>
                         </div>
                    </div>
                </div>
                <p className="text-slate-300 mb-6 text-lg leading-relaxed">{prediction.reasoning}</p>
                <div className="flex justify-center">
                    <div className={`bg-slate-800 rounded-full p-2 transition-transform duration-300 ${expanded ? 'rotate-90 bg-pink-500 text-white' : 'text-slate-400'}`}>
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>

            {/* Expanded Concepts */}
            {expanded && prediction.concepts && (
                <div className="border-t border-slate-800 bg-slate-950/30 p-8 animate-slide-down">
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" /> {labels.automatedConcepts}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {prediction.concepts.map((concept, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800 transition-colors hover:border-slate-700 group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                                        concept.effortLevel === 'Low' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' :
                                        concept.effortLevel === 'Medium' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' :
                                        'bg-pink-900/30 text-pink-400 border border-pink-500/20'
                                    }`}>
                                        {concept.effortLevel} {labels.effort}
                                    </span>
                                </div>
                                <h5 className="font-bold text-white text-lg mb-3 line-clamp-2 group-hover:text-pink-400 transition-colors">{concept.title}</h5>
                                <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed">{concept.description}</p>
                                <div className="mt-auto pt-4 border-t border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{labels.hook}:</p>
                                    <p className="text-sm text-slate-200 italic font-medium">"{concept.hook}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
