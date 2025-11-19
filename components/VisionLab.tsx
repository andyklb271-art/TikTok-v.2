
import React, { useState, useRef } from 'react';
import { Eye, Upload, Scan, AlertCircle, CheckCircle, Zap, MousePointer2, Thermometer, Image as ImageIcon } from 'lucide-react';
import { analyzeVisualContent } from '../services/geminiService';
import { VisualAnalysis } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const VisionLab: React.FC = () => {
  const { language, t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisualAnalysis | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setScanning(true);
    // Artificial delay for visual effect
    await new Promise(r => setTimeout(r, 1500));
    const result = await analyzeVisualContent(image, language);
    setAnalysis(result);
    setScanning(false);
  };

  return (
    <div className="animate-fade-in pb-20">
        <header className="mb-10">
            <h2 className="text-5xl font-black text-white flex items-center gap-4 tracking-tighter">
                <Eye className="text-cyan-400 w-12 h-12" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                    {t.vision.title}
                </span>
            </h2>
            <p className="text-slate-400 mt-3 text-xl max-w-2xl font-light">
                {t.vision.desc}
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Input Zone */}
            <div className="space-y-6">
                <div 
                    className={`relative aspect-[9/16] max-h-[600px] bg-slate-900 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all ${!image ? 'border-slate-700 hover:border-cyan-500/50 cursor-pointer' : 'border-slate-800'}`}
                    onClick={() => !image && fileInputRef.current?.click()}
                >
                    {image ? (
                        <>
                            <img src={image} alt="Preview" className="w-full h-full object-contain" />
                            {scanning && (
                                <div className="absolute inset-0 bg-cyan-900/20 z-10">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_30px_5px_rgba(34,211,238,0.8)] animate-scan-down"></div>
                                </div>
                            )}
                             {analysis && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {analysis.heatmapFocus?.map((p, i) => (
                                        <div 
                                            key={i}
                                            className="absolute w-24 h-24 rounded-full bg-red-500/30 blur-2xl"
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setImage(null); setAnalysis(null); }}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-20"
                            >
                                <Upload size={18} className="rotate-45" />
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.vision.drop}</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">{t.vision.support}</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>

                {image && !scanning && !analysis && (
                    <button 
                        onClick={handleAnalyze}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xl py-5 rounded-2xl shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Scan size={24} /> {t.vision.scan}
                    </button>
                )}

                {scanning && (
                    <div className="text-center p-6 bg-slate-900 rounded-2xl border border-slate-800">
                        <p className="text-cyan-400 font-mono animate-pulse">{t.vision.processing}</p>
                    </div>
                )}
            </div>

            {/* Results Zone */}
            <div className="space-y-6">
                {!analysis ? (
                    <div className="h-full flex items-center justify-center opacity-30">
                         <div className="text-center">
                             <ImageIcon size={64} className="text-slate-500 mx-auto mb-4" />
                             <p className="text-xl font-bold text-slate-400">{t.vision.waiting}</p>
                         </div>
                    </div>
                ) : (
                    <div className="animate-slide-up space-y-6">
                        {/* Score Card */}
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 font-bold uppercase text-xs mb-1">{t.vision.score}</p>
                                <h3 className={`text-6xl font-black ${analysis.score > 80 ? 'text-green-400' : analysis.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {analysis.score}
                                </h3>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                                    analysis.ctrPrediction === 'Viral' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                    analysis.ctrPrediction === 'High' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                    {analysis.ctrPrediction} {t.vision.ctr}
                                </span>
                            </div>
                        </div>

                        {/* First Impression */}
                        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                             <h4 className="text-slate-400 font-bold text-sm uppercase mb-3 flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> {t.vision.impression}</h4>
                             <p className="text-white text-lg leading-relaxed">"{analysis.firstImpression}"</p>
                        </div>

                        {/* Heatmap & Psychology */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                 <h4 className="text-slate-400 font-bold text-sm uppercase mb-3 flex items-center gap-2"><Thermometer size={16} className="text-red-400"/> {t.vision.focus}</h4>
                                 <p className="text-sm text-slate-300">Analysis indicates high visual hierarchy based on heatmap data.</p>
                             </div>
                             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                 <h4 className="text-slate-400 font-bold text-sm uppercase mb-3 flex items-center gap-2"><MousePointer2 size={16} className="text-blue-400"/> {t.vision.colors}</h4>
                                 <p className="text-sm text-slate-300">{analysis.colorPsychology}</p>
                             </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-2xl">
                                <h4 className="text-green-400 font-bold text-sm uppercase mb-4 flex items-center gap-2"><CheckCircle size={16}/> {t.vision.strengths}</h4>
                                <ul className="space-y-2">
                                    {analysis.strengths?.map((s, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-green-400 rounded-full shrink-0"></span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl">
                                <h4 className="text-red-400 font-bold text-sm uppercase mb-4 flex items-center gap-2"><AlertCircle size={16}/> {t.vision.improvements}</h4>
                                <ul className="space-y-2">
                                    {analysis.improvements?.map((s, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full shrink-0"></span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
