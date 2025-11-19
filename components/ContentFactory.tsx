
import React, { useState, useEffect, useRef } from 'react';
import { Clapperboard, X, Copy, Check, Loader2, PlayCircle, Hash, Type, Image as ImageIcon, Download, Wand2, Sparkles, Video, RefreshCcw, AlertCircle, Scissors, Volume2, Layers, Music, Upload, FileAudio } from 'lucide-react';
import { Trend, ContentPackage, ScriptModifier } from '../types';
import { generateContentPackage, generateThumbnailImage, rewriteScript, generateVideoFootage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface ContentFactoryProps {
    trend: Trend;
    onClose: () => void;
}

// Mock Audio Data for the prototype (using placeholder reliable CDNs or simulate interaction)
// In a real app, these would be real MP3 URLs
const TRENDING_SOUNDS = [
    { id: 'phonk', nameKey: 'phonk', duration: '0:25', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'lofi', nameKey: 'lofi', duration: '0:40', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'upbeat', nameKey: 'upbeat', duration: '0:30', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'suspense', nameKey: 'suspense', duration: '0:20', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
];

export const ContentFactory: React.FC<ContentFactoryProps> = ({ trend, onClose }) => {
    const { language, t } = useLanguage();
    const [pkg, setPkg] = useState<ContentPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [rewriteLoading, setRewriteLoading] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'script' | 'metadata' | 'visuals' | 'video'>('script');
    const [copied, setCopied] = useState(false);

    // Video Editor State
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [volume, setVolume] = useState(1);
    const [trimStart, setTrimStart] = useState(0); // Percentage 0-100
    const [trimEnd, setTrimEnd] = useState(100); // Percentage 0-100
    const [activeTransition, setActiveTransition] = useState<'none' | 'fade' | 'zoom'>('none');
    
    // Audio Studio State
    const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
    const [audioVolume, setAudioVolume] = useState(0.5);
    const [audioName, setAudioName] = useState<string>('');

    useEffect(() => {
        const gen = async () => {
            const res = await generateContentPackage(trend.name, trend.exampleIdea, language);
            setPkg(res);
            setLoading(false);
        };
        gen();
    }, [trend, language]);

    const handleGenerateImage = async () => {
        if (!pkg) return;
        setImageLoading(true);
        const base64 = await generateThumbnailImage(`A TikTok video about ${trend.name}: ${pkg.thumbnailText} - ${pkg.script?.scenes?.[0]?.visual || ""}`);
        if (base64) {
            setPkg({ ...pkg, generatedImage: base64 });
        }
        setImageLoading(false);
    };

    const handleGenerateVideo = async () => {
        if (!pkg) return;
        setVideoLoading(true);
        setTrimStart(0);
        setTrimEnd(100);
        setVolume(1);
        setActiveTransition('none');
        setSelectedAudio(null); // Reset audio on new generation

        const description = `TikTok video about ${trend.name}. ${pkg.script?.scenes?.[0]?.visual || "Viral style content"}`;
        
        // Trigger key selection if needed
        if ((window as any).aistudio && !await (window as any).aistudio.hasSelectedApiKey()) {
             await (window as any).aistudio.openSelectKey();
        }

        const videoUrl = await generateVideoFootage(description);
        if (videoUrl) {
            setPkg({ ...pkg, generatedVideo: videoUrl });
        }
        setVideoLoading(false);
    };

    const handleRewrite = async (modifier: ScriptModifier) => {
        if (!pkg || !pkg.script) return;
        setRewriteLoading(true);
        const newScript = await rewriteScript(pkg.script, modifier, language);
        if (newScript) {
            setPkg({ ...pkg, script: newScript });
        }
        setRewriteLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fullCopy = () => {
        if (!pkg) return;
        const text = `TITLE: ${pkg.script.title}\n\nCAPTION: ${pkg.caption}\n\nTAGS: ${pkg.hashtags.join(' ')}\n\nHOOK: ${pkg.script.hook}\n\nSCRIPT:\n${pkg.script.scenes?.map(s => `- ${s.visual} (${s.audio})`).join('\n')}`;
        copyToClipboard(text);
    };

    // Video & Audio Sync Logic
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const vid = videoRef.current;
            const startSec = (trimStart / 100) * vid.duration;
            const endSec = (trimEnd / 100) * vid.duration;
            
            // Loop logic based on trim
            if (vid.currentTime < startSec || vid.currentTime > endSec) {
                vid.currentTime = startSec;
                if (audioRef.current) {
                    audioRef.current.currentTime = startSec;
                }
            }
        }
    };

    const handleVideoPlay = () => {
        if (audioRef.current && selectedAudio) {
            audioRef.current.play();
        }
    };

    const handleVideoPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleVideoSeek = () => {
        if (videoRef.current && audioRef.current) {
            audioRef.current.currentTime = videoRef.current.currentTime;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (videoRef.current) videoRef.current.volume = v;
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedAudio(url);
            setAudioName(file.name);
            if (audioRef.current) {
                audioRef.current.load();
                audioRef.current.volume = audioVolume;
            }
        }
    };

    const selectTrendingSound = (sound: typeof TRENDING_SOUNDS[0]) => {
        setSelectedAudio(sound.url);
        // @ts-ignore - dynamic key access
        setAudioName(t.factory.audioStudio.sounds[sound.nameKey] || sound.nameKey);
        if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.volume = audioVolume;
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = audioVolume;
        }
    }, [audioVolume]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wand2 className="text-pink-500" /> {t.factory.title}
                        </h3>
                        <p className="text-slate-400 text-sm">{t.factory.line} <span className="text-cyan-400 font-semibold">{trend.name}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                         {pkg && (
                             <button onClick={fullCopy} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                 {copied ? <Check size={14} /> : <Copy size={14} />} {t.factory.copy}
                             </button>
                         )}
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    {loading ? (
                        <div className="w-full flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 rounded-full"></div>
                                <Loader2 size={48} className="text-pink-500 animate-spin relative z-10" />
                            </div>
                            <p className="text-slate-300 animate-pulse">{t.factory.fabricating}</p>
                        </div>
                    ) : pkg ? (
                        <>
                            {/* Sidebar Tabs */}
                            <div className="w-20 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 gap-2">
                                <button 
                                    onClick={() => setActiveTab('script')}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'script' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
                                >
                                    <Clapperboard size={20} />
                                    <span className="hidden md:block font-medium">{t.factory.tabs.script}</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('metadata')}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'metadata' ? 'bg-slate-800 text-pink-400 shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
                                >
                                    <Hash size={20} />
                                    <span className="hidden md:block font-medium">{t.factory.tabs.metadata}</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('visuals')}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'visuals' ? 'bg-slate-800 text-purple-400 shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
                                >
                                    <ImageIcon size={20} />
                                    <span className="hidden md:block font-medium">{t.factory.tabs.visuals}</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('video')}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-slate-800 text-red-500 shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
                                >
                                    <Video size={20} />
                                    <span className="hidden md:block font-medium">{t.factory.tabs.video}</span>
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/50">
                                
                                {/* SCRIPT TAB */}
                                {activeTab === 'script' && pkg.script && (
                                    <div className="space-y-6 animate-slide-up">
                                        
                                        {/* Remix Engine */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles size={16} className="text-yellow-400" />
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t.factory.modifiers.title}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {['funny', 'genz', 'controversial', 'professional', 'shorter'].map((mod) => (
                                                    <button
                                                        key={mod}
                                                        disabled={rewriteLoading}
                                                        onClick={() => handleRewrite(mod as ScriptModifier)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all disabled:opacity-50"
                                                    >
                                                        {t.factory.modifiers[mod as keyof typeof t.factory.modifiers]}
                                                    </button>
                                                ))}
                                                {rewriteLoading && <Loader2 size={16} className="animate-spin text-cyan-500" />}
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{t.factory.workingTitle}</span>
                                            <h2 className="text-2xl font-bold text-white">{pkg.script.title}</h2>
                                        </div>

                                        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-xl p-5">
                                            <span className="text-xs font-bold text-pink-400 uppercase flex items-center gap-2 mb-2"><PlayCircle size={14}/> {t.factory.theHook}</span>
                                            <p className="text-xl font-bold text-white italic">"{pkg.script.hook}"</p>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-xs font-bold text-slate-500 uppercase ml-1">{t.factory.shotList}</span>
                                            {pkg.script.scenes?.map((scene, idx) => (
                                                <div key={idx} className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                                                    <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 font-bold shrink-0 border border-slate-800 text-lg">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-2">
                                                            <span className="text-[10px] text-cyan-500 font-bold uppercase bg-cyan-900/20 px-1.5 py-0.5 rounded">{t.factory.visual}</span>
                                                            <p className="text-slate-200 text-sm mt-1">{scene.visual}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-purple-500 font-bold uppercase bg-purple-900/20 px-1.5 py-0.5 rounded">{t.factory.audio}</span>
                                                            <p className="text-slate-300 text-sm mt-1 italic">"{scene.audio}"</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                                                        {scene.duration}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                         <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.factory.cta}</span>
                                            <p className="text-lg font-medium text-slate-200">"{pkg.script.cta}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* METADATA TAB */}
                                {activeTab === 'metadata' && (
                                    <div className="space-y-6 animate-slide-up">
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Type size={18} className="text-cyan-400" />
                                                <h3 className="text-lg font-bold text-white">{t.factory.caption}</h3>
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-lg text-slate-300 leading-relaxed border border-slate-800">
                                                {pkg.caption}
                                            </div>
                                            <button onClick={() => copyToClipboard(pkg.caption)} className="mt-3 text-xs text-cyan-400 font-bold hover:underline">{t.factory.copyCaption}</button>
                                        </div>

                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                                             <div className="flex items-center gap-2 mb-4">
                                                <Hash size={18} className="text-pink-400" />
                                                <h3 className="text-lg font-bold text-white">{t.factory.hashtags}</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-3 items-center justify-center p-4 bg-slate-900 rounded-lg min-h-[150px]">
                                                {pkg.hashtags?.map((tag, i) => {
                                                    const size = i === 0 ? 'text-xl' : i < 3 ? 'text-lg' : 'text-sm';
                                                    const opacity = i === 0 ? 'opacity-100' : 'opacity-80';
                                                    return (
                                                        <span key={tag} className={`${size} ${opacity} bg-pink-900/20 text-pink-400 px-3 py-1.5 rounded-full border border-pink-500/20 font-bold hover:scale-110 transition-transform cursor-default`}>
                                                            {tag}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                            <button onClick={() => copyToClipboard(pkg.hashtags.join(' '))} className="mt-4 text-xs text-pink-400 font-bold hover:underline">{t.factory.copyHashtags}</button>
                                        </div>

                                         <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                                             <div className="flex items-center gap-2 mb-4">
                                                <ImageIcon size={18} className="text-purple-400" />
                                                <h3 className="text-lg font-bold text-white">{t.factory.thumbIdea}</h3>
                                            </div>
                                            <div className="bg-white text-black p-4 rounded font-black text-center text-2xl uppercase tracking-tighter transform rotate-1 max-w-xs mx-auto shadow-xl">
                                                {pkg.thumbnailText}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* VISUALS TAB */}
                                {activeTab === 'visuals' && (
                                    <div className="flex flex-col items-center justify-center h-full animate-slide-up">
                                        {!pkg.generatedImage ? (
                                            <div className="text-center max-w-md">
                                                <div className="w-24 h-24 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                                                    <Wand2 size={40} className="text-purple-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">{t.factory.studioTitle}</h3>
                                                <p className="text-slate-400 mb-8">{t.factory.studioDesc}</p>
                                                <button 
                                                    onClick={handleGenerateImage}
                                                    disabled={imageLoading}
                                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-3 mx-auto"
                                                >
                                                    {imageLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                                                    {imageLoading ? t.factory.generating : t.factory.generate}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative group w-full max-w-xs mx-auto">
                                                <img 
                                                    src={pkg.generatedImage} 
                                                    alt="Generated Thumbnail" 
                                                    className="w-full rounded-2xl shadow-2xl border-4 border-slate-800"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                    <a 
                                                        href={pkg.generatedImage} 
                                                        download={`trendpulse-${trend.id}.jpg`}
                                                        className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                                    >
                                                        <Download size={20} /> {t.factory.download}
                                                    </a>
                                                </div>
                                                <button 
                                                    onClick={() => setPkg({...pkg, generatedImage: undefined})}
                                                    className="mt-6 text-slate-500 hover:text-white text-sm flex items-center gap-2 mx-auto"
                                                >
                                                    <RefreshCcw size={14} /> {t.factory.tryAgain}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* VIDEO TAB */}
                                {activeTab === 'video' && (
                                    <div className="flex flex-col items-center justify-start h-full animate-slide-up w-full">
                                        {videoLoading ? (
                                            <div className="text-center max-w-md mt-20">
                                                <div className="relative mb-6">
                                                    <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full"></div>
                                                    <Loader2 size={64} className="text-red-500 animate-spin relative z-10 mx-auto" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">{t.factory.rendering}</h3>
                                                <p className="text-slate-400 animate-pulse">Creating high-definition assets...</p>
                                            </div>
                                        ) : !pkg.generatedVideo ? (
                                            <div className="text-center max-w-md mt-10">
                                                <div className="w-24 h-24 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                                                    <Video size={40} className="text-red-500 relative z-10" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">{t.factory.videoStudioTitle}</h3>
                                                <p className="text-slate-400 mb-8">{t.factory.videoStudioDesc}</p>
                                                
                                                <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-xl mb-8 text-left">
                                                    <p className="text-xs text-yellow-400 flex items-start gap-2">
                                                        <AlertCircle className="shrink-0 mt-0.5" size={14} />
                                                        {t.factory.checkBilling}
                                                    </p>
                                                </div>

                                                <button 
                                                    onClick={handleGenerateVideo}
                                                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center gap-3 mx-auto"
                                                >
                                                    <Video size={20} />
                                                    {t.factory.renderVideo}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-lg mx-auto pb-10">
                                                {/* Editor Container */}
                                                <div className="relative group w-full mx-auto bg-black rounded-2xl shadow-2xl border-4 border-slate-800 overflow-hidden">
                                                    <video 
                                                        ref={videoRef}
                                                        src={pkg.generatedVideo} 
                                                        onTimeUpdate={handleTimeUpdate}
                                                        onPlay={handleVideoPlay}
                                                        onPause={handleVideoPause}
                                                        onSeeking={handleVideoSeek}
                                                        onSeeked={handleVideoSeek}
                                                        controls
                                                        autoPlay
                                                        loop
                                                        className={`w-full aspect-[9/16] object-cover transition-all duration-1000 
                                                            ${activeTransition === 'fade' ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}
                                                            ${activeTransition === 'zoom' ? 'scale-110' : 'scale-100'}
                                                        `}
                                                    />
                                                    {/* Hidden Audio Element for Sync */}
                                                    <audio ref={audioRef} src={selectedAudio || ''} loop />
                                                </div>
                                                
                                                {/* Editor Controls */}
                                                <div className="mt-6 space-y-4">
                                                    
                                                    {/* Audio Studio Panel */}
                                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                                         <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                                            <Music size={14} /> {t.factory.audioStudio.title}
                                                        </h4>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Trending Library */}
                                                            <div>
                                                                <h5 className="text-xs font-bold text-purple-400 uppercase mb-3">{t.factory.audioStudio.library}</h5>
                                                                <div className="space-y-2">
                                                                    {TRENDING_SOUNDS.map(sound => (
                                                                        <button 
                                                                            key={sound.id}
                                                                            onClick={() => selectTrendingSound(sound)}
                                                                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                                                                                selectedAudio === sound.url 
                                                                                ? 'bg-purple-500/20 border-purple-500 text-white' 
                                                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                                                                            }`}
                                                                        >
                                                                            <span className="flex items-center gap-2">
                                                                                {selectedAudio === sound.url && <FileAudio size={12} className="animate-pulse" />}
                                                                                {/* @ts-ignore */}
                                                                                {t.factory.audioStudio.sounds[sound.nameKey] || sound.nameKey}
                                                                            </span>
                                                                            <span className="font-mono opacity-50">{sound.duration}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Upload & Mixer */}
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-cyan-400 uppercase mb-3">{t.factory.audioStudio.upload}</h5>
                                                                    <label className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-white">
                                                                        <Upload size={16} />
                                                                        <span className="text-xs font-bold">MP3 / WAV</span>
                                                                        <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                                                                    </label>
                                                                    {audioName && (
                                                                        <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                                                             <Check size={12} /> {audioName}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">{t.factory.audioStudio.soundVolume}</h5>
                                                                        <span className="text-xs text-slate-500">{Math.round(audioVolume * 100)}%</span>
                                                                    </div>
                                                                    <input 
                                                                        type="range" 
                                                                        min="0" 
                                                                        max="1" 
                                                                        step="0.1"
                                                                        value={audioVolume}
                                                                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                                                                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Video Tools Panel */}
                                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                                            <Scissors size={14} /> {t.factory.editor.title}
                                                        </h4>

                                                        {/* Trim Controls */}
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs text-slate-400 font-bold">
                                                                <span>{t.factory.editor.trim}</span>
                                                                <span>{trimStart}% - {trimEnd}%</span>
                                                            </div>
                                                            <div className="flex gap-4 items-center">
                                                                <input 
                                                                    type="range" 
                                                                    min="0" 
                                                                    max="100" 
                                                                    value={trimStart}
                                                                    onChange={(e) => {
                                                                        const v = parseInt(e.target.value);
                                                                        if(v < trimEnd) setTrimStart(v);
                                                                    }}
                                                                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                                                />
                                                                <input 
                                                                    type="range" 
                                                                    min="0" 
                                                                    max="100" 
                                                                    value={trimEnd}
                                                                    onChange={(e) => {
                                                                        const v = parseInt(e.target.value);
                                                                        if(v > trimStart) setTrimEnd(v);
                                                                    }}
                                                                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-pink-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Volume */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                                                <Volume2 size={14} /> {t.factory.editor.volume} ({Math.round(volume * 100)}%)
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.1"
                                                                value={volume}
                                                                onChange={handleVolumeChange}
                                                                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500"
                                                            />
                                                        </div>

                                                        {/* Transitions */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-2">
                                                                <Layers size={14} /> {t.factory.editor.effects}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => setActiveTransition(activeTransition === 'fade' ? 'none' : 'fade')}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeTransition === 'fade' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                                                                >
                                                                    {t.factory.editor.fadeIn}
                                                                </button>
                                                                <button 
                                                                    onClick={() => setActiveTransition(activeTransition === 'zoom' ? 'none' : 'zoom')}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeTransition === 'zoom' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                                                                >
                                                                    {t.factory.editor.zoom}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex justify-center gap-4 mb-8">
                                                        <a 
                                                            href={pkg.generatedVideo} 
                                                            download={`trendpulse-video-${trend.id}.mp4`}
                                                            className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                                        >
                                                            <Download size={20} /> {t.factory.download}
                                                        </a>
                                                        <button 
                                                            onClick={() => setPkg({...pkg, generatedVideo: undefined})}
                                                            className="px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            <RefreshCcw size={20} /> {t.factory.tryAgain}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </>
                    ) : (
                         <div className="text-center text-red-400 p-10">{t.factory.failed}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
